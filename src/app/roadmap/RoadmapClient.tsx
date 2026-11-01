// src/app/roadmap/RoadmapClient.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar, Clock, CheckCircle2, Circle, AlertCircle,
  Sparkles, Award, ArrowRight, Play, BookOpen, Layers,
  ChevronDown, ChevronUp, Bot, FileText, Check, Loader2
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import { useTheme } from "@/contexts/ThemeContext";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BOY_MODE_CURRICULUM, GIRL_MODE_CURRICULUM } from "@/lib/roadmap-seed-data";
import type { Profile, RoadmapMonth, RoadmapModule, Assessment, DailyCheckin } from "@/types/database";

interface RoadmapClientProps {
  userId: string;
  profile: Profile | null;
  months: RoadmapMonth[];
  userModules: (RoadmapModule & { roadmap_months: RoadmapMonth | null })[];
  assessments: Assessment[];
  checkins: DailyCheckin[];
}

export function RoadmapClient({
  userId,
  profile,
  months: initialMonths,
  userModules: initialUserModules,
  assessments,
  checkins,
}: RoadmapClientProps) {
  const { isBoyMode } = useTheme();
  const { success, error: showError, info } = useToast();
  const supabase = createClient();

  const [months] = useState<RoadmapMonth[]>(
    initialMonths.length > 0
      ? initialMonths
      : (isBoyMode ? BOY_MODE_CURRICULUM : GIRL_MODE_CURRICULUM).map((m) => ({
          id: `static-${m.monthNumber}`,
          persona: isBoyMode ? "boy" : "girl",
          month_number: m.monthNumber,
          title: m.title,
          description: m.description,
          main_subjects: m.mainSubjects,
          deliverable: m.deliverable,
          estimated_hours: m.estimatedHours,
          created_at: new Date().toISOString(),
        }))
  );

  const [userModules, setUserModules] = useState(initialUserModules);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(1);

  // Activation modal
  const [showActivateModal, setShowActivateModal] = useState(!profile?.journey_start_date);
  const [startDateInput, setStartDateInput] = useState(
    profile?.journey_start_date || new Date().toISOString().split("T")[0]
  );
  const [activating, setActivating] = useState(false);

  // AI Review modal
  const [reviewMonth, setReviewMonth] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState<string | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Calculate 12-Month Timeline Metrics
  const startDate = profile?.journey_start_date;
  const targetDate = profile?.journey_target_date;
  let daysCompleted = 0;
  let daysRemaining = 365;
  let currentMonthNum = 1;
  let currentWeekNum = 1;

  if (startDate) {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const elapsedMs = Math.max(0, now - start);
    daysCompleted = Math.floor(elapsedMs / 86400000);
    daysRemaining = Math.max(0, 365 - daysCompleted);
    currentMonthNum = Math.min(12, Math.max(1, Math.floor(daysCompleted / 30) + 1));
    currentWeekNum = Math.min(52, Math.max(1, Math.floor(daysCompleted / 7) + 1));
  }

  // Calculate overall program completion
  const completedModules = userModules.filter((m) => m.status === "completed").length;
  const totalModules = Math.max(userModules.length, 12);
  const overallCompletion = Math.round((completedModules / totalModules) * 100);

  // Calculate Streak
  const streak = checkins.filter((c) => c.tasks_completed > 0).length;

  async function handleActivateJourney() {
    if (!startDateInput) {
      showError("Please pick a valid start date");
      return;
    }
    setActivating(true);
    try {
      const res = await fetch("/api/roadmaps/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: startDateInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to activate");

      success("Journey Activated!", "Your 365-day robotics program has officially begun.");
      setShowActivateModal(false);
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error activating journey";
      showError(msg);
    } finally {
      setActivating(false);
    }
  }

  async function handleToggleModuleStatus(moduleId: string, currentStatus: string) {
    const nextStatus = currentStatus === "completed" ? "in_progress" : "completed";
    const nextPct = nextStatus === "completed" ? 100 : 50;

    const { error } = await supabase
      .from("roadmap_modules")
      .update({
        status: nextStatus as any,
        completion_percentage: nextPct,
        updated_at: new Date().toISOString(),
      })
      .eq("id", moduleId)
      .eq("owner_id", userId);

    if (error) {
      showError("Failed to update module");
    } else {
      setUserModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, status: nextStatus as any, completion_percentage: nextPct }
            : m
        )
      );
      success("Module updated");
    }
  }

  async function handleRequestAIReview(monthNumber: number) {
    setReviewMonth(monthNumber);
    setReviewContent(null);
    setLoadingReview(true);

    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate review");
      setReviewContent(data.review);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI review error";
      showError(msg);
      setReviewMonth(null);
    } finally {
      setLoadingReview(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner & Overview */}
      <div
        className="rounded-2xl border p-6 relative overflow-hidden"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="md">
                12-MONTH DEDICATED PROGRAM
              </Badge>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {isBoyMode ? "Robotics Systems Engineer" : "Industrial Product Designer"}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              {isBoyMode ? "Robotics Engineering Master Roadmap" : "Industrial Robotics Design Roadmap"}
            </h1>
            <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              365 days of structured mastery: from foundational concepts to hardware prototypes, simulation, CAD, and industry portfolio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActivateModal(true)}
            >
              <Calendar className="w-4 h-4" />
              {startDate ? `Started: ${startDate}` : "Activate Program"}
            </Button>
            <Link href="/roadmap/completion">
              <Button size="sm">
                <Award className="w-4 h-4" /> Final Completion Page
              </Button>
            </Link>
          </div>
        </div>

        {/* 12-Month Progress Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Overall Progress</p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--primary)" }}>{overallCompletion}%</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Current Stage</p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--text-primary)" }}>Month {currentMonthNum}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Current Week</p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--text-primary)" }}>Week {currentWeekNum}/52</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Days Completed</p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--text-primary)" }}>{daysCompleted}d</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Days Remaining</p>
            <p className="text-xl font-black mt-1 text-amber-400">{daysRemaining}d</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Study Streak</p>
            <p className="text-xl font-black mt-1 text-green-400">{streak}d 🔥</p>
          </div>
        </div>
      </div>

      {/* 12 Monthly Learning Stages Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            12 Monthly Learning Stages
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Strict sequential roadmap • Click stage to expand modules
          </span>
        </div>

        <div className="space-y-4">
          {months.map((m) => {
            const isExpanded = expandedMonth === m.month_number;
            const isCurrent = currentMonthNum === m.month_number;
            const isPassed = currentMonthNum > m.month_number;
            const monthModules = userModules.filter(
              (um) => um.roadmap_months?.month_number === m.month_number || um.month_id === m.id
            );

            const completedCount = monthModules.filter((mod) => mod.status === "completed").length;
            const monthPct = monthModules.length > 0
              ? Math.round((completedCount / monthModules.length) * 100)
              : isPassed ? 100 : 0;

            return (
              <Card
                key={m.month_number}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isCurrent && "border-primary/60 shadow-glow"
                )}
              >
                <div
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  onClick={() => setExpandedMonth(isExpanded ? null : m.month_number)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                      style={{
                        background: isCurrent ? "var(--gradient-accent)" : "var(--bg-secondary)",
                        color: isCurrent ? "white" : "var(--text-secondary)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      M{m.month_number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                          {m.title}
                        </h3>
                        {isCurrent && <Badge variant="primary">Current Active Stage</Badge>}
                        {monthPct === 100 && <Badge variant="success">Completed</Badge>}
                      </div>
                      <p className="text-xs mt-1 max-w-xl" style={{ color: "var(--text-muted)" }}>
                        {m.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.main_subjects?.map((sub) => (
                          <span
                            key={sub}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                            style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                        {monthPct}% Done
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        ~{m.estimated_hours} hrs
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAIReview(m.month_number);
                        }}
                      >
                        <Bot className="w-3.5 h-3.5" /> AI Review
                      </Button>

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                      ) : (
                        <ChevronDown className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div
                    className="p-5 border-t space-y-5"
                    style={{ background: "var(--bg-secondary)40", borderColor: "var(--border-color)" }}
                  >
                    {/* Practical Deliverable Alert */}
                    <div
                      className="p-4 rounded-xl border flex items-start gap-3"
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <Award className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                          Target Deliverable for Month {m.month_number}
                        </p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>
                          {m.deliverable}
                        </p>
                      </div>
                    </div>

                    {/* Modules Checklist */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                        Weekly Learning Modules & Checklists
                      </h4>

                      {monthModules.length === 0 ? (
                        <div className="p-4 rounded-xl border text-center text-xs" style={{ color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
                          No modules generated yet for Month {m.month_number}. Activate your journey to auto-generate weekly schedules.
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {monthModules.map((mod) => (
                            <div
                              key={mod.id}
                              className="p-3 rounded-xl border flex items-start justify-between gap-3"
                              style={{
                                background: mod.status === "completed" ? "rgba(16,185,129,0.05)" : "var(--bg-card)",
                                borderColor: mod.status === "completed" ? "rgba(16,185,129,0.3)" : "var(--border-color)",
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                    Week {mod.week_number}
                                  </span>
                                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                                    {mod.title}
                                  </p>
                                </div>
                                <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                                  {mod.description}
                                </p>
                              </div>

                              <button
                                onClick={() => handleToggleModuleStatus(mod.id, mod.status)}
                                className="p-1.5 rounded-lg border transition-all hover:scale-105"
                                style={{
                                  background: mod.status === "completed" ? "var(--success)" : "transparent",
                                  borderColor: mod.status === "completed" ? "var(--success)" : "var(--border-color)",
                                  color: mod.status === "completed" ? "white" : "var(--text-muted)",
                                }}
                                title={mod.status === "completed" ? "Mark incomplete" : "Mark completed"}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Activation Modal */}
      <Modal
        open={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        title="Activate 12-Month Robotics Program"
        size="md"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Select your journey activation date. Your 365-day program will start from this date, automatically scheduling all 12 stages, 52 weekly plans, and daily checklists.
          </p>

          <Input
            label="Program Start Date (YYYY-MM-DD)"
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
          />

          <div
            className="p-3 rounded-xl border text-xs space-y-1"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
          >
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Specialization: {isBoyMode ? "Robotics Systems Engineer (Boy Mode)" : "Industrial Product Designer (Girl Mode)"}
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              • Total duration: 365 days (52 weeks)
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              • Target completion: 1 year from your chosen start date
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleActivateJourney} loading={activating} className="flex-1">
              Begin 12-Month Journey
            </Button>
            <Button variant="secondary" onClick={() => setShowActivateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Monthly AI Review Modal */}
      <Modal
        open={reviewMonth !== null}
        onClose={() => setReviewMonth(null)}
        title={`Month ${reviewMonth} AI Study Review`}
        size="lg"
      >
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {loadingReview ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Gemini is analyzing your actual study records and assessments...
              </p>
            </div>
          ) : (
            <div>
              <div
                className="prose prose-sm max-w-none text-sm whitespace-pre-wrap leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                {reviewContent}
              </div>
              <div className="pt-4 mt-4 border-t flex justify-end" style={{ borderColor: "var(--border-color)" }}>
                <Button size="sm" onClick={() => setReviewMonth(null)}>
                  Close Review
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
