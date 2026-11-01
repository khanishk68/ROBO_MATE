// src/app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardClient } from "./DashboardClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const today = new Date().toISOString().split("T")[0];

  // Fetch today's tasks
  const { data: todayOccurrences } = await supabase
    .from("task_occurrences")
    .select("*, study_tasks(*)")
    .eq("owner_id", user.id)
    .eq("scheduled_date", today)
    .order("created_at");

  // Fetch streak data (last 30 days of check-ins)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .gte("study_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("study_date", { ascending: false });

  // Fetch roadmap progress
  const { data: modules } = await supabase
    .from("roadmap_modules")
    .select("*, roadmap_months(*)")
    .eq("owner_id", user.id)
    .order("sequence");

  // Fetch active project
  const { data: project } = await supabase
    .from("projects")
    .select("*, project_tasks(*)")
    .limit(1)
    .single();

  // Fetch recent AI conversations
  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(3);

  return (
    <AppShell>
      <DashboardClient
        profile={profile}
        todayOccurrences={todayOccurrences || []}
        checkins={checkins || []}
        modules={modules || []}
        project={project}
        conversations={conversations || []}
        today={today}
      />
    </AppShell>
  );
}

