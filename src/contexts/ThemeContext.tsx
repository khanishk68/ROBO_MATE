// src/contexts/ThemeContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Persona, ThemeMode } from "@/types/database";

interface ThemeContextValue {
  persona: Persona;
  themeMode: ThemeMode;
  setPersona: (p: Persona) => void;
  setThemeMode: (m: ThemeMode) => void;
  toggleThemeMode: () => void;
  isDark: boolean;
  isBoyMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialPersona = "boy",
  initialThemeMode = "dark",
}: {
  children: React.ReactNode;
  initialPersona?: Persona;
  initialThemeMode?: ThemeMode;
}) {
  const [persona, setPersonaState] = useState<Persona>(initialPersona);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialThemeMode);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    document.documentElement.dataset.persona = p;
    localStorage.setItem("rm-persona", p);
  };

  const setThemeMode = (m: ThemeMode) => {
    setThemeModeState(m);
    document.documentElement.dataset.theme = m;
    localStorage.setItem("rm-theme", m);
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const savedPersona = localStorage.getItem("rm-persona") as Persona | null;
    const savedTheme = localStorage.getItem("rm-theme") as ThemeMode | null;
    if (savedPersona) setPersonaState(savedPersona);
    if (savedTheme) setThemeModeState(savedTheme);

    document.documentElement.dataset.persona = savedPersona || initialPersona;
    document.documentElement.dataset.theme = savedTheme || initialThemeMode;
  }, [initialPersona, initialThemeMode]);

  useEffect(() => {
    document.documentElement.dataset.persona = persona;
    document.documentElement.dataset.theme = themeMode;
  }, [persona, themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        persona,
        themeMode,
        setPersona,
        setThemeMode,
        toggleThemeMode,
        isDark: themeMode === "dark",
        isBoyMode: persona === "boy",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

