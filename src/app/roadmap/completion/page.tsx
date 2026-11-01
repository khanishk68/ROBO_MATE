// src/app/roadmap/completion/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CompletionClient } from "./CompletionClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "12-Month Journey Completion" };

export default async function CompletionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all completed modules
  const { data: modules } = await supabase
    .from("roadmap_modules")
    .select("*, roadmap_months(*)")
    .eq("owner_id", user.id);

  // Fetch assessment results
  const { data: assessmentResults } = await supabase
    .from("assessment_results")
    .select("*, assessments(*)")
    .eq("user_id", user.id);

  // Fetch checkins for total study hours
  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id);

  // Fetch shared project
  const { data: project } = await supabase
    .from("projects")
    .select("*, project_tasks(*)")
    .limit(1)
    .single();

  return (
    <AppShell title="Program Completion">
      <CompletionClient
        profile={profile}
        modules={modules || []}
        results={assessmentResults || []}
        checkins={checkins || []}
        project={project}
      />
    </AppShell>
  );
}
