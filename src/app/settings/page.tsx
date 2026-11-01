// src/app/settings/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsClient } from "./SettingsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings & Preferences" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch reminder preferences
  const { data: reminders } = await supabase
    .from("reminder_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch journey settings (percentages)
  const { data: journeySettings } = await supabase
    .from("journey_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <AppShell title="Settings">
      <SettingsClient
        user={user}
        profile={profile}
        reminders={reminders}
        journeySettings={journeySettings}
      />
    </AppShell>
  );
}
