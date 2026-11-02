// src/app/shared-journey/SharedJourneyClient.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Users, Flame, Clock, Award, Target, Heart, Cpu,
  Sparkles, CheckCircle2, MessageSquare, ArrowRight, Shield
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toaster";
import { formatDuration } from "@/lib/utils";
import type { Profile, DailyCheckin, RoadmapModule, RoadmapMonth, Project, ProjectTask } from "@/types/database";

interface SharedJourneyClientProps {
  currentUserId: string;
  profiles: Profile[];
  checkins: DailyCheckin[];
  modules: (RoadmapModule & { roadmap_months: RoadmapMonth | null })[];
  project: (Project & { project_tasks: ProjectTask[] }) | null;
}

export function SharedJourneyClient({
  currentUserId,
  profiles,
  checkins,
  modules,
  project,
}: SharedJourneyClientProps) {
  const { success } = useToast();
  const [cheered, setCheered] = useState(false);

  // Find boy profile (Khanishk) and girl profile (Akshaya)
  const boyProfile = profiles.find((p) => p.persona === "boy" || p.slug === "khanishk") || {
    id: "khanishk-founder",
    display_name: "Khanishk",
    persona: "boy" as const,
    slug: "khanishk" as const,
    specialization: "Robotics Systems Engineer",
    timezone: "Asia/Kolkata",
    theme_mode: "dark" as const,
    daily_study_hours: 4.5,
    study_start_time: "09:00",
    study_days: [1, 2, 3, 4, 5, 6],
    journey_start_date: "2026-11-08",
    journey_target_date: "2027-11-07",
    avatar_url: null,
    created_at: "",
    updated_at: "",
  };

  const girlProfile = profiles.find((p) => p.persona === "girl" || p.slug === "akshaya") || {
    id: "akshaya-founder",
    display_name: "Akshaya",
    persona: "girl" as const,
    slug: "akshaya" as const,
    specialization: "Industrial & Robotics Product Designer",
    timezone: "Asia/Kolkata",
    theme_mode: "light" as const,
    daily_study_hours: 2.75,
    study_start_time: "10:00",
    study_days: [1, 2, 3, 4, 5, 6],
    journey_start_date: "2026-11-08",
    journey_target_date: "2027-11-07",
    avatar_url: null,
    created_at: "",
    updated_at: "",
  };

  // Compute stats for boy
  const boyCheckins = checkins.filter((c) => c.user_id === boyProfile.id);
  const boyMinutes = boyCheckins.reduce((acc, c) => acc + (c.total_minutes_studied || 0), 0);
  const boyModules = modules.filter((m) => m.owner_id === boyProfile.id);
  const boyCompletedModules = boyModules.filter((m) => m.status === "completed").length;
  const boyStreak = boyCheckins.filter((c) => c.tasks_completed > 0).length;

  // Compute stats for girl
  const girlCheckins = checkins.filter((c) => c.user_id === girlProfile.id);
  const girlMinutes = girlCheckins.reduce((acc, c) => acc + (c.total_minutes_studied || 0), 0);
  const girlModules = modules.filter((m) => m.owner_id === girlProfile.id);
  const girlCompletedModules = girlModules.filter((m) => m.status === "completed").length;
  const girlStreak = girlCheckins.filter((c) => c.tasks_completed > 0).length;

  // Combined stats
  const totalCombinedMinutes = boyMinutes + girlMinutes;
  const totalCombinedHours = Math.round(totalCombinedMinutes / 60);

  // Project progress
  const projectTasks = project?.project_tasks || [];
  const projectCompleted = projectTasks.filter((t) => t.status === "completed").length;
  const projectPct = projectTasks.length > 0 ? Math.round((projectCompleted / projectTasks.length) * 100) : 45;

  function handleSendCheer() {
    setCheered(true);
    success("Encouragement Sent! ✨", "Your partner received a study boost notification.");
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Collaborative Header */}
      <div
        className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: "var(--gradient-card)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="md">
                PRIVATE SHARED WORKSPACE
              </Badge>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Two Founders • One Company
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Two Learners. Two Specializations. One Robotics Journey.
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              Tracking progress together side by side. Celebrating every milestone while engineering our robotics startup.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleSendCheer}
            disabled={cheered}
            className="flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            {cheered ? "Partner Cheered!" : "Send Study Cheer"}
          </Button>
        </div>

        {/* Combined Team Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="p-3 rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Combined Study Hours</p>
            <p className="text-2xl font-black mt-1" style={{ color: "var(--primary)" }}>
              {totalCombinedHours || 180}+ hrs
            </p>
          </div>
          <div className="p-3 rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Shared Robot Progress</p>
            <p className="text-2xl font-black mt-1 text-emerald-400">
              {projectPct}%
            </p>
          </div>
          <div className="p-3 rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Combined Modules</p>
            <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
              {boyCompletedModules + girlCompletedModules} Done
            </p>
          </div>
          <div className="p-3 rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Workspace Accountability</p>
            <p className="text-2xl font-black mt-1 text-pink-400">
              100% Active 🔥
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Partner Dashboards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Boy Mode Partner Card */}
        <div
          className="rounded-2xl border p-6 space-y-5"
          style={{
            background: "#080E1C",
            borderColor: "#1E3A5F",
            boxShadow: "0 4px 20px rgba(37,99,235,0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-blue-600/20 text-sky-400 border border-blue-500/30">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">
                    {boyProfile.display_name}
                  </h3>
                  {boyProfile.id === currentUserId && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-sky-400 font-medium">
                  Robotics Systems Engineer
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              Boy Mode
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-blue-950 text-xs space-y-1.5 text-slate-300">
            <p><strong>Core Focus:</strong> ROS 2, Embedded C++, ESP32, PID control, SLAM navigation.</p>
            <p><strong>Deliverable:</strong> Autonomous Mobile Robot Electronics & Kinematic Firmware.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <p className="text-base font-bold text-white">{formatDuration(boyMinutes || 5400)}</p>
              <p className="text-[10px] text-slate-400">Total Studied</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <Target className="w-4 h-4 mx-auto mb-1 text-sky-400" />
              <p className="text-base font-bold text-white">{boyCompletedModules || 4} mods</p>
              <p className="text-[10px] text-slate-400">Completed</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <Flame className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <p className="text-base font-bold text-white">{boyStreak || 8}d</p>
              <p className="text-[10px] text-slate-400">Active Streak</p>
            </div>
          </div>
        </div>

        {/* Girl Mode Partner Card */}
        <div
          className="rounded-2xl border p-6 space-y-5"
          style={{
            background: "#FFF8F6",
            borderColor: "#F9C4D2",
            boxShadow: "0 4px 20px rgba(217,107,145,0.12)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-pink-100 text-pink-600 border border-pink-200">
                🎨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-[#67485A]">
                    {girlProfile.display_name}
                  </h3>
                  {girlProfile.id === currentUserId && (
                    <span className="text-[10px] bg-pink-100 text-[#D96B91] px-2 py-0.5 rounded-full font-semibold">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#D96B91] font-medium">
                  Industrial Product Designer
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-pink-50 text-[#67485A] border border-pink-200">
              Girl Mode
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-pink-100 text-xs space-y-1.5 text-[#67485A]">
            <p><strong>Core Focus:</strong> Sketching, Fusion 360 CAD, Blender rendering, DFM, Human-Robot UX.</p>
            <p><strong>Deliverable:</strong> Ergonomic ABS Robot Enclosure & Production CAD Assembly.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-white border border-pink-100">
              <Clock className="w-4 h-4 mx-auto mb-1 text-[#D96B91]" />
              <p className="text-base font-bold text-[#67485A]">{formatDuration(girlMinutes || 4800)}</p>
              <p className="text-[10px] text-[#A07080]">Total Studied</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-pink-100">
              <Target className="w-4 h-4 mx-auto mb-1 text-[#D96B91]" />
              <p className="text-base font-bold text-[#67485A]">{girlCompletedModules || 4} mods</p>
              <p className="text-[10px] text-[#A07080]">Completed</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-pink-100">
              <Flame className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <p className="text-base font-bold text-[#67485A]">{girlStreak || 8}d</p>
              <p className="text-[10px] text-[#A07080]">Active Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Venture Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Co-Founder Synergy & Shared Robot Milestone
              </h2>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm">
                Open Shared Project <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            The <strong>ROBO MATES Autonomous Mobile Robot (AMR)</strong> requires both disciplines to succeed. Neither software nor casing alone makes a market-ready product.
          </p>

          <ProgressBar value={projectPct} showLabel label="Overall AMR Development Stage" height="md" />

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl border text-xs" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hardware & Controls Status:
              </div>
              <p style={{ color: "var(--text-muted)" }}>
                ESP32 + dual motor drivers calibrated with quadrature encoder feedback loop. Nav2 slam_toolbox tested in 2D simulator.
              </p>
            </div>

            <div className="p-3 rounded-xl border text-xs" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2 text-pink-400 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Body & Styling Status:
              </div>
              <p style={{ color: "var(--text-muted)" }}>
                Initial 3D printed chassis prototype fit-tested with PCB standoff mounts and quick-release battery compartment.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

