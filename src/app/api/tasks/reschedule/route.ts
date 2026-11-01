// src/app/api/tasks/reschedule/route.ts
// Automatic missed-task rescheduling (idempotent)
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAX_CARRY = 3;
const FLAG_AFTER_DAYS = 7;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  try {
    // Get profile timezone
    const { data: profile } = await admin
      .from("profiles")
      .select("timezone")
      .eq("id", user.id)
      .single();

    // Find all missed/pending tasks from PREVIOUS days
    const { data: pastPending, error: fetchError } = await admin
      .from("task_occurrences")
      .select("*, study_tasks(*)")
      .eq("owner_id", user.id)
      .in("status", ["pending", "in_progress"])
      .lt("scheduled_date", today)
      .neq("status", "skipped")
      .order("scheduled_date");

    if (fetchError) throw fetchError;
    if (!pastPending || pastPending.length === 0) {
      return NextResponse.json({ message: "No missed tasks to reschedule", count: 0 });
    }

    // Mark them as missed
    const pastIds = pastPending.map((o) => o.id);
    await admin
      .from("task_occurrences")
      .update({ status: "missed" })
      .in("id", pastIds)
      .eq("owner_id", user.id);

    // Filter which ones should be carried (not skipped, not exceeded carry limit)
    const toCarry = pastPending.filter((o) => {
      if (o.status === "skipped") return false;
      if ((o.carry_forward_count || 0) >= FLAG_AFTER_DAYS) return false;
      return true;
    });

    // Get existing occurrences for today to prevent duplication
    const { data: todayOccs } = await admin
      .from("task_occurrences")
      .select("task_id")
      .eq("owner_id", user.id)
      .eq("scheduled_date", today);

    const todayTaskIds = new Set((todayOccs || []).map((o) => o.task_id));

    // Carry forward: max MAX_CARRY per day, rest go to tomorrow
    let scheduleDate = today;
    let dayCount = 0;
    let carriedToday = 0;
    const results: string[] = [];

    for (const occ of toCarry) {
      if (todayTaskIds.has(occ.task_id)) continue; // Already exists

      if (carriedToday >= MAX_CARRY) {
        // Move to next available day
        const nextDate = new Date(scheduleDate);
        nextDate.setDate(nextDate.getDate() + 1);
        scheduleDate = nextDate.toISOString().split("T")[0];
        carriedToday = 0;
        dayCount++;
      }

      const newCarryCount = (occ.carry_forward_count || 0) + 1;

      // Insert new occurrence
      const { error: insertError } = await admin
        .from("task_occurrences")
        .insert({
          task_id: occ.task_id,
          owner_id: user.id,
          scheduled_date: scheduleDate,
          original_due_date: occ.original_due_date,
          status: "pending",
          carry_forward_count: newCarryCount,
        });

      if (!insertError) {
        todayTaskIds.add(occ.task_id);
        carriedToday++;
        results.push(occ.task_id);

        // Flag if exceeded threshold
        if (newCarryCount >= FLAG_AFTER_DAYS) {
          await admin.from("notifications").insert({
            user_id: user.id,
            title: "Task needs replanning",
            body: `"${occ.study_tasks?.title}" has been missed for ${FLAG_AFTER_DAYS}+ days. Please reschedule manually.`,
            type: "overdue",
            sent_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      message: `Rescheduled ${results.length} missed tasks`,
      count: results.length,
      rescheduled: results,
    });
  } catch (err) {
    console.error("Reschedule error:", err);
    return NextResponse.json({ error: "Rescheduling failed" }, { status: 500 });
  }
}

