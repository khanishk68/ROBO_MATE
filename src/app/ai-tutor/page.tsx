// src/app/ai-tutor/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AITutorClient } from "./AITutorClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI Tutor" };

export default async function AITutorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("persona, display_name")
    .eq("id", user.id)
    .single();

  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("id, title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <AppShell title="AI Tutor" noPadding>
      <AITutorClient
        userId={user.id}
        persona={profile?.persona || "boy"}
        displayName={profile?.display_name || "Student"}
        initialConversations={conversations || []}
      />
    </AppShell>
  );
}

