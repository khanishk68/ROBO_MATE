// src/app/curriculum/CurriculumClient.tsx
"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  MONTH_1_METADATA,
  MONTH_1_DAYS,
  MONTH_1_EQUIPMENT,
  MONTH_1_RESOURCES,
  ROBOT_MISSION_LOGGER_SPEC,
  type Month1DayPlan,
} from "@/lib/curriculum-month1-khanishk";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  ExternalLink,
  FileCheck,
  FileText,
  Filter,
  Flame,
  HardDrive,
  Layers,
  Search,
  ShieldAlert,
  Sparkles,
  Terminal,
  Wrench,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

export function CurriculumClient() {
  const { profile, activeProfile } = useAuth();
  const { isBoyMode } = useTheme();
  const currentProfile = activeProfile || profile;

  const { isItemCompleted, toggleItem, getDayProgress, getMonthProgress } = useChecklistProgress(
    currentProfile?.id
  );

  const [activeTab, setActiveTab] = useState<"plan" | "equipment" | "resources" | "capstone">("plan");
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({
    1: true, // Default open Day 1
  });

  const monthProgress = getMonthProgress();

  const toggleDayExpanded = (dayNumber: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<number, boolean> = {};
    MONTH_1_DAYS.forEach((d) => {
      allExpanded[d.dayNumber] = true;
    });
    setExpandedDays(allExpanded);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  // Filtered 30 days
  const filteredDays = useMemo(() => {
    return MONTH_1_DAYS.filter((day) => {
      if (selectedWeek !== "all" && day.weekNumber !== selectedWeek) return false;
      if (selectedType !== "all" && day.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTopic = day.topic.toLowerCase().includes(query);
        const matchesStudy = day.study.toLowerCase().includes(query);
        const matchesDo = day.do.toLowerCase().includes(query);
        const matchesSave = day.save.toLowerCase().includes(query);
        const matchesChecklist = day.checklistItems.some((item) =>
          item.text.toLowerCase().includes(query)
        );
        return matchesTopic || matchesStudy || matchesDo || matchesSave || matchesChecklist;
      }
      return true;
    });
  }, [selectedWeek, selectedType, searchQuery]);

  return (
    <AppShell title="Robotics Engineering Curriculum">
      <div className="space-y-6 pb-16">
        {/* Top Hero Banner */}
        <div
          className="rounded-2xl border p-5 sm:p-7 relative overflow-hidden backdrop-blur-md"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold border tracking-wide uppercase flex items-center gap-1.5"
                style={{
                  background: isBoyMode ? "rgba(37,99,235,0.15)" : "rgba(217,107,145,0.15)",
                  borderColor: isBoyMode ? "rgba(56,189,248,0.4)" : "rgba(245,184,204,0.6)",
                  color: isBoyMode ? "#38BDF8" : "#D96B91",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Month 1 Foundation • 8 Nov – 7 Dec 2026
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
              >
                30 Individual Days • 110 Planned Hours
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {MONTH_1_METADATA.title}
                </h1>
                <p className="mt-1 text-xs sm:text-sm max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                  {MONTH_1_METADATA.target}
                </p>
              </div>

              {/* Overall Progress Gauge */}
              <div
                className="p-3.5 rounded-xl border flex items-center gap-4 min-w-[220px]"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span style={{ color: "var(--text-secondary)" }}>Month 1 Completion</span>
                    <span className="font-bold" style={{ color: "var(--primary)" }}>
                      {monthProgress.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${monthProgress.percentage}%`,
                        background: "var(--gradient-accent)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-muted)" }}>
                    {monthProgress.completed} of {monthProgress.total} items completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex border-b overflow-x-auto gap-2 sm:gap-4 text-xs sm:text-sm font-semibold scrollbar-none"
          style={{ borderColor: "var(--border-color)" }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("plan")}
            className="flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap"
            style={{
              borderColor: activeTab === "plan" ? "var(--primary)" : "transparent",
              color: activeTab === "plan" ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            <Calendar className="w-4 h-4" />
            30-Day Daily Plan &amp; Checklist
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("equipment")}
            className="flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap"
            style={{
              borderColor: activeTab === "equipment" ? "var(--primary)" : "transparent",
              color: activeTab === "equipment" ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            <Wrench className="w-4 h-4" />
            Equipment &amp; Setup (₹0)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className="flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap"
            style={{
              borderColor: activeTab === "resources" ? "var(--primary)" : "transparent",
              color: activeTab === "resources" ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            <BookOpen className="w-4 h-4" />
            Verified Resources ({MONTH_1_RESOURCES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("capstone")}
            className="flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap"
            style={{
              borderColor: activeTab === "capstone" ? "var(--primary)" : "transparent",
              color: activeTab === "capstone" ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            <Terminal className="w-4 h-4" />
            Robot Mission Logger v1
          </button>
        </div>

        {/* =========================================================================
            TAB 1: 30-DAY DAILY PLAN & CHECKLIST
            ========================================================================= */}
        {activeTab === "plan" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div
              className="p-4 rounded-xl border flex flex-col md:flex-row gap-3 md:items-center justify-between"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  placeholder="Search topics, exercises, subtopics (e.g. loops, functions, git)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs sm:text-sm border outline-none transition-all"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedWeek}
                  onChange={(e) =>
                    setSelectedWeek(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all">All 4 Weeks</option>
                  <option value={1}>Week 1: Foundations (Days 1–7)</option>
                  <option value={2}>Week 2: Core Programming (Days 8–14)</option>
                  <option value={3}>Week 3: Tools &amp; Debugging (Days 15–23)</option>
                  <option value={4}>Week 4: Terminal, Git &amp; Project (Days 24–30)</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="all">All Day Types</option>
                  <option value="LEARNING">Learning (4 hrs)</option>
                  <option value="WEEKLY ASSESSMENT">Weekly Assessment</option>
                  <option value="PROJECT">Project Implementation</option>
                  <option value="REST / REVIEW">Rest &amp; Review (0 hrs)</option>
                </select>

                <div className="flex items-center gap-1 border-l pl-2" style={{ borderColor: "var(--border-color)" }}>
                  <button
                    type="button"
                    onClick={expandAll}
                    className="px-2 py-1 text-[11px] rounded font-medium hover:opacity-80"
                    style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="px-2 py-1 text-[11px] rounded font-medium hover:opacity-80"
                    style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
                  >
                    Collapse
                  </button>
                </div>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex justify-between items-center text-xs px-1" style={{ color: "var(--text-muted)" }}>
              <span>
                Showing {filteredDays.length} of 30 days
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
              <span className="hidden sm:inline">Each day features 5–7 actionable checkboxes with persistent sync</span>
            </div>

            {/* 30 Days List */}
            <div className="space-y-3.5">
              {filteredDays.map((day) => {
                const isExpanded = Boolean(expandedDays[day.dayNumber]);
                const dayProgress = getDayProgress(day.dayNumber, day.checklistItems.length);
                const isDayComplete =
                  day.checklistItems.length > 0 &&
                  dayProgress.completed === day.checklistItems.length;

                // Color accent by day type
                const typeColors = {
                  LEARNING: { bg: "rgba(37,99,235,0.12)", border: "#2563EB40", text: "#38BDF8" },
                  "WEEKLY ASSESSMENT": { bg: "rgba(245,158,11,0.12)", border: "#F59E0B40", text: "#FBBF24" },
                  "REST / REVIEW": { bg: "rgba(16,185,129,0.12)", border: "#10B98140", text: "#34D399" },
                  PROJECT: { bg: "rgba(168,85,247,0.12)", border: "#A855F740", text: "#C084FC" },
                }[day.type];

                return (
                  <div
                    key={day.dayNumber}
                    className="rounded-2xl border transition-all overflow-hidden"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: isDayComplete ? "#10B98160" : "var(--border-color)",
                    }}
                  >
                    {/* Header Row (Click to toggle expansion) */}
                    <div
                      onClick={() => toggleDayExpanded(day.dayNumber)}
                      className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        {/* Day Number Pill */}
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-black tracking-wider px-2.5 py-1 rounded-lg border flex-shrink-0"
                            style={{
                              background: "var(--bg-secondary)",
                              borderColor: "var(--border-color)",
                              color: "var(--primary)",
                            }}
                          >
                            DAY {day.dayNumber.toString().padStart(2, "0")}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0"
                            style={{
                              background: typeColors.bg,
                              borderColor: typeColors.border,
                              color: typeColors.text,
                            }}
                          >
                            {day.type}
                          </span>
                        </div>

                        {/* Title & Date */}
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm sm:text-base truncate" style={{ color: "var(--text-primary)" }}>
                            {day.topic}
                          </h3>
                          <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                            <span>
                              {day.dayOfWeek}, {new Date(day.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {day.hours > 0 ? `${day.hours} Hours` : "Rest Day"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Progress indicator & chevron */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden xs:block">
                          <div className="text-xs font-bold" style={{ color: isDayComplete ? "#34D399" : "var(--primary)" }}>
                            {dayProgress.completed}/{dayProgress.total} items
                          </div>
                          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {dayProgress.percentage}% checked
                          </div>
                        </div>

                        <div
                          className="w-8 h-8 rounded-xl border flex items-center justify-center transition-transform"
                          style={{
                            background: "var(--bg-secondary)",
                            borderColor: "var(--border-color)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Body */}
                    {isExpanded && (
                      <div
                        className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t space-y-5"
                        style={{
                          background: "var(--bg-secondary)40",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        {/* 3 Pillars Grid: Study, Do, Save */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Study */}
                          <div
                            className="p-3.5 rounded-xl border"
                            style={{
                              background: "var(--bg-card)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#38BDF8" }}>
                              <BookOpen className="w-3.5 h-3.5" />
                              Study (Concepts)
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                              {day.study}
                            </p>
                          </div>

                          {/* Do */}
                          <div
                            className="p-3.5 rounded-xl border"
                            style={{
                              background: "var(--bg-card)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#FBBF24" }}>
                              <Code2 className="w-3.5 h-3.5" />
                              Do (Practical Lab)
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                              {day.do}
                            </p>
                          </div>

                          {/* Save */}
                          <div
                            className="p-3.5 rounded-xl border"
                            style={{
                              background: "var(--bg-card)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#34D399" }}>
                              <FileCheck className="w-3.5 h-3.5" />
                              Save (Artifact to Commit)
                            </div>
                            <p className="text-xs leading-relaxed font-mono" style={{ color: "var(--text-secondary)" }}>
                              {day.save}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Checklist (5–7 Items) */}
                        <div
                          className="p-4 rounded-xl border space-y-3"
                          style={{
                            background: "var(--bg-card)",
                            borderColor: "var(--border-color)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
                                <FileText className="w-4 h-4" />
                                Daily Study Checklist
                              </span>
                              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                ({dayProgress.completed}/{dayProgress.total} completed)
                              </span>
                            </div>

                            <Link
                              href={`/planner?date=${day.date}`}
                              className="text-xs font-semibold flex items-center gap-1 hover:underline"
                              style={{ color: "var(--primary)" }}
                            >
                              <span>Open in Planner</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>

                          {/* Checkbox Items */}
                          <div className="space-y-2">
                            {day.checklistItems.map((item, idx) => {
                              const checked = isItemCompleted(day.dayNumber, item.id);
                              return (
                                <label
                                  key={item.id}
                                  className="flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none"
                                  style={{
                                    background: checked ? "var(--bg-secondary)" : "transparent",
                                    borderColor: checked ? "var(--primary)40" : "var(--border-color)",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleItem(day.dayNumber, item.id);
                                  }}
                                >
                                  <div className="mt-0.5 flex-shrink-0">
                                    {checked ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <Circle className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span
                                      className="text-xs sm:text-sm leading-relaxed"
                                      style={{
                                        color: checked ? "var(--text-muted)" : "var(--text-primary)",
                                        textDecoration: checked ? "line-through" : "none",
                                      }}
                                    >
                                      {item.text}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: EQUIPMENT & SETUP CHECKLIST (₹0 THIS MONTH)
            ========================================================================= */}
        {activeTab === "equipment" && (
          <div className="space-y-6">
            {/* Prohibited Hardware Warning Banner */}
            <div
              className="p-4 rounded-xl border flex items-start gap-3.5"
              style={{
                background: "rgba(239,68,68,0.1)",
                borderColor: "rgba(239,68,68,0.3)",
                color: "#FCA5A5",
              }}
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-red-300">
                  Month 1 Hardware Notice: Zero Expenditure (₹0)
                </h3>
                <p className="text-xs mt-1 text-red-200/90 leading-relaxed">
                  Do not buy Arduino, ESP32, sensors, motors, motor drivers, breadboards, batteries, or power supplies for Month 1. Month 1 is strictly software-first (Python, Git, terminal fluency). Hardware procurement occurs only after Month 2–3 planning is finalized.
                </p>
              </div>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category 1: Already Available */}
              <div
                className="p-5 rounded-2xl border space-y-4"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      1. Already Available / Pre-requisites
                    </h3>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      Required tools you already have or can install for free
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {MONTH_1_EQUIPMENT.filter((e) => e.category === "already_available").map((eq, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-xs text-sky-400">{eq.item}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {eq.estimatedCost}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>
                        {eq.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2 & 3: Optional & Not This Month */}
              <div className="space-y-4">
                {/* Optional */}
                <div
                  className="p-5 rounded-2xl border space-y-3"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                        2. Recommended Optional Items
                      </h3>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        Minimal budget items for offline engineering notes
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {MONTH_1_EQUIPMENT.filter((e) => e.category === "optional").map((eq, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border"
                        style={{
                          background: "var(--bg-secondary)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                            {eq.item}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {eq.estimatedCost}
                          </span>
                        </div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>
                          {eq.purpose}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Not This Month Prohibited */}
                <div
                  className="p-5 rounded-2xl border space-y-3"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "rgba(239,68,68,0.3)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-red-400">
                        3. NOT This Month (Postponed)
                      </h3>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        Hardware selection starts in Month 2–3
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {MONTH_1_EQUIPMENT.filter((e) => e.category === "not_this_month").map((eq, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border"
                        style={{
                          background: "var(--bg-secondary)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-xs text-red-300">{eq.item}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                            ₹0 (Do Not Buy)
                          </span>
                        </div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>
                          {eq.purpose}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: VERIFIED LEARNING RESOURCES
            ========================================================================= */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              The 7 official study sources recommended in your Month 1 study plan. Open any resource in a new tab:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MONTH_1_RESOURCES.map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:scale-[1.01]"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{
                          background: "var(--bg-secondary)",
                          borderColor: "var(--border-color)",
                          color: "var(--primary)",
                        }}
                      >
                        {res.type.replace("_", " ")}
                      </span>
                      <span className="text-[11px] font-semibold text-sky-400">
                        {res.relevantTopics}
                      </span>
                    </div>

                    <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                      {res.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {res.description}
                    </p>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border hover:opacity-90"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                      color: "var(--primary)",
                    }}
                  >
                    <span>Open {res.title}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: CAPSTONE PROJECT — ROBOT MISSION LOGGER V1
            ========================================================================= */}
        {activeTab === "capstone" && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Month 1 Capstone Project
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                      v1.0.0
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                    {ROBOT_MISSION_LOGGER_SPEC.title}
                  </h2>
                  <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                    {ROBOT_MISSION_LOGGER_SPEC.objective}
                  </p>
                </div>

                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform active:scale-95"
                  style={{ background: "var(--gradient-accent)" }}
                >
                  <Terminal className="w-4 h-4" />
                  Open Projects Page →
                </Link>
              </div>

              {/* Required Features Grid */}
              <div
                className="p-4 rounded-xl border space-y-2"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                  Core Specifications &amp; Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {ROBOT_MISSION_LOGGER_SPEC.requiredFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10 Test Cases */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                  10-Test Scenario Suite (Verification Checklist)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROBOT_MISSION_LOGGER_SPEC.testSuite.map((tc) => (
                    <div
                      key={tc.id}
                      className="p-3 rounded-xl border text-xs space-y-1"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400">{tc.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-slate-400">
                          {tc.id}
                        </span>
                      </div>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <strong className="text-slate-300">Input:</strong> {tc.inputDescription}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                        <strong className="text-emerald-400">Expected:</strong> {tc.expectedBehavior}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

