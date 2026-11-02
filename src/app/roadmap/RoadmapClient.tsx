// src/app/roadmap/RoadmapClient.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar, Clock, CheckCircle2, Circle, AlertCircle,
  Sparkles, Award, ArrowRight, Play, BookOpen, Layers,
  ChevronDown, ChevronUp, Bot, FileText, Check, Loader2,
  HelpCircle, CheckCircle, ExternalLink, RefreshCw
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  getCurriculumForProfile,
  PROGRAMME_START_DATE,
  PROGRAMME_END_DATE,
  TOTAL_PROGRAMME_DAYS,
  getProgrammeDayInfo,
  getDateForProgrammeDay,
} from "@/lib/curriculum-engine";
import type { CurriculumMonth, CurriculumWeek } from "@/lib/curriculum-khanishk";
import type { Profile, RoadmapMonth, RoadmapModule, Assessment, DailyCheckin, ProfileSlug } from "@/types/database";

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
  const { activeProfile } = useAuth();
  const { success, error: showError, info } = useToast();
  const supabase = createClient();

  const activeSlug: ProfileSlug = (activeProfile?.slug || (isBoyMode ? "khanishk" : "akshaya")) as ProfileSlug;
  const curriculum: CurriculumMonth[] = getCurriculumForProfile(activeSlug);

  const [expandedMonth, setExpandedMonth] = useState<number | null>(1);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  // Completed weeks tracked locally and synced
  const [completedWeekSet, setCompletedWeekSet] = useState<Set<number>>(() => {
    const s = new Set<number>();
    initialUserModules.forEach((m) => {
      if (m.status === "completed") s.add(m.week_number);
    });
    return s;
  });

  // AI Review modal
  const [reviewMonth, setReviewMonth] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState<string | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Assessment Quiz modal
  const [quizWeek, setQuizWeek] = useState<CurriculumWeek | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Timeline metrics (8 Nov 2026 to 7 Nov 2027)
  const todayInfo = getProgrammeDayInfo();
  const daysCompleted = todayInfo.dayNumber;
  const daysRemaining = Math.max(0, TOTAL_PROGRAMME_DAYS - daysCompleted);
  const currentMonthNum = todayInfo.monthNumber;
  const currentWeekNum = todayInfo.weekNumber;

  const totalWeeks = 52;
  const completedWeeksCount = completedWeekSet.size;
  const overallCompletion = Math.round((completedWeeksCount / totalWeeks) * 100);

  // Streak
  const streak = checkins.filter((c) => c.tasks_completed > 0).length;

  const toggleWeekCompletion = async (weekNumber: number) => {
    const nextSet = new Set(completedWeekSet);
    const isCompleted = nextSet.has(weekNumber);
    if (isCompleted) {
      nextSet.delete(weekNumber);
    } else {
      nextSet.add(weekNumber);
    }
    setCompletedWeekSet(nextSet);

    // Persist to Supabase if available
    try {
      const targetProfileId = activeProfile?.id || userId;
      const status = isCompleted ? "in_progress" : "completed";
      await supabase
        .from("roadmap_modules")
        .upsert({
          owner_id: targetProfileId,
          week_number: weekNumber,
          sequence: weekNumber,
          title: `Week ${weekNumber} Module`,
          status,
          completion_percentage: isCompleted ? 0 : 100,
          updated_at: new Date().toISOString(),
        });
      success(isCompleted ? `Week ${weekNumber} marked in progress` : `Week ${weekNumber} completed! 🚀`);
    } catch {
      // Local state is preserved
    }
  };

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

  function handleOpenQuiz(week: CurriculumWeek) {
    setQuizWeek(week);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }

  function handleAnswerSelect(qIndex: number, answer: string) {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  }

  function handleSubmitQuiz() {
    if (!quizWeek) return;
    let score = 0;
    quizWeek.assessmentQuestions.forEach((q, idx) => {
      if (q.correctAnswer && quizAnswers[idx] === q.correctAnswer) {
        score++;
      } else if (!q.correctAnswer && quizAnswers[idx]) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score >= Math.ceil(quizWeek.assessmentQuestions.length * 0.7)) {
      success(`Assessment Passed! Score: ${score}/${quizWeek.assessmentQuestions.length} 🎯`);
    } else {
      info(`Assessment Submitted. Score: ${score}/${quizWeek.assessmentQuestions.length}. Review weak areas!`);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner & Overview */}
      <div
        className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="primary" size="md">
                52-WEEK DEDICATED ROBOTICS PROGRAMME
              </Badge>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--primary)" }}>
                {activeSlug === "khanishk" ? "Khanishk • Robotics Systems Engineer" : "Akshaya • Industrial Product Designer"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              {activeSlug === "khanishk" ? "Autonomous Robotics Systems Engineering Roadmap" : "Robotics Product Design & Industrial Styling Roadmap"}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {activeSlug === "khanishk"
                ? "365 days of rigorous engineering: from Linux, C++, and FreeRTOS firmware to ROS 2 Humble, 2D LiDAR SLAM, Nav2 navigation, and differential drive hardware assembly."
                : "365 days of product design mastery: from industrial sketching and perspective to Fusion 360 parametric CAD, DFM injection molding, Blender Cycles CMF, and HRI prototypes."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/planner">
              <Button size="sm">
                <Calendar className="w-4 h-4" /> Open Daily Planner
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="sm">
                <Award className="w-4 h-4" /> Shared AMR Capstone
              </Button>
            </Link>
          </div>
        </div>

        {/* 12-Month Progress Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Programme Progress</p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--primary)" }}>{overallCompletion}%</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{completedWeeksCount} of 52 weeks</p>
          </div>
          <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Current Month</p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--text-primary)" }}>Month {currentMonthNum}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>of 12 Months</p>
          </div>
          <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Current Week</p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--text-primary)" }}>Week {currentWeekNum}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>of 52 Weeks</p>
          </div>
          <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Elapsed Days</p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--text-primary)" }}>{daysCompleted}d</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Started: 8 Nov 2026</p>
          </div>
          <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Days Remaining</p>
            <p className="text-xl font-black mt-1 text-amber-400">{daysRemaining}d</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Ends: 7 Nov 2027</p>
          </div>
          <div className="p-3.5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Study Streak</p>
            <p className="text-xl font-black mt-1 text-green-400">{streak}d 🔥</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Consistent Check-ins</p>
          </div>
        </div>
      </div>

      {/* 12 Monthly Learning Stages Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              12 Sequential Curriculum Stages
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Structured, beginner-to-advanced progression • Click any month to inspect weekly modules, deliverables, and assessments
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border self-start sm:self-auto" style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
            52 Weeks • 365 Inclusive Days
          </span>
        </div>

        <div className="space-y-4">
          {curriculum.map((m) => {
            const isExpanded = expandedMonth === m.monthNumber;
            const isCurrent = currentMonthNum === m.monthNumber;
            const isPassed = currentMonthNum > m.monthNumber;

            const monthWeeks = m.weeks;
            const completedCount = monthWeeks.filter((w) => completedWeekSet.has(w.weekNumber)).length;
            const monthPct = monthWeeks.length > 0 ? Math.round((completedCount / monthWeeks.length) * 100) : 0;

            return (
              <Card
                key={m.monthNumber}
                className={cn(
                  "overflow-hidden transition-all duration-200 border",
                  isCurrent && "ring-2 ring-primary/40 shadow-glow"
                )}
              >
                <div
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  onClick={() => setExpandedMonth(isExpanded ? null : m.monthNumber)}
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
                      M{m.monthNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                          {m.title}
                        </h3>
                        {isCurrent && <Badge variant="primary">Current Active Stage</Badge>}
                        {monthPct === 100 && <Badge variant="success">Completed</Badge>}
                      </div>
                      <p className="text-xs mt-1 max-w-xl line-clamp-2" style={{ color: "var(--text-muted)" }}>
                        {m.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.mainSubjects.map((sub) => (
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
                        {monthPct}% Done ({completedCount}/{monthWeeks.length} wks)
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        ~{m.estimatedHours} hrs dedicated
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAIReview(m.monthNumber);
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
                    className="p-5 border-t space-y-6"
                    style={{ background: "var(--bg-secondary)40", borderColor: "var(--border-color)" }}
                  >
                    {/* Objectives & Assessment Criteria */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Learning Objectives */}
                      <div
                        className="p-4 rounded-2xl border"
                        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
                          <BookOpen className="w-4 h-4" /> Month {m.monthNumber} Learning Objectives
                        </h4>
                        <ul className="space-y-1.5">
                          {m.learningObjectives.map((obj, i) => (
                            <li key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-400" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Assessment Criteria */}
                      <div
                        className="p-4 rounded-2xl border"
                        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-amber-400">
                          <Award className="w-4 h-4" /> Assessment & Evaluation Criteria
                        </h4>
                        <ul className="space-y-1.5">
                          {m.assessmentCriteria.map((crit, i) => (
                            <li key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                              <Circle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                              <span>{crit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Practical Deliverable Banner */}
                    <div
                      className="p-4 rounded-2xl border flex items-start gap-3.5"
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <Award className="w-6 h-6 flex-shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                          Required Deliverable for Month {m.monthNumber}
                        </p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>
                          {m.deliverable}
                        </p>
                      </div>
                    </div>

                    {/* Weekly Modules Breakdown */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                          Weekly Modules & Daily Tasks ({monthWeeks.length} Weeks)
                        </h4>
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          Click a week to inspect daily tasks and assessment quiz
                        </span>
                      </div>

                      <div className="space-y-3">
                        {monthWeeks.map((w) => {
                          const isWeekExpanded = expandedWeek === w.weekNumber;
                          const isCompleted = completedWeekSet.has(w.weekNumber);

                          return (
                            <div
                              key={w.weekNumber}
                              className="rounded-2xl border transition-all"
                              style={{
                                background: isCompleted ? "rgba(16,185,129,0.04)" : "var(--bg-card)",
                                borderColor: isCompleted ? "rgba(16,185,129,0.3)" : "var(--border-color)",
                              }}
                            >
                              <div
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                                onClick={() => setExpandedWeek(isWeekExpanded ? null : w.weekNumber)}
                              >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleWeekCompletion(w.weekNumber);
                                    }}
                                    className="p-2 rounded-xl border flex-shrink-0 transition-transform active:scale-95"
                                    style={{
                                      background: isCompleted ? "var(--success)" : "var(--bg-secondary)",
                                      borderColor: isCompleted ? "var(--success)" : "var(--border-color)",
                                      color: isCompleted ? "white" : "var(--text-muted)",
                                    }}
                                    title={isCompleted ? "Mark incomplete" : "Mark week completed"}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[11px] font-black px-2 py-0.5 rounded-md" style={{ background: "var(--bg-secondary)", color: "var(--primary)" }}>
                                        WEEK {w.weekNumber}
                                      </span>
                                      <h5 className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                                        {w.title}
                                      </h5>
                                      {isCompleted && <Badge variant="success">Completed</Badge>}
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                      🎯 {w.learningObjective}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenQuiz(w);
                                    }}
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" /> Quiz ({w.assessmentQuestions.length})
                                  </Button>

                                  <Link
                                    href={`/planner?date=${getDateForProgrammeDay((w.weekNumber - 1) * 7 + 1)}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button size="sm" variant="secondary">
                                      <Play className="w-3.5 h-3.5" /> Planner
                                    </Button>
                                  </Link>

                                  {isWeekExpanded ? (
                                    <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                  )}
                                </div>
                              </div>

                              {/* Expanded Week Details */}
                              {isWeekExpanded && (
                                <div
                                  className="p-4 border-t space-y-4"
                                  style={{ background: "var(--bg-secondary)30", borderColor: "var(--border-color)" }}
                                >
                                  {/* Week Deliverable */}
                                  <div className="p-3 rounded-xl border text-xs flex items-center justify-between gap-3" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                                    <div>
                                      <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: "var(--primary)" }}>
                                        Weekly Deliverable:
                                      </span>
                                      <p className="font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                                        {w.deliverable}
                                      </p>
                                    </div>
                                    <Badge variant="primary">{w.dailyTasks.length} Days</Badge>
                                  </div>

                                  {/* Daily Tasks for this week */}
                                  <div>
                                    <h6 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                                      Daily Task Sequence (Days 1 to 7)
                                    </h6>
                                    <div className="grid gap-2">
                                      {w.dailyTasks.map((task) => (
                                        <div
                                          key={task.dayOfWeek}
                                          className="p-3 rounded-xl border text-xs"
                                          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
                                        >
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                                                Day {task.dayOfWeek}
                                              </span>
                                              <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                                                {task.title}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                                {Math.round(task.expectedDurationMinutes / 60 * 10) / 10}h
                                              </span>
                                              <Badge variant={task.category === "assessment" ? "warning" : task.category === "practical" ? "primary" : "muted"}>
                                                {task.category}
                                              </Badge>
                                            </div>
                                          </div>
                                          <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>
                                            {task.instructions}
                                          </p>
                                          <div className="mt-2 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px]" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                                            <span><strong>Output:</strong> {task.expectedOutput}</span>
                                            <span><strong>Resources:</strong> {task.requiredResources}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Interactive Assessment Quiz Modal */}
      {quizWeek && (
        <Modal
          open={!!quizWeek}
          onClose={() => setQuizWeek(null)}
          title={`Week ${quizWeek.weekNumber} Knowledge Assessment: ${quizWeek.title}`}
          size="lg"
        >
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="p-4 rounded-2xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                Assessment Benchmark
              </p>
              <h4 className="text-base font-bold mt-1" style={{ color: "var(--text-primary)" }}>
                {quizWeek.assessmentTitle}
              </h4>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Objective: {quizWeek.learningObjective}
              </p>
            </div>

            {quizSubmitted && quizScore !== null && (
              <div
                className="p-4 rounded-2xl border text-center space-y-1"
                style={{
                  background: quizScore >= Math.ceil(quizWeek.assessmentQuestions.length * 0.7) ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                  borderColor: quizScore >= Math.ceil(quizWeek.assessmentQuestions.length * 0.7) ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)",
                }}
              >
                <Award className="w-8 h-8 mx-auto text-amber-400" />
                <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
                  Assessment Score: {quizScore} / {quizWeek.assessmentQuestions.length} ({Math.round((quizScore / quizWeek.assessmentQuestions.length) * 100)}%)
                </h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {quizScore >= Math.ceil(quizWeek.assessmentQuestions.length * 0.7)
                    ? "Great job! You have demonstrated strong mastery of this week's robotics concepts."
                    : "Review the daily notes and practice exercises for this week to reinforce weak areas."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {quizWeek.assessmentQuestions.map((q, idx) => {
                const isSelected = quizAnswers[idx];
                const isCorrect = quizSubmitted && q.correctAnswer && isSelected === q.correctAnswer;
                const isIncorrect = quizSubmitted && q.correctAnswer && isSelected !== q.correctAnswer;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border space-y-3"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: "var(--bg-secondary)", color: "var(--primary)" }}>
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold pt-0.5" style={{ color: "var(--text-primary)" }}>
                        {q.question}
                      </p>
                    </div>

                    {q.options && q.options.length > 0 ? (
                      <div className="grid gap-2 pl-8">
                        {q.options.map((opt, optIdx) => {
                          const isOptionChosen = quizAnswers[idx] === opt;
                          const isOptionCorrect = quizSubmitted && q.correctAnswer === opt;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswerSelect(idx, opt)}
                              disabled={quizSubmitted}
                              className="p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between"
                              style={{
                                background: isOptionCorrect
                                  ? "rgba(16,185,129,0.15)"
                                  : isOptionChosen && isIncorrect
                                  ? "rgba(239,68,68,0.15)"
                                  : isOptionChosen
                                  ? "var(--primary)15"
                                  : "var(--bg-secondary)",
                                borderColor: isOptionCorrect
                                  ? "#10B981"
                                  : isOptionChosen && isIncorrect
                                  ? "#EF4444"
                                  : isOptionChosen
                                  ? "var(--primary)"
                                  : "var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                            >
                              <span>{opt}</span>
                              {isOptionCorrect && <Check className="w-4 h-4 text-green-400" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="pl-8">
                        <Input
                          placeholder="Type your answer / analysis..."
                          value={quizAnswers[idx] || ""}
                          onChange={(e) => handleAnswerSelect(idx, e.target.value)}
                          disabled={quizSubmitted}
                        />
                        {quizSubmitted && q.correctAnswer && (
                          <p className="text-xs mt-1.5 text-green-400 font-medium">
                            Expected: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setQuizWeek(null)}>
                Close
              </Button>
              {!quizSubmitted ? (
                <Button onClick={handleSubmitQuiz} className="font-bold">
                  Submit Assessment
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                    setQuizScore(null);
                  }}
                  variant="secondary"
                >
                  <RefreshCw className="w-4 h-4" /> Retake Assessment
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* AI Review Modal */}
      {reviewMonth && (
        <Modal
          open={!!reviewMonth}
          onClose={() => setReviewMonth(null)}
          title={`AI Curriculum Review: Month ${reviewMonth}`}
          size="lg"
        >
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {loadingReview ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Analyzing curriculum milestones and generating personalized mentor feedback...
                </p>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                {reviewContent || "No review content generated. Please try again."}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={() => setReviewMonth(null)}>Close Review</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
