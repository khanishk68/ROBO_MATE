// src/components/layout/BottomNav.tsx
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Map,
  Bot,
  Users,
  BarChart3,
  FolderKanban,
  BookOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",      label: "Home",      icon: LayoutDashboard },
  { href: "/planner",        label: "Planner",   icon: CalendarDays },
  { href: "/roadmap",        label: "Roadmap",   icon: Map },
  { href: "/ai-tutor",       label: "AI Tutor",  icon: Bot },
  { href: "/progress",       label: "Progress",  icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t safe-bottom"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
            >
              <Icon
                className="w-5 h-5"
                style={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
              />
              <span
                className="text-[10px] font-medium"
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

