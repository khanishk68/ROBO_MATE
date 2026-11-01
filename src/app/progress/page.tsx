// src/app/progress/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProgressClient } from "./ProgressClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Progress Centre" };

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch checkins for the last 60 days
  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("study_date", { ascending: false });

  // Fetch user modules
  const { data: modules } = await supabase
    .from("roadmap_modules")
    .select("*, roadmap_months(*)")
    .eq("owner_id", user.id);

  // Fetch assessment results
  const { data: assessmentResults } = await supabase
    .from("assessment_results")
    .select("*, assessments(*)")
    .eq("user_id", user.id);

  return (
    <AppShell title="Progress Centre">
      <ProgressClient
        userId={user.id}
        profile={profile}
        checkins={checkins || []}
        modules={modules || []}
        assessmentResults={assessmentResults || []}
      />
    </AppShell>
  );
}
