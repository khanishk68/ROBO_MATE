// src/app/api/notifications/send/route.ts
// Server-side push notification sender (used by cron jobs)
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import webpush from "web-push";

if (
  process.env.VAPID_PRIVATE_KEY &&
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_SUBJECT
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  // Only allow from Vercel Cron or service role
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Get all users with enabled reminders
  const { data: prefs } = await admin
    .from("reminder_preferences")
    .select("user_id, reminder_time, enabled")
    .eq("enabled", true);

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ message: "No active reminders" });
  }

  let sent = 0;

  for (const pref of prefs) {
    // Check if it's time to send (within 5-minute window)
    const [prefHour, prefMin] = (pref.reminder_time || "08:00").split(":").map(Number);
    const diffMinutes = Math.abs((currentHour * 60 + currentMinute) - (prefHour * 60 + prefMin));
    if (diffMinutes > 5) continue;

    // Get user's push subscriptions
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", pref.user_id);

    if (!subs || subs.length === 0) continue;

    // Get today's pending tasks count
    const { data: tasks } = await admin
      .from("task_occurrences")
      .select("id", { count: "exact" })
      .eq("owner_id", pref.user_id)
      .eq("scheduled_date", today)
      .in("status", ["pending", "in_progress"]);

    const pendingCount = tasks?.length || 0;
    const title = "📚 ROBO MATES Study Reminder";
    const body = pendingCount > 0
      ? `You have ${pendingCount} task${pendingCount > 1 ? "s" : ""} to complete today. Let's keep the streak going!`
      : "No tasks today — great job staying ahead! Check your roadmap.";

    const payload = JSON.stringify({
      title,
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: "/dashboard" },
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err) {
        console.error("Push failed:", sub.endpoint, err);
        // If subscription is invalid, remove it
        if ((err as { statusCode?: number }).statusCode === 410) {
          await admin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }

    // Log notification
    await admin.from("notifications").insert({
      user_id: pref.user_id,
      title,
      body,
      type: "reminder",
      sent_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ message: `Sent ${sent} notifications` });
}

