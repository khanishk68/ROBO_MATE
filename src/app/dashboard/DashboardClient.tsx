// src/app/dashboard/DashboardClient.tsx
"use client";
import React from "react";
import Link from "next/link";
import {
  Flame, Clock, Target, CheckCircle2, AlertCircle,
  ArrowRight, Bot, Rocket, Calendar, TrendingUp, Zap,
  BookOpen, ChevronRight
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ProgressBar, CircularProgress } from "@/components/ui/ProgressBar";
import { TaskStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { getGreeting, formatDuration, getProgressPercentage } from "@/lib/utils";
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
  profile,
  todayOccurrences,
  checkins,
  modules,
  project,
  conversations,
  today,
}: DashboardClientProps) {
  const { isBoyMode } = useTheme();

  // Stats computation
  const completed = todayOccurrences.filter((o) => o.status === "completed").length;
  const total = todayOccurrences.length;
  const todayPct = getProgressPercentage(completed, total);

  const todayMinutes = todayOccurrences
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.actual_duration_minutes || o.study_tasks?.duration_minutes || 0), 0);

  const overdueTasks = todayOccurrences.filter(
    (o) => o.status === "missed" || (o.status === "pending" && o.original_due_date < today)
  );

  // Streak calculation
  const streak = calculateStreak(checkins, today);

  // Total study hours from checkins
  const totalMinutes = checkins.reduce((sum, c) => sum + (c.total_minutes_studied || 0), 0);

  // Module progress
  const completedModules = modules.filter((m) => m.status === "completed").length;
  const totalModules = modules.length;
  const overallProgress = getProgressPercentage(completedModules, totalModules);

  // Journey progress
  const startDate = profile?.journey_start_date;
  const targetDate = profile?.journey_target_date;
  let journeyDaysPct = 0;
  let daysElapsed = 0;
  let daysRemaining = 365;
  if (startDate && targetDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const totalDuration = end - start;
    daysElapsed = Math.round((now - start) / 86400000);
    daysRemaining = Math.round((end - now) / 86400000);
    journeyDaysPct = getProgressPercentage(Math.max(0, now - start), totalDuration);
  }

  // Project progress
  const projectTasks = project?.project_tasks || [];
  const projectCompleted = projectTasks.filter((t) => t.status === "completed").length;
  const projectProgress = getProgressPercentage(projectCompleted, projectTasks.length);

  const title = isBoyMode ? "Robotics Engineer" : "Product Designer";
  const roleTag = isBoyMode ? "🤖 Boy Mode" : "🎨 Girl Mode";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            {getGreeting()} •{" "}
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl lg:text-3xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
            {profile?.display_name || "Welcome back"}{" "}
            <span className="gradient-text">{isBoyMode ? "⚡" : "🌸"}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {title} in Training
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold border"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            {roleTag}
          </span>
          {startDate && (
            <Link href="/roadmap">
              <Button variant="outline" size="sm">
                View Journey <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Today's Progress"
          value={`${todayPct}%`}
          sub={`${completed}/${total} tasks`}
          color="primary"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Study Time Today"
          value={formatDuration(todayMinutes)}
          sub="of your daily goal"
          color="neon"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Current Streak"
          value={`${streak}d`}
          sub="consecutive days"
          color="warning"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Hours"
          value={formatDuration(totalMinutes)}
          sub="all time"
          color="success"
        />
      </div>

      {/* Today Progress + Overdue */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Today's circular progress */}
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center gap-4 py-6">
            <CircularProgress
              value={todayPct}
              size={120}
              strokeWidth={8}
              label={`${todayPct}%`}
              sublabel="today"
            />
            <div className="text-center">
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {completed} of {total} tasks done
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {total - completed} remaining today
              </p>
            </div>
            <Link href="/planner" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Open Planner <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Today's checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Today&apos;s Study Plan
              </h3>
              <Link href="/planner">
                <button className="text-xs flex items-center gap-1" style={{ color: "var(--primary)" }}>
                  See all <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardBody className="space-y-2 max-h-64 overflow-y-auto">
            {todayOccurrences.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-8 h-8" />}
                title="No tasks scheduled"
                description="Add tasks to your planner to get started."
                action={<Link href="/planner"><Button size="sm">Plan Today</Button></Link>}
              />
            ) : (
              todayOccurrences.slice(0, 6).map((occ) => (
                <TaskRow key={occ.id} occurrence={occ} />
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div
          className="rounded-xl border p-4 flex items-center gap-3"
          style={{
            background: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.3)",
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              These have been automatically rescheduled to today.
            </p>
          </div>
          <Link href="/planner">
            <Button variant="danger" size="sm">Review</Button>
          </Link>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Weekly Progress
            </h3>
          </CardHeader>
          <CardBody>
            <WeeklyChart checkins={checkins} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Study Heatmap
            </h3>
          </CardHeader>
          <CardBody>
            <HeatmapCalendar checkins={checkins} />
          </CardBody>
        </Card>
      </div>

      {/* Roadmap + Project + AI Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Roadmap Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                12-Month Journey
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {startDate ? (
              <>
                <ProgressBar value={overallProgress} showLabel label="Overall progress" />
                <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>Day {daysElapsed}</span>
                  <span>{daysRemaining} days left</span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {completedModules}/{totalModules} modules completed
                </p>
                <Link href="/roadmap">
                  <Button variant="outline" size="sm" className="w-full">
                    View Roadmap
                  </Button>
                </Link>
              </>
            ) : (
              <EmptyState
                icon={<Rocket className="w-7 h-7" />}
                title="Journey not started"
                description="Set your start date to begin your 12-month robotics journey."
                action={
                  <Link href="/roadmap">
                    <Button size="sm">Start Journey</Button>
                  </Link>
                }
              />
            )}
          </CardBody>
        </Card>

        {/* Shared Project */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "var(--neon)" }} />
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Shared Project
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {project ? (
              <>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {project.title}
                </p>
                <ProgressBar value={projectProgress} showLabel />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {projectCompleted}/{projectTasks.length} tasks complete
                </p>
                <Link href="/projects">
                  <Button variant="outline" size="sm" className="w-full">
                    View Project
                  </Button>
                </Link>
              </>
            ) : (
              <EmptyState
                icon={<Zap className="w-7 h-7" />}
                title="No active project"
                description="Your shared robotics project will appear here."
                action={<Link href="/projects"><Button size="sm">View Projects</Button></Link>}
              />
            )}
          </CardBody>
        </Card>

        {/* AI Tutor */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                AI Tutor
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isBoyMode
                ? "Your Robotics Engineering mentor powered by Gemini AI."
                : "Your Industrial Design mentor powered by Gemini AI."}
            </p>

            {conversations.length > 0 && (
              <div className="space-y-1">
                {conversations.slice(0, 2).map((c) => (
                  <Link
                    key={c.id}
                    href={`/ai-tutor?conversation=${c.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs hover:opacity-80 transition-opacity"
                    style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                  >
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/ai-tutor" className="block">
              <Button className="w-full" size="sm">
                <Bot className="w-4 h-4" />
                Ask AI Tutor
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
      <CardBody className="space-y-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${c}20`, color: c }}
        >
          {icon}
        </div>
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
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
  const isOverdue =
    occurrence.carry_forward_count > 0 && occurrence.status === "pending";

  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-xl border transition-colors"
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
          className="text-sm font-medium truncate"
          style={{
            color: "var(--text-primary)",
            textDecoration: occurrence.status === "completed" ? "line-through" : "none",
            opacity: occurrence.status === "completed" ? 0.6 : 1,
          }}
        >
          {task?.title || "Task"}
          {isOverdue && (
            <span className="ml-1 text-xs text-red-400">(carried)</span>
          )}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {task?.subject} • {formatDuration(task?.duration_minutes || 30)}
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
    <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
      <div style={{ color: "var(--text-muted)" }}>{icon}</div>
      <div>
        <p className="font-medium text-sm" style={{ color: "var(--text-secondary)" }}>
          {title}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function calculateStreak(checkins: DailyCheckin[], today: string): number {
  if (checkins.length === 0) return 0;

  const sortedDates = checkins
    .filter((c) => c.tasks_completed > 0)
    .map((c) => c.study_date)
    .sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) return 0;

  let streak = 0;
  let currentDate = today;

  for (const date of sortedDates) {
    if (date === currentDate) {
      streak++;
      // Move to previous day
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = d.toISOString().split("T")[0];
    } else if (date < currentDate) {
      break;
    }
  }

  return streak;
}

