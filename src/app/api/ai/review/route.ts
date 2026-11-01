// src/app/api/ai/review/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const schema = z.object({
  monthNumber: z.number().min(1).max(12),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.format() }, { status: 400 });
  }

  const { monthNumber } = parsed.data;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
  }

  try {
    // 1. Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, persona, journey_start_date")
      .eq("id", user.id)
      .single();

    const persona = (profile as any)?.persona || "boy";
    const displayName = (profile as any)?.display_name || "Student";

    // 2. Fetch the target month info
    const { data: monthInfo } = await supabase
      .from("roadmap_months")
      .select("*")
      .eq("persona", persona)
      .eq("month_number", monthNumber)
      .single();

    // 3. Fetch modules for this month
    const { data: modules } = await supabase
      .from("roadmap_modules")
      .select("id, title, status, completion_percentage, week_number")
      .eq("owner_id", user.id)
      .eq("month_id", (monthInfo as any)?.id || "")
      .order("sequence");

    const moduleIds = ((modules as any[]) || []).map((m) => m.id);

    // 4. Fetch study tasks and occurrences
    let completedTasksCount = 0;
    let missedTasksCount = 0;
    let totalMinutesStudied = 0;

    if (moduleIds.length > 0) {
      const { data: tasks } = await supabase
        .from("study_tasks")
        .select("id, title, subject, duration_minutes")
        .in("module_id", moduleIds);

      const taskIds = ((tasks as any[]) || []).map((t) => t.id);

      if (taskIds.length > 0) {
        const { data: occurrences } = await supabase
          .from("task_occurrences")
          .select("status, actual_duration_minutes, carry_forward_count")
          .in("task_id", taskIds)
          .eq("owner_id", user.id);

        if (occurrences) {
          (occurrences as any[]).forEach((occ) => {
            if (occ.status === "completed") {
              completedTasksCount++;
              totalMinutesStudied += occ.actual_duration_minutes || 45;
            } else if (occ.status === "missed") {
              missedTasksCount++;
            }
          });
        }
      }
    }

    // 5. Fetch assessments for this month
    const { data: assessments } = await supabase
      .from("assessments")
      .select("id, title, assessment_results(score, max_score, weak_topics)")
      .eq("owner_id", user.id)
      .eq("month_number", monthNumber);

    const assessmentSummary = ((assessments as any[]) || []).map((a) => {
      const res = a.assessment_results?.[0];
      return {
        title: a.title,
        score: res ? `${res.score}/${res.max_score}` : "Not attempted",
        weakTopics: res?.weak_topics || [],
      };
    });

    // 6. Build prompt strictly grounded in DB records
    const roleTitle = persona === "boy" ? "Robotics Engineering Mentor" : "Industrial Design Mentor";
    const prompt = `You are the ${roleTitle} reviewing Month ${monthNumber}: "${(monthInfo as any)?.title || 'Stage ' + monthNumber}" for ${displayName}.

REAL DATABASE RECORDS FOR THIS MONTH:
- Deliverable Target: ${(monthInfo as any)?.deliverable || "N/A"}
- Main Subjects: ${(monthInfo as any)?.main_subjects?.join(", ") || "General"}
- Modules: ${JSON.stringify(modules || [])}
- Completed Study Tasks: ${completedTasksCount}
- Missed / Carried Tasks: ${missedTasksCount}
- Total Study Hours Recorded: ${(totalMinutesStudied / 60).toFixed(1)} hours
- Assessments Completed: ${JSON.stringify(assessmentSummary)}

INSTRUCTIONS:
1. Provide an honest, encouraging, and constructive Monthly Progress Review.
2. Structure your review into:
   - ### 🌟 Monthly Learning Summary
   - ### ✅ Completed Objectives & Deliverables
   - ### ⚠️ Areas for Improvement & Weak Topics
   - ### 🛠️ Recommended Practical Revision
   - ### 🚀 Preparation for Month ${monthNumber < 12 ? monthNumber + 1 : 12}
3. STRICT RULE: Do NOT invent fake achievements, grades, or projects that are not present in the records. Be realistic and actionable.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const review = response.text || "Unable to generate review at this time.";

    return NextResponse.json({
      monthNumber,
      monthTitle: (monthInfo as any)?.title,
      review,
      stats: {
        completedTasksCount,
        missedTasksCount,
        totalHours: (totalMinutesStudied / 60).toFixed(1),
        assessments: assessmentSummary,
      },
    });
  } catch (err: unknown) {
    console.error("AI Review error:", err);
    const message = err instanceof Error ? err.message : "Review generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
