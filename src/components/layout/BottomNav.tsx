// src/components/layout/BottomNav.tsx
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Bot,
  FolderKanban,
  BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",   label: "Home",        icon: LayoutDashboard },
  { href: "/curriculum",  label: "Curriculum",  icon: BookOpen },
  { href: "/planner",     label: "Planner",     icon: CalendarDays },
  { href: "/ai-tutor",    label: "AI Tutor",    icon: Bot },
  { href: "/projects",    label: "Projects",    icon: FolderKanban },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md safe-bottom w-full max-w-full"
      style={{
        background: "var(--bg-secondary)f2",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center justify-around px-1 py-1.5 min-h-[56px] max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl transition-all min-w-[54px] min-h-[46px] select-none"
              style={{
                background: active ? "var(--bg-card)" : "transparent",
              }}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className="w-5 h-5 transition-transform active:scale-90"
                  style={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
                />
                {active && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "var(--neon)" }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-bold tracking-tight"
                style={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
