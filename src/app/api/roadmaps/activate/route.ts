// src/app/api/roadmaps/activate/route.ts
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { BOY_MODE_CURRICULUM, GIRL_MODE_CURRICULUM } from "@/lib/roadmap-seed-data";

const schema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date format", details: parsed.error.format() }, { status: 400 });
  }

  const { startDate } = parsed.data;

  // Calculate target date: 365 days after start
  const start = new Date(startDate);
  const target = new Date(start);
  target.setDate(target.getDate() + 365);
  const targetDate = target.toISOString().split("T")[0];

  const admin = await createAdminClient();

  try {
    // 1. Fetch user profile
    const { data: profile, error: profError } = await admin
      .from("profiles")
      .select("persona, display_name")
      .eq("id", user.id)
      .single();

    if (profError || !profile) throw new Error("Profile not found");

    const persona = profile.persona || "boy";
    const curriculum = persona === "boy" ? BOY_MODE_CURRICULUM : GIRL_MODE_CURRICULUM;

    // 2. Update user profile with journey dates
    await admin
      .from("profiles")
      .update({
        journey_start_date: startDate,
        journey_target_date: targetDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // 3. Ensure roadmap_months exist for this persona
    for (const m of curriculum) {
      const { data: existingMonth } = await admin
        .from("roadmap_months")
        .select("id")
        .eq("persona", persona)
        .eq("month_number", m.monthNumber)
        .single();

      let monthId = existingMonth?.id;

      if (!monthId) {
        const { data: insertedMonth } = await admin
          .from("roadmap_months")
          .insert({
            persona,
            month_number: m.monthNumber,
            title: m.title,
            description: m.description,
            main_subjects: m.mainSubjects,
            deliverable: m.deliverable,
            estimated_hours: m.estimatedHours,
          })
          .select("id")
          .single();

        monthId = insertedMonth?.id;
      }

      if (!monthId) continue;

      // 4. Create modules for Month 1 (and upcoming modules) if not already created
      if (m.modules && m.modules.length > 0) {
        for (let i = 0; i < m.modules.length; i++) {
          const mod = m.modules[i];

          // Compute module start and end dates relative to user's startDate
          const modStart = new Date(start);
          modStart.setDate(modStart.getDate() + (mod.weekNumber - 1) * 7);
          const modEnd = new Date(modStart);
          modEnd.setDate(modEnd.getDate() + 6);

          const { data: existingMod } = await admin
            .from("roadmap_modules")
            .select("id")
            .eq("owner_id", user.id)
            .eq("month_id", monthId)
            .eq("week_number", mod.weekNumber)
            .single();

          let moduleId = existingMod?.id;

          if (!moduleId) {
            const { data: insertedMod } = await admin
              .from("roadmap_modules")
              .insert({
                owner_id: user.id,
                month_id: monthId,
                title: mod.title,
                description: mod.description,
                week_number: mod.weekNumber,
                sequence: mod.weekNumber,
                start_date: modStart.toISOString().split("T")[0],
                end_date: modEnd.toISOString().split("T")[0],
                status: mod.weekNumber === 1 ? "in_progress" : "not_started",
                completion_percentage: 0,
              })
              .select("id")
              .single();

            moduleId = insertedMod?.id;
          }

          if (!moduleId) continue;

          // 5. Create study tasks for this module
          for (let taskIdx = 0; taskIdx < mod.tasks.length; taskIdx++) {
            const t = mod.tasks[taskIdx];

            const { data: existingTask } = await admin
              .from("study_tasks")
              .select("id")
              .eq("owner_id", user.id)
              .eq("module_id", moduleId)
              .eq("title", t.title)
              .single();

            let taskId = existingTask?.id;

            if (!taskId) {
              const { data: insertedTask } = await admin
                .from("study_tasks")
                .insert({
                  owner_id: user.id,
                  module_id: moduleId,
                  title: t.title,
                  subject: t.subject,
                  duration_minutes: t.durationMinutes,
                  priority: t.priority,
                  task_type: t.taskType,
                  learning_objective: t.learningObjective,
                })
                .select("id")
                .single();

              taskId = insertedTask?.id;
            }

            if (!taskId) continue;

            // Schedule occurrence for this task
            const taskDate = new Date(modStart);
            taskDate.setDate(taskDate.getDate() + (taskIdx % 5)); // spread across weekdays
            const taskDateStr = taskDate.toISOString().split("T")[0];

            const { data: existingOcc } = await admin
              .from("task_occurrences")
              .select("id")
              .eq("task_id", taskId)
              .eq("owner_id", user.id)
              .eq("scheduled_date", taskDateStr)
              .single();

            if (!existingOcc) {
              await admin.from("task_occurrences").insert({
                task_id: taskId,
                owner_id: user.id,
                scheduled_date: taskDateStr,
                original_due_date: taskDateStr,
                status: "pending",
                carry_forward_count: 0,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      startDate,
      targetDate,
      message: `Activated 12-month ${persona === "boy" ? "Robotics Engineering" : "Industrial Design"} journey!`,
    });
  } catch (err: unknown) {
    console.error("Activate journey error:", err);
    const message = err instanceof Error ? err.message : "Activation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

