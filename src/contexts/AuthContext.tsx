// src/contexts/AuthContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, ProfileSlug } from "@/types/database";

export const DEFAULT_KHANISHK_PROFILE: Profile = {
  id: "khanishk-founder-profile-id",
  account_id: "shared-co-founder-account",
  slug: "khanishk",
  display_name: "Khanishk",
  persona: "boy",
  specialization: "Robotics Systems Engineer",
  avatar_url: null,
  timezone: "Asia/Kolkata",
  theme_mode: "dark",
  daily_study_hours: 5.0,
  study_start_time: "09:00",
  study_days: [1, 2, 3, 4, 5, 6],
  journey_start_date: "2026-11-08",
  journey_target_date: "2027-11-07",
  created_at: "2026-11-02T00:00:00Z",
  updated_at: "2026-11-02T00:00:00Z",
};

export const DEFAULT_AKSHAYA_PROFILE: Profile = {
  id: "akshaya-founder-profile-id",
  account_id: "shared-co-founder-account",
  slug: "akshaya",
  display_name: "Akshaya",
  persona: "girl",
  specialization: "Industrial & Robotics Product Designer",
  avatar_url: null,
  timezone: "Asia/Kolkata",
  theme_mode: "light",
  daily_study_hours: 2.75,
  study_start_time: "10:00",
  study_days: [1, 2, 3, 4, 5, 6],
  journey_start_date: "2026-11-08",
  journey_target_date: "2027-11-07",
  created_at: "2026-11-02T00:00:00Z",
  updated_at: "2026-11-02T00:00:00Z",
};

interface AuthContextValue {
  user: User | null;
  profile: Profile | null; // Currently active profile (alias to activeProfile)
  activeProfile: Profile | null;
  profiles: Profile[]; // Both Khanishk and Akshaya
  loading: boolean;
  selectProfile: (slug: ProfileSlug) => void;
  signOut: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([DEFAULT_KHANISHK_PROFILE, DEFAULT_AKSHAYA_PROFILE]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(DEFAULT_KHANISHK_PROFILE);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const applyProfileTheme = useCallback((p: Profile) => {
    document.documentElement.dataset.persona = p.persona;
    document.documentElement.dataset.theme = p.theme_mode;
    localStorage.setItem("rm-persona", p.persona);
    localStorage.setItem("rm-theme", p.theme_mode);
    localStorage.setItem("rm-active-profile", p.slug);
  }, []);

  const selectProfile = useCallback((slug: ProfileSlug) => {
    const found = profiles.find((p) => p.slug === slug) ||
      (slug === "akshaya" ? DEFAULT_AKSHAYA_PROFILE : DEFAULT_KHANISHK_PROFILE);

    setActiveProfile(found);
    applyProfileTheme(found);
  }, [profiles, applyProfileTheme]);

  const fetchProfiles = useCallback(async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`account_id.eq.${accountId},id.eq.${accountId}`);

      if (!error && data && data.length > 0) {
        setProfiles(data as Profile[]);

        // Check stored preferred profile
        const savedSlug = localStorage.getItem("rm-active-profile") as ProfileSlug | null;
        const current = (data as Profile[]).find((p) => p.slug === savedSlug) || data[0] as Profile;
        setActiveProfile(current);
        applyProfileTheme(current);
      } else {
        // Fallback to default co-founders
        setProfiles([DEFAULT_KHANISHK_PROFILE, DEFAULT_AKSHAYA_PROFILE]);
        const savedSlug = localStorage.getItem("rm-active-profile") as ProfileSlug | null;
        const current = savedSlug === "akshaya" ? DEFAULT_AKSHAYA_PROFILE : DEFAULT_KHANISHK_PROFILE;
        setActiveProfile(current);
        applyProfileTheme(current);
      }
    } catch (e) {
      console.warn("Notice: Using local founder profiles:", e);
      setProfiles([DEFAULT_KHANISHK_PROFILE, DEFAULT_AKSHAYA_PROFILE]);
      setActiveProfile(DEFAULT_KHANISHK_PROFILE);
      applyProfileTheme(DEFAULT_KHANISHK_PROFILE);
    }
  }, [supabase, applyProfileTheme]);

  const refreshProfiles = useCallback(async () => {
    if (user) await fetchProfiles(user.id);
  }, [user, fetchProfiles]);

  useEffect(() => {
    // Initial profile from localStorage while auth loads
    const savedSlug = (typeof window !== "undefined" ? localStorage.getItem("rm-active-profile") : null) as ProfileSlug | null;
    const initial = savedSlug === "akshaya" ? DEFAULT_AKSHAYA_PROFILE : DEFAULT_KHANISHK_PROFILE;
    setActiveProfile(initial);
    applyProfileTheme(initial);

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProfiles(user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchProfiles(u.id);
        } else {
          // If signed out, keep active profile intact for offline preview or reset
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfiles, applyProfileTheme]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("rm-active-profile");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: activeProfile,
        activeProfile,
        profiles,
        loading,
        selectProfile,
        signOut,
        refreshProfiles,
        refreshProfile: refreshProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
