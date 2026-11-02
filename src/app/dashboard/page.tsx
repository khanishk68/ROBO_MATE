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

  // Fetch account profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .or(`account_id.eq.${user.id},id.eq.${user.id}`);

  const activeProfile = profiles?.[0] || null;
  const today = new Date().toISOString().split("T")[0];

  // Fetch today's tasks
  const { data: todayOccurrences } = await supabase
    .from("task_occurrences")
    .select("*, study_tasks(*)")
    .eq("scheduled_date", today)
    .order("created_at");

  // Fetch check-ins
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .gte("study_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("study_date", { ascending: false });

  // Fetch roadmap modules
  const { data: modules } = await supabase
    .from("roadmap_modules")
    .select("*, roadmap_months(*)")
    .order("sequence");

  // Fetch shared AMR project
  const { data: project } = await supabase
    .from("projects")
    .select("*, project_tasks(*)")
    .limit(1)
    .single();

  // Fetch AI conversations
  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("id, title, created_at")
    .order("updated_at", { ascending: false })
    .limit(5);

  return (
    <AppShell title="Dashboard">
      <DashboardClient
        profile={activeProfile}
        todayOccurrences={todayOccurrences || []}
        checkins={checkins || []}
        modules={modules || []}
        project={project || null}
        conversations={conversations || []}
        today={today}
      />
    </AppShell>
  );
}
