// src/components/layout/TopBar.tsx
"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeftRight, Users, Sun, Moon, Cpu, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getGreeting } from "@/lib/utils";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { profile, activeProfile, selectProfile } = useAuth();
  const { isBoyMode, setPersona, themeMode, toggleThemeMode } = useTheme();

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
      className="sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 border-b backdrop-blur-md transition-colors w-full max-w-full overflow-hidden"
      style={{
        background: "var(--bg-primary)f2",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Left: Page Title / Founder Branding */}
      <div className="min-w-0 flex-1 mr-2">
        {title ? (
          <div>
            <h1 className="font-bold text-sm sm:text-base lg:text-lg truncate" style={{ color: "var(--text-primary)" }}>
              {title}
            </h1>
            <p className="text-[11px] truncate hidden sm:block" style={{ color: "var(--text-muted)" }}>
              {currentProfile?.display_name || (isKhanishk ? "Khanishk" : "Akshaya")} • {currentProfile?.specialization || (isKhanishk ? "Robotics Systems Engineer" : "Industrial Product Designer")}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[10px] sm:text-xs" style={{ color: "var(--text-muted)" }}>
              {getGreeting()},
            </p>
            <h1 className="font-bold text-xs sm:text-sm lg:text-base flex items-center gap-1.5 truncate" style={{ color: "var(--text-primary)" }}>
              <span className="truncate">{currentProfile?.display_name || (isKhanishk ? "Khanishk" : "Akshaya")}</span>
              <span
                className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border hidden sm:inline-block flex-shrink-0"
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

      {/* Right: Quick Actions (strictly responsive, never overflows) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Quick Profile Switcher Button */}
        <button
          type="button"
          onClick={handleQuickSwitch}
          className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
          title={`Switch active profile to ${otherName}`}
        >
          <ArrowLeftRight className="w-3 h-3 text-sky-400 flex-shrink-0" />
          <span className="hidden xs:inline sm:inline">Switch to</span>
          <span
            className="font-bold truncate max-w-[65px] sm:max-w-none"
            style={{ color: isKhanishk ? "#F5B8CC" : "#38BDF8" }}
          >
            {otherName}
          </span>
        </button>

        {/* Profile Selector Screen Link */}
        <Link
          href="/profile-select"
          className="p-1.5 sm:p-2 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
          }}
          title="Select Profile"
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>

        {/* Dark/Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleThemeMode}
          className="p-1.5 sm:p-2 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
          }}
          title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {themeMode === "dark" ? (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
          )}
        </button>

        {/* Persona toggle button on larger screens */}
        <button
          type="button"
          onClick={() => setPersona(isBoyMode ? "girl" : "boy")}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all hover:opacity-80 text-xs font-medium flex-shrink-0"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
          }}
          title={`Switch mode`}
        >
          {isBoyMode ? (
            <>
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>Girl Mode</span>
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Boy Mode</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
