// src/app/shared-journey/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SharedJourneyClient } from "./SharedJourneyClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shared Journey" };

export default async function SharedJourneyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch both profiles in the private workspace
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("persona");

  // Fetch checkins for both profiles
  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .order("study_date", { ascending: false });

  // Fetch modules for both profiles
  const { data: modules } = await supabase
    .from("roadmap_modules")
    .select("*, roadmap_months(*)");

  // Fetch shared robotics project
  const { data: project } = await supabase
    .from("projects")
    .select("*, project_tasks(*)")
    .limit(1)
    .single();

  return (
    <AppShell title="Shared Journey">
      <SharedJourneyClient
        currentUserId={user.id}
        profiles={profiles || []}
        checkins={checkins || []}
        modules={modules || []}
        project={project}
      />
    </AppShell>
  );
}
