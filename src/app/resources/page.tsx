// src/app/resources/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ResourcesClient } from "./ResourcesClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Study Resources & Library" };

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch study resources
  const { data: resources } = await supabase
    .from("study_resources")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch modules for linking
  const { data: modules } = await supabase
    .from("roadmap_modules")
    .select("id, title")
    .eq("owner_id", user.id);

  return (
    <AppShell title="Study Resources">
      <ResourcesClient
        userId={user.id}
        initialResources={resources || []}
        modules={modules || []}
      />
    </AppShell>
  );
}
