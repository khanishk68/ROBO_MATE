// src/app/api/assessments/submit/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import type { AssessmentQuestion } from "@/types/database";

const schema = z.object({
  assessmentId: z.string().uuid(),
  answers: z.record(z.string(), z.string()),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { assessmentId, answers } = parsed.data;

  try {
    // 1. Fetch assessment
    const { data: assessment, error: fetchErr } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .eq("owner_id", user.id)
      .single();

    if (fetchErr || !assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const questions = (assessment.questions || []) as AssessmentQuestion[];
    let score = 0;
    let maxScore = 0;
    const weakTopics: string[] = [];

    questions.forEach((q) => {
      maxScore += q.points || 10;
      const userAnswer = (answers[q.id] || "").trim().toLowerCase();
      const correctAnswer = (q.correct_answer || "").trim().toLowerCase();

      if (userAnswer && correctAnswer && (userAnswer === correctAnswer || userAnswer.includes(correctAnswer))) {
        score += q.points || 10;
      } else {
        weakTopics.push(q.question.slice(0, 50));
      }
    });

    // 2. Save result
    const { data: result, error: saveErr } = await supabase
      .from("assessment_results")
      .insert({
        assessment_id: assessmentId,
        user_id: user.id,
        score,
        max_score: maxScore,
        answers,
        weak_topics: weakTopics,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveErr) throw saveErr;

    // 3. If tied to a module, mark it complete if score >= 70%
    if (assessment.module_id && score / (maxScore || 1) >= 0.7) {
      await supabase
        .from("roadmap_modules")
        .update({
          status: "completed",
          completion_percentage: 100,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessment.module_id);
    }

    return NextResponse.json({
      success: true,
      score,
      maxScore,
      percentage: Math.round((score / (maxScore || 1)) * 100),
      weakTopics,
      resultId: result.id,
    });
  } catch (err: unknown) {
    console.error("Assessment submit error:", err);
    const message = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

