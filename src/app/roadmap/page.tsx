// src/app/roadmap/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RoadmapClient } from "./RoadmapClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "12-Month Learning Roadmap" };

export default async function RoadmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const persona = profile?.persona || "boy";

  // Fetch roadmap months for this persona
  const { data: roadmapMonths } = await supabase
    .from("roadmap_months")
    .select("*")
    .eq("persona", persona)
    .order("month_number");

  // Fetch user's modules
  const { data: userModules } = await supabase
    .from("roadmap_modules")
    .select("*, roadmap_months(*)")
    .eq("owner_id", user.id)
    .order("sequence");

  // Fetch assessments and results
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*, assessment_results(*)")
    .eq("owner_id", user.id);

  // Fetch checkins for streak
  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("study_date", { ascending: false })
    .limit(30);

  return (
    <AppShell title="12-Month Roadmap">
      <RoadmapClient
        userId={user.id}
        profile={profile}
        months={roadmapMonths || []}
        userModules={userModules || []}
        assessments={assessments || []}
        checkins={checkins || []}
      />
    </AppShell>
  );
}
