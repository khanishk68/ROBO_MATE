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
  FolderKanban,
  BookOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",   label: "Home",        icon: LayoutDashboard },
  { href: "/curriculum",  label: "Curriculum",  icon: BookOpen },
  { href: "/planner",     label: "Planner",     icon: CalendarDays },
  { href: "/library",     label: "Library",     icon: FileText },
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
      <div className="flex items-center justify-around px-1 py-1.5 min-h-[56px]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-xl transition-all min-w-[48px] min-h-[44px]"
            >
              <Icon
                className="w-5 h-5 transition-transform active:scale-90"
                style={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
              />
              <span
                className="text-[10px] font-semibold"
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

