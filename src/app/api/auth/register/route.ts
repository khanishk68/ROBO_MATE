// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password, workspaceName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const admin = await createAdminClient();

    // 1. Check existing users
    const { data: userListData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) console.error("Admin listUsers error:", listError);

    const existingUsers = userListData?.users || [];
    const isExistingUser = existingUsers.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;

    if (isExistingUser) {
      // User exists — update password and confirm email so they can sign in immediately
      const existing = existingUsers.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      )!;
      userId = existing.id;

      const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { workspace_name: workspaceName || "ROBO MATES Private Workspace" },
      });

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    } else {
      // 2. Create new auto-confirmed single co-founder account
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          workspace_name: workspaceName || "ROBO MATES Private Workspace",
        },
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      if (!newUser?.user) {
        return NextResponse.json(
          { error: "Failed to create user record." },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
    }

    // 3. Ensure both Khanishk and Akshaya profiles exist for this account
    try {
      // Provision Khanishk
      await admin.from("profiles").upsert(
        {
          account_id: userId,
          slug: "khanishk",
          display_name: "Khanishk",
          persona: "boy",
          specialization: "Robotics Systems Engineer",
          theme_mode: "dark",
          daily_study_hours: 5.0,
          study_start_time: "09:00",
          study_days: [1, 2, 3, 4, 5, 6],
          journey_start_date: "2026-11-08",
          journey_target_date: "2027-11-07",
          timezone: "Asia/Kolkata",
        },
        { onConflict: "account_id,slug" }
      );

      // Provision Akshaya
      await admin.from("profiles").upsert(
        {
          account_id: userId,
          slug: "akshaya",
          display_name: "Akshaya",
          persona: "girl",
          specialization: "Industrial & Robotics Product Designer",
          theme_mode: "light",
          daily_study_hours: 2.75,
          study_start_time: "10:00",
          study_days: [1, 2, 3, 4, 5, 6],
          journey_start_date: "2026-11-08",
          journey_target_date: "2027-11-07",
          timezone: "Asia/Kolkata",
        },
        { onConflict: "account_id,slug" }
      );

      // Ensure Workspace
      const { data: ws } = await admin.from("workspaces").select("id").limit(1).single();
      let wsId = ws?.id;
      if (!wsId) {
        const { data: newWs } = await admin.from("workspaces").insert({
          name: workspaceName || "ROBO MATES Private Workspace",
          member_limit: 2,
        }).select().single();
        wsId = newWs?.id;
      }

      // Ensure Shared AMR Project exists
      if (wsId) {
        const { data: proj } = await admin.from("projects").select("id").eq("workspace_id", wsId).limit(1).single();
        if (!proj) {
          await admin.from("projects").insert({
            workspace_id: wsId,
            title: "ROBO MATES AMR — Autonomous Mobile Robot",
            description: "Shared long-term capstone: design, simulate, construct, test, and demonstrate an autonomous mobile robot.",
            start_date: "2026-11-08",
            target_date: "2027-11-07",
          });
        }
      }
    } catch (pe: any) {
      console.warn("Notice during profile/workspace provisioning:", pe?.message || pe);
    }

    return NextResponse.json({
      success: true,
      message: "ROBO MATES Common Account created and founder profiles initialized!",
      userId,
    });
  } catch (err: any) {
    console.error("Registration route unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
