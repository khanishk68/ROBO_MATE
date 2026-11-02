// src/components/layout/Sidebar.tsx
"use client";
import React, { useState } from "react";
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
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",       icon: LayoutDashboard },
  { href: "/roadmap",    label: "My Roadmap",      icon: Map },
  { href: "/planner",    label: "Daily Planner",   icon: CalendarDays },
  { href: "/curriculum", label: "Curriculum",      icon: BookOpen },
  { href: "/library",    label: "Study Library",   icon: FileText },
  { href: "/projects",   label: "Projects",        icon: FolderKanban },
  { href: "/progress",   label: "Progress",        icon: BarChart3 },
  { href: "/ai-tutor",   label: "AI Tutor",        icon: Bot },
  { href: "/settings",   label: "Settings",        icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { isBoyMode } = useTheme();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-r transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-64"
      )}
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--gradient-accent)" }}
        >
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-black text-sm gradient-text tracking-wide">ROBO MATES</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isBoyMode ? "Boy Mode" : "Girl Mode"}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "text-white"
                  : "hover:opacity-80"
              )}
              style={
                active
                  ? { background: "var(--primary)", color: "white" }
                  : { color: "var(--text-secondary)" }
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        className="p-3 border-t space-y-2"
        style={{ borderColor: "var(--border-color)" }}
      >
        {!collapsed && (
          <Link
            href="/profile-select"
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all hover:scale-[1.01] mb-2"
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border-color)",
            }}
            title="Switch Co-Founder Profile"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "var(--gradient-accent)" }}
            >
              {profile?.display_name?.[0]?.toUpperCase() || (isBoyMode ? "K" : "A")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                {profile?.display_name || (isBoyMode ? "Khanishk" : "Akshaya")}
              </p>
              <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                {isBoyMode ? "Robotics Systems" : "Product Designer"}
              </p>
            </div>
            <Users className="w-4 h-4 text-sky-400" />
          </Link>
        )}

        <div className="flex items-center gap-1">
          <ThemeToggle compact={collapsed} />
          <button
            onClick={signOut}
            className={cn(
              "flex items-center gap-2 px-2 py-2 rounded-lg transition-colors hover:opacity-80 text-sm",
              collapsed ? "w-full justify-center" : ""
            )}
            style={{ color: "var(--text-muted)" }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs transition-colors hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}

