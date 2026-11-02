// src/app/dashboard/DashboardClient.tsx
"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import {
  Flame, Clock, Target, CheckCircle2, AlertCircle,
  ArrowRight, Bot, Rocket, Calendar, TrendingUp, Zap,
  BookOpen, ChevronRight, Sparkles, Layers, Palette, Cpu
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ProgressBar, CircularProgress } from "@/components/ui/ProgressBar";
import { TaskStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getGreeting, formatDuration, getProgressPercentage } from "@/lib/utils";
import { getProgrammeDayInfo, getDailyTasksForDate } from "@/lib/curriculum-engine";
import type { Profile, TaskOccurrence, StudyTask, DailyCheckin, RoadmapModule, Project } from "@/types/database";
import { WeeklyChart } from "./WeeklyChart";
import { HeatmapCalendar } from "./HeatmapCalendar";

interface DashboardClientProps {
  profile: Profile | null;
  todayOccurrences: (TaskOccurrence & { study_tasks: StudyTask })[];
  checkins: DailyCheckin[];
  modules: (RoadmapModule & { roadmap_months: { title: string; month_number: number } })[];
  project: (Project & { project_tasks: { status: string }[] }) | null;
  conversations: { id: string; title: string; created_at: string }[];
  today: string;
}

export function DashboardClient({
  profile: serverProfile,
  todayOccurrences,
  checkins,
  modules,
  project,
  conversations,
  today,
}: DashboardClientProps) {
  const { activeProfile } = useAuth();
  const { isBoyMode } = useTheme();

  const currentProfile = activeProfile || serverProfile;
  const effectiveSlug = currentProfile?.slug || (isBoyMode ? "khanishk" : "akshaya");
  const isKhanishk = effectiveSlug === "khanishk";

  const dayInfo = useMemo(() => getProgrammeDayInfo(today), [today]);

  // If DB occurrences are empty for today, fallback to 365-day curriculum daily tasks
  const effectiveTasks = useMemo(() => {
    if (todayOccurrences.length > 0) return todayOccurrences;
    const curriculumTasks = getDailyTasksForDate(effectiveSlug, today);
    return curriculumTasks.map((ct) => ({
      id: ct.id,
      task_id: ct.id,
      owner_id: currentProfile?.id || "local",
      scheduled_date: today,
      original_due_date: today,
      status: "pending" as const,
      completed_at: null,
      actual_duration_minutes: null,
      carry_forward_count: 0,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      study_tasks: {
        id: ct.id,
        owner_id: currentProfile?.id || "local",
        module_id: null,
        title: ct.title,
        description: ct.instructions,
        subject: ct.subject,
        learning_objective: ct.learningObjective,
        duration_minutes: ct.expectedDurationMinutes,
        priority: "high" as const,
        resource_url: ct.requiredResources,
        task_type: ct.category,
        expected_output: ct.expectedOutput,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
  }, [todayOccurrences, effectiveSlug, today, currentProfile?.id]);

  // Stats computation
  const completed = effectiveTasks.filter((o) => o.status === "completed").length;
  const total = effectiveTasks.length;
  const todayPct = getProgressPercentage(completed, total);

  const todayMinutes = effectiveTasks
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.actual_duration_minutes || o.study_tasks?.duration_minutes || 0), 0);

  const overdueTasks = todayOccurrences.filter(
    (o) => o.status === "missed" || (o.status === "pending" && o.original_due_date < today)
  );

  // Streak calculation
  const streak = calculateStreak(checkins, today);

  // Total study hours
  const totalMinutes = checkins.reduce((sum, c) => sum + (c.total_minutes_studied || 0), 0) + todayMinutes;

  // Module progress
  const completedModules = modules.filter((m) => m.status === "completed").length;
  const totalModules = modules.length || 52;
  const overallProgress = getProgressPercentage(completedModules, totalModules);

  // 365-Day Programme Progress
  const journeyDaysPct = getProgressPercentage(dayInfo.dayNumber, 365);
  const daysRemaining = 365 - dayInfo.dayNumber;

  // Project progress
  const projectTasks = project?.project_tasks || [];
  const projectCompleted = projectTasks.filter((t) => t.status === "completed").length;
  const projectProgress = getProgressPercentage(projectCompleted, projectTasks.length || 6);

  const title = isKhanishk ? "Robotics Systems Engineer" : "Industrial & Robotics Product Designer";
  const roleTag = isKhanishk ? "⚡ Boy Mode • Robotics Lab" : "🌸 Girl Mode • Product Studio";

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Greeting Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 p-6 rounded-3xl border shadow-sm"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg"
            style={{
              background: isKhanishk
                ? "linear-gradient(135deg, #2563EB, #38BDF8)"
                : "linear-gradient(135deg, #F5B8CC, #D96B91)",
            }}
          >
            {isKhanishk ? <Cpu className="w-7 h-7" /> : <Palette className="w-7 h-7 text-pink-900" />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border"
                style={{
                  background: isKhanishk ? "rgba(37,99,235,0.15)" : "rgba(217,107,145,0.15)",
                  borderColor: isKhanishk ? "rgba(56,189,248,0.4)" : "rgba(245,184,204,0.6)",
                  color: isKhanishk ? "#38BDF8" : "#D96B91",
                }}
              >
                {roleTag}
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                {dayInfo.dayLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              {currentProfile?.display_name || (isKhanishk ? "Khanishk" : "Akshaya")}&apos;s Dashboard
            </h1>

            <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {title} • Week {dayInfo.weekNumber} of 52 (Month {dayInfo.monthNumber})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/profile-select">
            <Button variant="outline" size="sm">
              Switch Profile
            </Button>
          </Link>
          <Link href="/roadmap">
            <Button size="sm">
              View Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Today's Progress"
          value={`${todayPct}%`}
          sub={`${completed}/${total} tasks completed`}
          color="primary"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Study Time Today"
          value={formatDuration(todayMinutes)}
          sub={`Goal: ${currentProfile?.daily_study_hours || (isKhanishk ? 5.0 : 2.75)} hrs/day`}
          color="neon"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Current Streak"
          value={`${streak} days`}
          sub="daily consistency"
          color="warning"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="365-Day Journey"
          value={`Day ${dayInfo.dayNumber}`}
          sub={`${daysRemaining} days remaining`}
          color="success"
        />
      </div>

      {/* Today Progress + Today Checklist */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's circular progress */}
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center gap-4 py-6">
            <CircularProgress
              value={todayPct}
              size={130}
              strokeWidth={9}
              label={`${todayPct}%`}
              sublabel="completed"
            />
            <div className="text-center">
              <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                {completed} of {total} tasks done
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {total - completed} remaining for today&apos;s goal
              </p>
            </div>
            <Link href="/planner" className="w-full">
              <Button variant="outline" size="sm" className="w-full font-bold">
                Open Daily Planner <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Today's study checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                  Today&apos;s Curriculum Checklist
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Week {dayInfo.weekNumber}: {dayInfo.isRestDay ? "Weekly Assessment & Rest Day" : "Active Robotics Study"}
                </p>
              </div>
              <Link href="/planner">
                <button className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: "var(--primary)" }}>
                  Planner <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardBody className="space-y-2 max-h-72 overflow-y-auto">
            {effectiveTasks.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-8 h-8" />}
                title="No tasks scheduled"
                description="Add tasks to your planner to get started."
                action={<Link href="/planner"><Button size="sm">Plan Today</Button></Link>}
              />
            ) : (
              effectiveTasks.slice(0, 6).map((occ) => (
                <TaskRow key={occ.id} occurrence={occ} />
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div
          className="rounded-2xl border p-4 flex items-center gap-3.5"
          style={{
            background: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.3)",
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""} from Previous Days
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Overdue tasks have been carried forward to keep your momentum without losing history.
            </p>
          </div>
          <Link href="/planner">
            <Button variant="danger" size="sm">Review in Planner</Button>
          </Link>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-bold text-sm sm:text-base" style={{ color: "var(--text-primary)" }}>
              Weekly Study Progress
            </h3>
          </CardHeader>
          <CardBody>
            <WeeklyChart checkins={checkins} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-bold text-sm sm:text-base" style={{ color: "var(--text-primary)" }}>
              Consistency Heatmap
            </h3>
          </CardHeader>
          <CardBody>
            <HeatmapCalendar checkins={checkins} />
          </CardBody>
        </Card>
      </div>

      {/* Roadmap + Shared AMR Project + AI Tutor Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 12-Month Journey Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                12-Month Journey
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <ProgressBar value={journeyDaysPct} showLabel label="365-Day Progress" />
            <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
              <span>Day {dayInfo.dayNumber} of 365</span>
              <span>{daysRemaining} days left</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Current: Month {dayInfo.monthNumber} (Week {dayInfo.weekNumber})
            </p>
            <Link href="/roadmap" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full font-bold">
                Explore Full Roadmap
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Shared Capstone AMR Project */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Shared AMR Project
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              {project?.title || "ROBO MATES AMR — Autonomous Mobile Robot"}
            </p>
            <ProgressBar value={projectProgress} showLabel label="Capstone Stage Progress" />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              6 Collaborative Milestones • Hardware, CAD &amp; Autonomy
            </p>
            <Link href="/projects" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full font-bold">
                Open Capstone Workspace
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Gemini AI Tutor */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Gemini AI Mentor
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {isKhanishk
                ? "Grounded in Python, C++, ROS 2, Gazebo simulation, and SLAM navigation."
                : "Grounded in Industrial Sketching, Fusion 360, DFM/DFA, and Blender rendering."}
            </p>

            {conversations.length > 0 && (
              <div className="space-y-1">
                {conversations.slice(0, 2).map((c) => (
                  <Link
                    key={c.id}
                    href={`/ai-tutor?conversation=${c.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs hover:opacity-80 transition-opacity truncate"
                    style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                  >
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/ai-tutor" className="block pt-1">
              <Button className="w-full font-bold" size="sm">
                <Bot className="w-4 h-4" />
                Ask {isKhanishk ? "Robotics" : "Design"} Mentor
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: "primary" | "neon" | "warning" | "success";
}) {
  const colorMap = {
    primary: "var(--primary)",
    neon: "var(--neon)",
    warning: "var(--warning)",
    success: "var(--success)",
  };
  const c = colorMap[color];

  return (
    <Card hover>
      <CardBody className="space-y-2 p-4 sm:p-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: `${c}20`, color: c }}
        >
          {icon}
        </div>
        <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="text-xl sm:text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {sub}
        </p>
      </CardBody>
    </Card>
  );
}

function TaskRow({
  occurrence,
}: {
  occurrence: TaskOccurrence & { study_tasks: StudyTask };
}) {
  const task = occurrence.study_tasks;
  const isOverdue = occurrence.carry_forward_count > 0 && occurrence.status === "pending";

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
      style={{
        background: occurrence.status === "completed"
          ? "rgba(16,185,129,0.04)"
          : isOverdue
          ? "rgba(239,68,68,0.04)"
          : "var(--bg-secondary)",
        borderColor: occurrence.status === "completed"
          ? "rgba(16,185,129,0.15)"
          : isOverdue
          ? "rgba(239,68,68,0.15)"
          : "var(--border-color)",
      }}
    >
      <CheckCircle2
        className="w-4 h-4 flex-shrink-0"
        style={{
          color: occurrence.status === "completed"
            ? "var(--success)"
            : "var(--border-color)",
        }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-xs sm:text-sm font-semibold truncate"
          style={{
            color: "var(--text-primary)",
            textDecoration: occurrence.status === "completed" ? "line-through" : "none",
            opacity: occurrence.status === "completed" ? 0.6 : 1,
          }}
        >
          {task?.title || "Task"}
          {isOverdue && (
            <span className="ml-1 text-[10px] text-red-400 font-bold">(carried)</span>
          )}
        </p>
        <p className="text-[10px] sm:text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {task?.subject} • {formatDuration(task?.duration_minutes || 45)}
        </p>
      </div>
      <TaskStatusBadge status={occurrence.status} />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
      <div style={{ color: "var(--text-muted)" }}>{icon}</div>
      <div>
        <p className="font-semibold text-sm" style={{ color: "var(--text-secondary)" }}>
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function calculateStreak(checkins: DailyCheckin[], today: string): number {
  if (checkins.length === 0) return 1; // Start with 1 on first active day

  const sortedDates = checkins
    .filter((c) => c.tasks_completed > 0)
    .map((c) => c.study_date)
    .sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) return 1;

  let streak = 0;
  let currentDate = today;

  for (const date of sortedDates) {
    if (date === currentDate) {
      streak++;
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = d.toISOString().split("T")[0];
    } else if (date < currentDate) {
      break;
    }
  }

  return Math.max(1, streak);
}
