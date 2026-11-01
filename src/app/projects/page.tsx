// src/app/projects/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectsClient } from "./ProjectsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shared Robotics Projects" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("*, project_tasks(*), project_attachments(*), project_notes(*)")
    .limit(1)
    .single();

  // Fetch profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, persona");

  return (
    <AppShell title="Shared Robotics Projects">
      <ProjectsClient
        userId={user.id}
        project={project}
        profiles={profiles || []}
      />
    </AppShell>
  );
}
