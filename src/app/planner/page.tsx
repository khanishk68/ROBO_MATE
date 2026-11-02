// src/app/planner/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlannerClient } from "./PlannerClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Daily Planner" };

export default async function PlannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Fetch profiles belonging to this account
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .or(`account_id.eq.${user.id},id.eq.${user.id}`);

  const activeProfile = profiles?.[0] || null;

  // Get roadmap modules
  const { data: modules } = await supabase
    .from("roadmap_modules")
    .select("id, title, week_number, roadmap_months(month_number, title)")
    .order("sequence");

  return (
    <AppShell title="Daily Planner">
      <PlannerClient
        userId={user.id}
        profile={activeProfile}
        modules={modules || []}
        today={today}
      />
    </AppShell>
  );
}
