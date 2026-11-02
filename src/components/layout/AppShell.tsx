// src/components/layout/AppShell.tsx
"use client";
import React from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  noPadding?: boolean;
}

export function AppShell({ children, title, noPadding }: AppShellProps) {
  const { profile, loading } = useAuth();
  const { persona, themeMode } = useTheme();

  // Sync theme from profile when profile loads
  React.useEffect(() => {
    if (profile) {
      const savedPersona = localStorage.getItem("rm-persona");
      const savedTheme = localStorage.getItem("rm-theme");
      // Only use profile values if user hasn't overridden locally
      if (!savedPersona) {
        document.documentElement.dataset.persona = profile.persona;
      }
      if (!savedTheme) {
        document.documentElement.dataset.theme = profile.theme_mode;
      }
    }
  }, [profile]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: "var(--gradient-accent)" }}
          >
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Loading ROBO MATES...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />

      <div className="flex-1 min-w-0 w-full flex flex-col overflow-hidden">
        <TopBar title={title} />

        <main
          className={cn(
            "flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden",
            !noPadding && "p-3 sm:p-4 lg:p-6",
            "pb-24 lg:pb-8" // generous mobile bottom nav clearance
          )}
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

