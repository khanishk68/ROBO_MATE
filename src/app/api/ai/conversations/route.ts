// src/app/api/ai/conversations/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  let query = supabase
    .from("ai_conversations")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (profileId) {
    query = query.or(`user_id.eq.${profileId},user_id.eq.${user.id}`);
  } else {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforced

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

