// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password, displayName, persona } = await request.json();

    if (!email || !password || !displayName || !persona) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, displayName, and persona are required." },
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

    // 1. Strict 2-member limit enforcement on backend
    const { data: userListData, error: listError } = await admin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Admin listUsers error:", listError);
    }

    const existingUsers = userListData?.users || [];

    // Filter out probe or test accounts if needed, or check total accounts
    const isExistingUser = existingUsers.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isExistingUser && existingUsers.length >= 2) {
      return NextResponse.json(
        {
          error:
            "ROBO MATES Private Workspace limit reached. Exactly 2 co-founders are allowed in this private workspace.",
        },
        { status: 403 }
      );
    }

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
        user_metadata: { display_name: displayName, persona },
      });

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    } else {
      // 2. Create new auto-confirmed user (NO EMAIL SENT = NO RATE LIMIT!)
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: displayName,
          persona,
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

    // 3. Upsert into profiles table if table exists
    const defaultTheme = persona === "boy" ? "dark" : "light";
    try {
      const { error: profileError } = await admin.from("profiles").upsert(
        {
          id: userId,
          display_name: displayName,
          persona,
          theme_mode: defaultTheme,
          timezone: "Asia/Kolkata",
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.warn("Notice: public.profiles table could not be written to yet:", profileError.message);
      }
    } catch (pe) {
      console.warn("Notice: Profiles table write skipped (may need schema migration):", pe);
    }

    return NextResponse.json({
      success: true,
      message: "Co-Founder Account registered and auto-confirmed successfully!",
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
