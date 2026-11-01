// src/components/layout/TopBar.tsx
"use client";
import React from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { TopThemeBar } from "./ThemeToggle";
import { getGreeting } from "@/lib/utils";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { profile } = useAuth();
  const { isBoyMode } = useTheme();

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b backdrop-blur-sm"
      style={{
        background: "var(--bg-primary)cc",
        borderColor: "var(--border-color)",
      }}
    >
      <div>
        {title ? (
          <h1 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
        ) : (
          <div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {getGreeting()},
            </p>
            <h1 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
              {profile?.display_name || (isBoyMode ? "Robotics Engineer" : "Design Student")} 👋
            </h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TopThemeBar />
        <button
          className="relative p-2 rounded-xl border transition-all hover:opacity-80"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
          }}
        >
          <Bell className="w-4 h-4" />
          {/* Notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--primary)" }}
          />
        </button>
      </div>
    </header>
  );
}

