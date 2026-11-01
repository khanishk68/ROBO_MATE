// src/components/layout/ThemeToggle.tsx
"use client";
import React from "react";
import { Sun, Moon, Cpu, Heart } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const { themeMode, toggleThemeMode, persona, setPersona, isBoyMode } = useTheme();

  return (
    <div className={cn("flex items-center gap-1", compact ? "flex-col w-full" : "flex-1")}>
      {/* Dark/Light toggle */}
      <button
        onClick={toggleThemeMode}
        className="p-2 rounded-lg transition-colors hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
        title={themeMode === "dark" ? "Switch to light" : "Switch to dark"}
      >
        {themeMode === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      {/* Boy/Girl toggle */}
      <button
        onClick={() => setPersona(isBoyMode ? "girl" : "boy")}
        className="p-2 rounded-lg transition-colors hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
        title={`Switch to ${isBoyMode ? "Girl" : "Boy"} Mode`}
      >
        {isBoyMode ? (
          <Heart className="w-4 h-4" />
        ) : (
          <Cpu className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export function TopThemeBar() {
  const { themeMode, toggleThemeMode, persona, setPersona, isBoyMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleThemeMode}
        className="p-2 rounded-xl border transition-all hover:opacity-80"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          color: "var(--text-secondary)",
        }}
        title={themeMode === "dark" ? "Light mode" : "Dark mode"}
      >
        {themeMode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button
        onClick={() => setPersona(isBoyMode ? "girl" : "boy")}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all hover:opacity-80 text-xs font-medium"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          color: "var(--text-secondary)",
        }}
      >
        {isBoyMode ? (
          <>
            <Heart className="w-3.5 h-3.5" />
            <span>Girl Mode</span>
          </>
        ) : (
          <>
            <Cpu className="w-3.5 h-3.5" />
            <span>Boy Mode</span>
          </>
        )}
      </button>
    </div>
  );
}

