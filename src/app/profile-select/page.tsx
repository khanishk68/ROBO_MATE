// src/app/profile-select/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Cpu, Palette, ArrowRight, Zap, Clock, Shield, LogOut } from "lucide-react";
import type { ProfileSlug } from "@/types/database";

export default function ProfileSelectPage() {
  const router = useRouter();
  const { selectProfile, activeProfile, signOut } = useAuth();
  const { setPersona } = useTheme();

  const handleSelect = (slug: ProfileSlug) => {
    selectProfile(slug);
    setPersona(slug === "khanishk" ? "boy" : "girl");
    router.push("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 tech-grid transition-all duration-300 w-full max-w-full overflow-x-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Brand Header */}
      <div className="text-center mb-6 sm:mb-10 max-w-xl animate-in fade-in slide-in-from-top-4 duration-500 w-full">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl"
          style={{ background: "var(--gradient-accent)" }}
        >
          <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-1 sm:mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Who is learning today?
        </h1>
        <p className="text-xs sm:text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
          ROBO MATES Private Co-Founder Workspace • 8 Nov 2026 – 7 Nov 2027
        </p>
      </div>

      {/* Netflix-style 2-Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full max-w-3xl">
        {/* Profile 1: KHANISHK */}
        <button
          type="button"
          onClick={() => handleSelect("khanishk")}
          className="group relative flex flex-col items-start p-5 sm:p-8 rounded-2xl sm:rounded-3xl border text-left transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 w-full"
          style={{
            background: "linear-gradient(145deg, #0D1929 0%, #111E32 100%)",
            borderColor: activeProfile?.slug === "khanishk" ? "#38BDF8" : "#1E3A5F",
            boxShadow: activeProfile?.slug === "khanishk" ? "0 0 35px rgba(56,189,248,0.25)" : "none",
          }}
        >
          {/* Active indicator */}
          {activeProfile?.slug === "khanishk" && (
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-sky-500/20 text-sky-400 border border-sky-500/40">
              Active
            </span>
          )}

          {/* Profile Avatar / Icon */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-blue-600 to-sky-400 shadow-lg group-hover:scale-105 transition-transform">
            <Cpu className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-black text-slate-100 tracking-wide mb-1 flex items-center gap-2">
            KHANISHK
          </h2>
          <p className="text-sm font-semibold text-sky-400 mb-4">
            Robotics Systems Engineer
          </p>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Autonomous systems, embedded C++, ROS 2 nodes, Gazebo physical simulation, computer vision, and autonomous mobile robot kinematics.
          </p>

          {/* Stats pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/70 border border-blue-800 text-blue-200">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> 4–5 Hours / Day
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              52 Weeks • 365 Days
            </span>
            <span className="px-3 py-1 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-300">
              Boy Mode
            </span>
          </div>

          {/* Action indicator */}
          <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-slate-800 text-sky-400 font-bold text-sm group-hover:text-sky-300">
            <span>Enter Khanishk&apos;s Lab</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </button>

        {/* Profile 2: AKSHAYA */}
        <button
          type="button"
          onClick={() => handleSelect("akshaya")}
          className="group relative flex flex-col items-start p-5 sm:p-8 rounded-2xl sm:rounded-3xl border text-left transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/50 w-full"
          style={{
            background: "linear-gradient(145deg, #FFF0F3 0%, #FFF8F6 100%)",
            borderColor: activeProfile?.slug === "akshaya" ? "#D96B91" : "#F5B8CC",
            boxShadow: activeProfile?.slug === "akshaya" ? "0 0 35px rgba(217,107,145,0.25)" : "none",
          }}
        >
          {/* Active indicator */}
          {activeProfile?.slug === "akshaya" && (
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-pink-100 text-pink-700 border border-pink-300">
              Active
            </span>
          )}

          {/* Profile Avatar / Icon */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-pink-400 via-rose-400 to-purple-400 shadow-lg group-hover:scale-105 transition-transform">
            <Palette className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-black text-zinc-900 tracking-wide mb-1 flex items-center gap-2">
            AKSHAYA
          </h2>
          <p className="text-sm font-semibold text-rose-600 mb-4">
            Industrial & Robotics Product Designer
          </p>

          <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
            Industrial sketching, perspective rendering, Fusion 360, CAD chassis modeling, DFM/DFA, human-robot interaction ergonomics, and physical prototyping.
          </p>

          {/* Stats pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-100 border border-pink-200 text-pink-800">
              <Clock className="w-3.5 h-3.5 text-pink-600" /> 2–3 Hours / Day
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-pink-200 text-zinc-700">
              52 Weeks • 365 Days
            </span>
            <span className="px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700">
              Girl Mode
            </span>
          </div>

          {/* Action indicator */}
          <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-pink-200 text-pink-600 font-bold text-sm group-hover:text-pink-700">
            <span>Enter Akshaya&apos;s Studio</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Footer / Logout */}
      <div className="mt-12 flex items-center gap-6 text-xs text-muted-foreground">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:underline flex items-center gap-1 font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Continue to Dashboard
        </button>
        <span>•</span>
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="hover:underline flex items-center gap-1.5 font-medium text-red-400 hover:text-red-300"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );
}
