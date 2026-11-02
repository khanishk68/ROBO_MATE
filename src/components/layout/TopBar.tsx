// src/components/layout/TopBar.tsx
"use client";
import React from "react";
import Link from "next/link";
import { Bell, ArrowLeftRight, Users, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { TopThemeBar } from "./ThemeToggle";
import { getGreeting } from "@/lib/utils";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { profile, activeProfile, selectProfile } = useAuth();
  const { isBoyMode, setPersona } = useTheme();

  const currentProfile = activeProfile || profile;
  const isKhanishk = currentProfile?.slug === "khanishk" || isBoyMode;
  const otherName = isKhanishk ? "Akshaya" : "Khanishk";
  const otherSlug = isKhanishk ? "akshaya" : "khanishk";

  const handleQuickSwitch = () => {
    selectProfile(otherSlug);
    setPersona(otherSlug === "akshaya" ? "girl" : "boy");
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b backdrop-blur-md transition-colors"
      style={{
        background: "var(--bg-primary)ee",
        borderColor: "var(--border-color)",
      }}
    >
      <div>
        {title ? (
          <div>
            <h1 className="font-bold text-base sm:text-lg" style={{ color: "var(--text-primary)" }}>
              {title}
            </h1>
            <p className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
              {currentProfile?.display_name || (isKhanishk ? "Khanishk" : "Akshaya")} • {currentProfile?.specialization || (isKhanishk ? "Robotics Systems Engineer" : "Industrial Product Designer")}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {getGreeting()},
            </p>
            <h1 className="font-bold text-sm sm:text-base flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
              <span>{currentProfile?.display_name || (isKhanishk ? "Khanishk" : "Akshaya")}</span>
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border hidden sm:inline-block"
                style={{
                  background: isKhanishk ? "rgba(37,99,235,0.15)" : "rgba(217,107,145,0.15)",
                  borderColor: isKhanishk ? "rgba(56,189,248,0.4)" : "rgba(245,184,204,0.6)",
                  color: isKhanishk ? "#38BDF8" : "#D96B91",
                }}
              >
                {isKhanishk ? "Robotics" : "Product Design"}
              </span>
            </h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Profile Switcher Button */}
        <button
          type="button"
          onClick={handleQuickSwitch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
          title={`Switch active profile to ${otherName}`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Switch to</span>
          <span
            className="font-bold"
            style={{ color: isKhanishk ? "#F5B8CC" : "#38BDF8" }}
          >
            {otherName}
          </span>
        </button>

        {/* Profile Selector Link */}
        <Link
          href="/profile-select"
          className="p-2 rounded-xl border transition-all hover:opacity-80"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
          }}
          title="Profile Selector Screen"
        >
          <Users className="w-4 h-4" />
        </Link>

        <TopThemeBar />

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl border transition-all hover:opacity-80"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
          }}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--primary)" }}
          />
        </button>
      </div>
    </header>
  );
}
