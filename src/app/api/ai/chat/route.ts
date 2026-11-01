// src/app/api/ai/chat/route.ts
// Secure Gemini AI chat endpoint
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const schema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
});

// System prompts per persona
function buildSystemPrompt(persona: "boy" | "girl", context: {
  displayName: string;
  currentModule?: string;
  todayTasks: string[];
  recentMessages: { role: string; content: string }[];
}): string {
  const { displayName, currentModule, todayTasks } = context;

  const base = persona === "boy"
    ? `You are a highly experienced Robotics Engineering Mentor and personal tutor for ${displayName}.
Your student is pursuing a career in Robotics Systems Engineering and is working through a 12-month learning journey.
The student's learning path covers: Python, C++, Linux, Arduino, ESP32, Motor Control, ROS 2, Gazebo, OpenCV, Computer Vision, SLAM, and Autonomous Navigation.`
    : `You are a world-class Industrial Design and Robotics Product Design Mentor for ${displayName}.
Your student is pursuing a career in Industrial Design with a focus on robotics products.
The student's learning path covers: Drawing fundamentals, Industrial Product Sketching, Fusion 360, Blender, Rhino 3D, CAD, DFM/DFA, Ergonomics, Human-Robot Interaction, and Portfolio Development.`;

  const contextSection = [
    currentModule ? `Current learning module: ${currentModule}` : "",
    todayTasks.length > 0
      ? `Today's study tasks:\n${todayTasks.map((t) => `- ${t}`).join("\n")}`
      : "No tasks scheduled for today.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${base}

STUDENT CONTEXT:
${contextSection}

TEACHING GUIDELINES:
- Explain concepts from beginner level when needed — never assume prior knowledge
- Give practical, real-world examples that connect to robotics projects
- When asked for code, provide clean, well-commented examples
- For debugging help, ask clarifying questions before giving the full answer
- Give hints before full solutions to encourage independent thinking
- Be encouraging but honest — do not inflate achievements
- Keep responses focused and actionable
- Use markdown formatting for code blocks, lists, and headings
- Only claim a task is completed if the student explicitly confirms it
- Never mix information between students

You are a trusted personal mentor. Be warm, patient, and thorough.`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.format() }, { status: 400 });
  }

  const { conversationId, message } = parsed.data;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("persona, display_name")
      .eq("id", user.id)
      .single();

    const persona = profile?.persona || "boy";

    // Today's tasks context
    const today = new Date().toISOString().split("T")[0];
    const { data: todayOccs } = await supabase
      .from("task_occurrences")
      .select("study_tasks(title, subject)")
      .eq("owner_id", user.id)
      .eq("scheduled_date", today);

    const todayTasks = (todayOccs || [])
      .map((o: any) => o.study_tasks)
      .filter(Boolean)
      .map((t: any) => `${t.title} (${t.subject})`);

    // Current module
    const { data: currentModule } = await supabase
      .from("roadmap_modules")
      .select("title")
      .eq("owner_id", user.id)
      .eq("status", "in_progress")
      .order("sequence")
      .limit(1)
      .single();

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const title = message.length > 60 ? message.slice(0, 60) + "…" : message;
      const { data: newConv, error } = await supabase
        .from("ai_conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();

      if (error) throw error;
      convId = newConv.id;
    }

    // Get conversation history (last 20 messages for context window)
    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    const recentMessages = (history || []).map((m: any) => ({
      role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
      content: m.content,
    }));

    // Save user message
    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    // Update conversation timestamp
    await supabase
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);

    // Build Gemini request
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const systemPrompt = buildSystemPrompt(persona, {
      displayName: profile?.display_name || "Student",
      currentModule: currentModule?.title,
      todayTasks,
      recentMessages,
    });

    // Build history for Gemini
    const contents = [
      ...recentMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      {
        role: "user" as const,
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      config: {
        systemInstruction: systemPrompt,
      },
      contents,
    });

    const reply = response.text || "I couldn't generate a response. Please try again.";

    // Save assistant message
    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({
      reply,
      conversationId: convId,
    });
  } catch (err: unknown) {
    console.error("AI chat error:", err);
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
