// src/components/layout/TopBar.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowLeftRight,
  Users,
  Sun,
  Moon,
  Cpu,
  Heart,
  LayoutDashboard,
  CalendarDays,
  Map,
  Bot,
  FolderKanban,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Share2,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getGreeting } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title?: string;
}

const drawerLinks = [
  { href: "/dashboard",      label: "Dashboard",       icon: LayoutDashboard, badge: "Home" },
  { href: "/curriculum",     label: "Curriculum",      icon: BookOpen,        badge: "30-Day Plan" },
  { href: "/planner",        label: "Daily Planner",   icon: CalendarDays },
  { href: "/roadmap",        label: "My Roadmap",      icon: Map,             badge: "52 Weeks" },
  { href: "/library",        label: "Study Library",   icon: FileText,        badge: "PDFs" },
  { href: "/projects",       label: "Projects & AMR",  icon: FolderKanban,    badge: "Capstone" },
  { href: "/ai-tutor",       label: "AI Tutor",        icon: Bot,             badge: "Mentor" },
  { href: "/progress",       label: "Progress",        icon: BarChart3 },
  { href: "/shared-journey", label: "Shared Journey",  icon: Share2 },
  { href: "/settings",       label: "Settings",        icon: Settings },
];

export function TopBar({ title }: TopBarProps) {
  const { profile, activeProfile, selectProfile, signOut } = useAuth();
  const { isBoyMode, setPersona, themeMode, toggleThemeMode } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const currentProfile = activeProfile || profile;
  const isKhanishk = currentProfile?.slug === "khanishk" || isBoyMode;
  const otherName = isKhanishk ? "Akshaya" : "Khanishk";
  const otherSlug = isKhanishk ? "akshaya" : "khanishk";

  const handleQuickSwitch = () => {
    selectProfile(otherSlug);
    setPersona(otherSlug === "akshaya" ? "girl" : "boy");
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 border-b backdrop-blur-md transition-colors w-full max-w-full overflow-hidden"
        style={{
          background: "var(--bg-primary)f2",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Left: Mobile Drawer Trigger + Page Title / Founder Branding */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:opacity-80 active:scale-95 flex-shrink-0"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
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
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Quick Profile Switcher Button */}
          <button
            type="button"
            onClick={handleQuickSwitch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex-shrink-0 min-h-[36px]"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            title={`Switch active profile to ${otherName}`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <span className="hidden sm:inline">Switch to</span>
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
            className="w-9 h-9 rounded-xl border transition-all hover:opacity-80 flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
            title="Select Profile"
          >
            <Users className="w-4 h-4" />
          </Link>

          {/* Dark/Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="w-9 h-9 rounded-xl border transition-all hover:opacity-80 flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
            title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {themeMode === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-400" />
            )}
          </button>

          {/* Persona toggle button on medium/large screens */}
          <button
            type="button"
            onClick={() => setPersona(isBoyMode ? "girl" : "boy")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all hover:opacity-80 text-xs font-medium flex-shrink-0"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
            title="Switch persona mode"
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

      {/* Mobile Slide-Over Navigation Drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="relative z-10 w-72 max-w-[85vw] h-full flex flex-col shadow-2xl border-r p-4 overflow-y-auto animate-in slide-in-from-left duration-200"
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--gradient-accent)" }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-sm tracking-wide gradient-text">ROBO MATES</h2>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {isKhanishk ? "Boy Mode • Robotics" : "Girl Mode • Design"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:opacity-80"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-muted)",
                }}
                aria-label="Close Navigation Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Profile Switcher inside Drawer */}
            <div className="py-3 border-b" style={{ borderColor: "var(--border-color)" }}>
              <button
                type="button"
                onClick={() => {
                  handleQuickSwitch();
                  setDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all hover:opacity-90"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span className="truncate" style={{ color: "var(--text-secondary)" }}>
                    Switch to {otherName}
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
                  style={{
                    background: isKhanishk ? "rgba(217,107,145,0.15)" : "rgba(37,99,235,0.15)",
                    borderColor: isKhanishk ? "rgba(245,184,204,0.6)" : "rgba(56,189,248,0.4)",
                    color: isKhanishk ? "#F5B8CC" : "#38BDF8",
                  }}
                >
                  {isKhanishk ? "Girl Mode" : "Boy Mode"}
                </span>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 py-3 space-y-1">
              {drawerLinks.map(({ href, label, icon: Icon, badge }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                      active ? "shadow-sm" : "hover:opacity-80"
                    )}
                    style={{
                      background: active ? "var(--primary)" : "transparent",
                      color: active ? "white" : "var(--text-secondary)",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </div>
                    {badge && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: active ? "rgba(255,255,255,0.2)" : "var(--bg-secondary)",
                          color: active ? "white" : "var(--text-muted)",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--border-color)" }}>
              <Link
                href="/profile-select"
                onClick={() => setDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold hover:opacity-80"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Profile Selection</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                style={{ borderColor: "var(--border-color)" }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
