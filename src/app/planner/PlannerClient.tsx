// src/app/planner/PlannerClient.tsx
"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Check, Clock, SkipForward,
  Timer, Pause, Play, Trash2, Edit3, Calendar,
  RefreshCw, CheckCircle2, AlertCircle, BookOpen, Target, Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, TaskStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDuration, getProgressPercentage } from "@/lib/utils";
import { getProgrammeDayInfo, getDailyTasksForDate, getMonth1DayPlan, type GeneratedDailyTask } from "@/lib/curriculum-engine";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import type { Profile, Priority, TaskStatus } from "@/types/database";

interface PlannerClientProps {
  userId: string;
  profile: Profile | null;
  modules: { id: string; title: string; week_number?: number }[];
  today: string;
}

export interface PlannerTaskItem {
  id: string; // Database occurrence id or local synthetic id
  taskId: string;
  title: string;
  description?: string | null;
  subject: string;
  learningObjective?: string | null;
  durationMinutes: number;
  actualDurationMinutes?: number | null;
  priority: Priority;
  taskType: "theory" | "practical" | "exercise" | "assessment" | "project" | "revision";
  status: TaskStatus;
  scheduledDate: string;
  originalDueDate: string;
  carryForwardCount: number;
  notes?: string | null;
  expectedOutput?: string | null;
  resourceUrl?: string | null;
  isCurriculumTask: boolean;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "critical", label: "Critical Priority" },
];

const TASK_TYPE_OPTIONS = [
  { value: "theory", label: "Theory & Principles" },
  { value: "practical", label: "Hands-on Practical" },
  { value: "exercise", label: "Lab Exercise / Coding" },
  { value: "project", label: "AMR Robotics Project" },
  { value: "assessment", label: "Assessment / Quiz" },
  { value: "revision", label: "Revision & Review" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Tasks" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "postponed", label: "Postponed" },
  { value: "skipped", label: "Skipped" },
];

interface TaskFormState {
  title: string;
  description: string;
  subject: string;
  learning_objective: string;
  duration_minutes: number;
  priority: Priority;
  resource_url: string;
  task_type: "theory" | "practical" | "exercise" | "assessment" | "project" | "revision";
  expected_output: string;
  scheduled_date: string;
}

export function PlannerClient({ userId, profile: initialProfile, modules, today }: PlannerClientProps) {
  const { activeProfile } = useAuth();
  const currentProfile = activeProfile || initialProfile;
  const effectiveSlug = currentProfile?.slug || "khanishk";
  const effectiveProfileId = currentProfile?.id || userId;

  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<PlannerTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal & Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerTaskItem | null>(null);
  const [form, setForm] = useState<TaskFormState>({
    title: "",
    description: "",
    subject: effectiveSlug === "khanishk" ? "Robotics Engineering" : "Industrial Product Design",
    learning_objective: "",
    duration_minutes: 45,
    priority: "medium",
    resource_url: "",
    task_type: "practical",
    expected_output: "",
    scheduled_date: today,
  });
  const [saving, setSaving] = useState(false);

  // Live Study Timer
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const { success, error: showError, info } = useToast();
  const { isBoyMode } = useTheme();
  const supabase = createClient();

  const dayInfo = useMemo(() => getProgrammeDayInfo(selectedDate), [selectedDate]);

  const {
    isItemCompleted,
    toggleItem,
    getDayProgress: getChecklistDayProgress,
    getMonthProgress: getChecklistMonthProgress,
  } = useChecklistProgress(effectiveProfileId);

  const month1Plan = useMemo(() => {
    if (effectiveSlug === "khanishk" && dayInfo.dayNumber >= 1 && dayInfo.dayNumber <= 30) {
      return getMonth1DayPlan(dayInfo.dayNumber);
    }
    return undefined;
  }, [effectiveSlug, dayInfo.dayNumber]);

  // Timer Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Load Tasks for Selected Date
  const fetchTasks = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Fetch custom/persisted tasks from Supabase
      const { data: dbData } = await supabase
        .from("task_occurrences")
        .select("*, study_tasks(*)")
        .or(`owner_id.eq.${effectiveProfileId},owner_id.eq.${userId}`)
        .eq("scheduled_date", selectedDate)
        .order("created_at");

      const dbTasks: PlannerTaskItem[] = (dbData || []).map((row: any) => ({
        id: row.id,
        taskId: row.task_id,
        title: row.study_tasks?.title || "Untitled Task",
        description: row.study_tasks?.description,
        subject: row.study_tasks?.subject || "General",
        learningObjective: row.study_tasks?.learning_objective,
        durationMinutes: row.study_tasks?.duration_minutes || 45,
        actualDurationMinutes: row.actual_duration_minutes,
        priority: (row.study_tasks?.priority as Priority) || "medium",
        taskType: (row.study_tasks?.task_type as any) || "practical",
        status: row.status as TaskStatus,
        scheduledDate: row.scheduled_date,
        originalDueDate: row.original_due_date,
        carryForwardCount: row.carry_forward_count || 0,
        notes: row.notes,
        expectedOutput: row.study_tasks?.expected_output,
        resourceUrl: row.study_tasks?.resource_url,
        isCurriculumTask: false,
      }));

      // 2. Fetch structured 365-day curriculum tasks for this date & profile
      const curriculumTasks = getDailyTasksForDate(effectiveSlug, selectedDate);

      // Check which curriculum tasks have already been saved to DB or completed
      const savedTaskTitles = new Set(dbTasks.map((t) => t.title.toLowerCase().trim()));

      const generatedItems: PlannerTaskItem[] = curriculumTasks
        .filter((ct) => !savedTaskTitles.has(ct.title.toLowerCase().trim()))
        .map((ct) => ({
          id: ct.id,
          taskId: ct.id,
          title: ct.title,
          description: ct.instructions,
          subject: ct.subject,
          learningObjective: ct.learningObjective,
          durationMinutes: ct.expectedDurationMinutes,
          actualDurationMinutes: null,
          priority: "high",
          taskType: ct.category,
          status: "pending",
          scheduledDate: selectedDate,
          originalDueDate: selectedDate,
          carryForwardCount: 0,
          expectedOutput: ct.expectedOutput,
          resourceUrl: ct.requiredResources,
          isCurriculumTask: true,
        }));

      // Merge: DB tasks first, then curriculum tasks
      setTasks([...dbTasks, ...generatedItems]);
    } catch (err: any) {
      console.warn("Notice: Loaded local curriculum tasks:", err?.message || err);
      const curriculumTasks = getDailyTasksForDate(effectiveSlug, selectedDate);
      setTasks(
        curriculumTasks.map((ct) => ({
          id: ct.id,
          taskId: ct.id,
          title: ct.title,
          description: ct.instructions,
          subject: ct.subject,
          learningObjective: ct.learningObjective,
          durationMinutes: ct.expectedDurationMinutes,
          actualDurationMinutes: null,
          priority: "high",
          taskType: ct.category,
          status: "pending",
          scheduledDate: selectedDate,
          originalDueDate: selectedDate,
          carryForwardCount: 0,
          expectedOutput: ct.expectedOutput,
          resourceUrl: ct.requiredResources,
          isCurriculumTask: true,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [effectiveProfileId, effectiveSlug, selectedDate, supabase, userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Date Navigation
  const navigateDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // Stats calculation
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.length;
  const totalMinutes = tasks.reduce((acc, t) => acc + t.durationMinutes, 0);
  const completedMinutes = tasks
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + (t.actualDurationMinutes || t.durationMinutes), 0);
  const progressPercent = getProgressPercentage(completedCount, totalCount);

  // Filtered Tasks
  const filteredTasks = filterStatus === "all"
    ? tasks
    : tasks.filter((t) => t.status === filterStatus);

  // Mark Complete Action
  const handleToggleComplete = async (task: PlannerTaskItem) => {
    const nextStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";
    const actualMins = activeTimerTaskId === task.id ? Math.max(1, Math.round(timerSeconds / 60)) : task.durationMinutes;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: nextStatus,
              actualDurationMinutes: nextStatus === "completed" ? actualMins : null,
            }
          : t
      )
    );

    if (activeTimerTaskId === task.id) {
      setIsTimerRunning(false);
      setActiveTimerTaskId(null);
      setTimerSeconds(0);
    }

    try {
      if (task.isCurriculumTask) {
        // Persist curriculum task to DB
        const { data: newDbTask } = await supabase.from("study_tasks").insert({
          owner_id: effectiveProfileId,
          title: task.title,
          description: task.description || null,
          subject: task.subject,
          learning_objective: task.learningObjective || null,
          duration_minutes: task.durationMinutes,
          priority: task.priority,
          task_type: task.taskType,
          expected_output: task.expectedOutput || null,
        }).select().single();

        if (newDbTask) {
          await supabase.from("task_occurrences").insert({
            task_id: newDbTask.id,
            owner_id: effectiveProfileId,
            scheduled_date: selectedDate,
            original_due_date: selectedDate,
            status: nextStatus,
            completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
            actual_duration_minutes: nextStatus === "completed" ? actualMins : null,
          });
        }
      } else {
        await supabase
          .from("task_occurrences")
          .update({
            status: nextStatus,
            completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
            actual_duration_minutes: nextStatus === "completed" ? actualMins : null,
          })
          .eq("id", task.id);
      }

      if (nextStatus === "completed") {
        success("Task completed!", `Recorded for ${currentProfile?.display_name || "Co-Founder"}`);
      }
    } catch (e: any) {
      console.warn("Notice: Task completed locally:", e?.message || e);
    }
  };

  // Postpone Task Action (Missed-Task Recovery)
  const handlePostpone = async (task: PlannerTaskItem) => {
    const nextDateObj = new Date(selectedDate);
    nextDateObj.setDate(nextDateObj.getDate() + 1);
    const tomorrowStr = nextDateObj.toISOString().split("T")[0];

    // Optimistically update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: "postponed",
              carryForwardCount: t.carryForwardCount + 1,
            }
          : t
      )
    );

    try {
      if (!task.isCurriculumTask) {
        await supabase
          .from("task_occurrences")
          .update({
            scheduled_date: tomorrowStr,
            status: "pending",
            carry_forward_count: task.carryForwardCount + 1,
          })
          .eq("id", task.id);
      }
      info("Task postponed to tomorrow", `Carried forward to ${tomorrowStr}`);
    } catch (e: any) {
      console.warn("Notice: Postponed locally:", e);
    }
  };

  // Skip Task Action
  const handleSkip = async (task: PlannerTaskItem) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "skipped" } : t))
    );

    try {
      if (!task.isCurriculumTask) {
        await supabase
          .from("task_occurrences")
          .update({ status: "skipped" })
          .eq("id", task.id);
      }
      info("Task skipped", "Will not appear in overdue backlog");
    } catch (e) {
      console.warn("Notice: Skipped locally", e);
    }
  };

  // Delete Task Action
  const handleDelete = async (task: PlannerTaskItem) => {
    if (!confirm(`Delete "${task.title}"?`)) return;

    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    try {
      if (!task.isCurriculumTask) {
        await supabase.from("task_occurrences").delete().eq("id", task.id);
      }
      success("Task removed");
    } catch (e) {
      console.warn("Notice: Deleted locally", e);
    }
  };

  // Save / Add Task Handler
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showError("Please enter a task title");
      return;
    }

    setSaving(true);

    try {
      const { data: newTask, error: taskErr } = await supabase
        .from("study_tasks")
        .insert({
          owner_id: effectiveProfileId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          subject: form.subject.trim(),
          learning_objective: form.learning_objective.trim() || null,
          duration_minutes: Number(form.duration_minutes) || 45,
          priority: form.priority,
          task_type: form.task_type,
          expected_output: form.expected_output.trim() || null,
          resource_url: form.resource_url.trim() || null,
        })
        .select()
        .single();

      if (taskErr) throw taskErr;

      const { data: newOcc, error: occErr } = await supabase
        .from("task_occurrences")
        .insert({
          task_id: newTask.id,
          owner_id: effectiveProfileId,
          scheduled_date: form.scheduled_date || selectedDate,
          original_due_date: form.scheduled_date || selectedDate,
          status: "pending",
          carry_forward_count: 0,
        })
        .select()
        .single();

      if (occErr) throw occErr;

      // Add to local state immediately if matching selected date
      if (form.scheduled_date === selectedDate) {
        const addedItem: PlannerTaskItem = {
          id: newOcc.id,
          taskId: newTask.id,
          title: newTask.title,
          description: newTask.description,
          subject: newTask.subject,
          learningObjective: newTask.learning_objective,
          durationMinutes: newTask.duration_minutes,
          actualDurationMinutes: null,
          priority: newTask.priority as Priority,
          taskType: newTask.task_type as any,
          status: "pending",
          scheduledDate: selectedDate,
          originalDueDate: selectedDate,
          carryForwardCount: 0,
          expectedOutput: newTask.expected_output,
          resourceUrl: newTask.resource_url,
          isCurriculumTask: false,
        };

        setTasks((prev) => [addedItem, ...prev]);
      }

      success("Task added to planner!", `Scheduled for ${form.scheduled_date || selectedDate}`);
      setShowAddModal(false);
      setForm({
        title: "",
        description: "",
        subject: effectiveSlug === "khanishk" ? "Robotics Engineering" : "Industrial Product Design",
        learning_objective: "",
        duration_minutes: 45,
        priority: "medium",
        resource_url: "",
        task_type: "practical",
        expected_output: "",
        scheduled_date: selectedDate,
      });
    } catch (err: any) {
      console.warn("Notice: Created task locally:", err?.message || err);
      // Fallback local task
      const fallbackId = `manual-task-${Date.now()}`;
      const localTask: PlannerTaskItem = {
        id: fallbackId,
        taskId: fallbackId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        subject: form.subject.trim(),
        learningObjective: form.learning_objective.trim() || null,
        durationMinutes: Number(form.duration_minutes) || 45,
        actualDurationMinutes: null,
        priority: form.priority,
        taskType: form.task_type,
        status: "pending",
        scheduledDate: selectedDate,
        originalDueDate: selectedDate,
        carryForwardCount: 0,
        expectedOutput: form.expected_output.trim() || null,
        resourceUrl: form.resource_url.trim() || null,
        isCurriculumTask: false,
      };

      setTasks((prev) => [localTask, ...prev]);
      success("Task added locally!", `Scheduled for ${selectedDate}`);
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  // Timer controls
  const handleStartTimer = (taskId: string) => {
    setActiveTimerTaskId(taskId);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const handlePauseResumeTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleStopTimer = (task: PlannerTaskItem) => {
    handleToggleComplete(task);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-16 w-full min-w-0">
      {/* Date Header & Calendar Navigation */}
      <Card className="w-full min-w-0">
        <CardBody className="p-3.5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0"
                  style={{
                    background: isBoyMode ? "rgba(37,99,235,0.15)" : "rgba(217,107,145,0.15)",
                    borderColor: isBoyMode ? "rgba(56,189,248,0.4)" : "rgba(245,184,204,0.6)",
                    color: isBoyMode ? "#38BDF8" : "#D96B91",
                  }}
                >
                  {effectiveSlug === "khanishk" ? "Khanishk • Robotics" : "Akshaya • Product Design"}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold truncate" style={{ color: "var(--text-muted)" }}>
                  {dayInfo.dayLabel}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
                Week {dayInfo.weekNumber} • Month {dayInfo.monthNumber}
                {dayInfo.isRestDay && " (Review & Rest Day)"}
              </h2>
            </div>

            {/* Date Navigator & Add Task */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-start pt-1 sm:pt-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => navigateDays(-1)}
                  className="p-1.5 sm:p-2 rounded-xl border hover:opacity-80 transition-opacity"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDate(today)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-bold transition-all hover:opacity-80"
                  style={{
                    background: selectedDate === today ? "var(--primary)" : "var(--bg-secondary)",
                    color: selectedDate === today ? "white" : "var(--text-primary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() => navigateDays(1)}
                  className="p-1.5 sm:p-2 rounded-xl border hover:opacity-80 transition-opacity"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={() => {
                  setForm((f) => ({ ...f, scheduled_date: selectedDate }));
                  setShowAddModal(true);
                }}
                size="sm"
                className="flex items-center gap-1 font-bold text-xs"
              >
                <Plus className="w-4 h-4" /> Add Task
              </Button>
            </div>
          </div>

          {/* Daily Progress Bar & Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-4 border-t w-full" style={{ borderColor: "var(--border-color)" }}>
            <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Completion</p>
              <p className="text-lg font-black mt-0.5" style={{ color: "var(--text-primary)" }}>
                {completedCount}/{totalCount} <span className="text-xs font-semibold text-muted-foreground">({progressPercent}%)</span>
              </p>
            </div>

            <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Target Hours</p>
              <p className="text-lg font-black mt-0.5" style={{ color: "var(--text-primary)" }}>
                {formatDuration(totalMinutes)}
              </p>
            </div>

            <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Studied Today</p>
              <p className="text-lg font-black mt-0.5" style={{ color: isBoyMode ? "#38BDF8" : "#D96B91" }}>
                {formatDuration(completedMinutes)}
              </p>
            </div>

            <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Focus Mode</p>
              <p className="text-base sm:text-lg font-black mt-0.5 truncate" style={{ color: "var(--text-primary)" }}>
                {effectiveSlug === "khanishk" ? (dayInfo.dayNumber <= 30 ? "Python & Git CLI" : "Kinematics & ROS 2") : "Sketching & CAD"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar value={progressPercent} label="Daily Study Goal Progress" showLabel />
          </div>
        </CardBody>
      </Card>

      {/* Active Live Timer Card if Running */}
      {activeTimerTaskId && (
        <Card className="border-2 animate-pulse" style={{ borderColor: isBoyMode ? "#38BDF8" : "#D96B91" }}>
          <CardBody className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: isBoyMode ? "#2563EB" : "#D96B91" }}
              >
                <Timer className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Live Study Session Active
                </p>
                <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                  {tasks.find((t) => t.id === activeTimerTaskId)?.title || "Study Session"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xl sm:text-2xl font-black" style={{ color: isBoyMode ? "#38BDF8" : "#D96B91" }}>
                {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")}
              </span>

              <button
                type="button"
                onClick={handlePauseResumeTimer}
                className="p-2 rounded-xl border hover:opacity-80 transition-opacity"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
                title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <Button
                size="sm"
                onClick={() => {
                  const t = tasks.find((tk) => tk.id === activeTimerTaskId);
                  if (t) handleStopTimer(t);
                }}
              >
                <Check className="w-3.5 h-3.5" /> Complete Task
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Official Month 1 Daily Study Checklist from Authoritative Curriculum */}
      {month1Plan && (
        <Card className="border-2 overflow-hidden shadow-lg" style={{ borderColor: "var(--border-color)" }}>
          <CardHeader
            className="p-4 sm:p-5 border-b"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      color: "var(--primary)",
                    }}
                  >
                    DAY {month1Plan.dayNumber.toString().padStart(2, "0")} • {month1Plan.type}
                  </span>
                  <span className="text-xs font-semibold text-sky-400">
                    {month1Plan.hours > 0 ? `${month1Plan.hours} Planned Hours` : "Rest & Review"}
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg" style={{ color: "var(--text-primary)" }}>
                  {month1Plan.topic}
                </h3>
              </div>

              {/* Day's Checklist Progress Badge */}
              {(() => {
                const prog = getChecklistDayProgress(month1Plan.dayNumber, month1Plan.checklistItems.length);
                return (
                  <div
                    className="px-3 py-1.5 rounded-xl border flex items-center gap-2 flex-shrink-0"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: prog.completed === prog.total ? "#34D399" : "var(--primary)" }}>
                        {prog.completed}/{prog.total} Checked
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {prog.percentage}% Complete
                      </p>
                    </div>
                    {prog.completed === prog.total ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-dashed flex items-center justify-center text-[10px] text-slate-400">
                        {prog.completed}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </CardHeader>

          <CardBody className="p-4 sm:p-5 space-y-4">
            {/* 3 Pillars Summary: Study, Do, Save */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                <span className="font-bold text-sky-400 block mb-0.5">Study Subtopics:</span>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{month1Plan.study}</p>
              </div>
              <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                <span className="font-bold text-amber-400 block mb-0.5">Practical Lab / Coding:</span>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{month1Plan.do}</p>
              </div>
              <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                <span className="font-bold text-emerald-400 block mb-0.5">Deliverable to Save:</span>
                <p className="text-[11px] leading-relaxed font-mono" style={{ color: "var(--text-secondary)" }}>{month1Plan.save}</p>
              </div>
            </div>

            {/* Checklist Checkboxes */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                Actionable Daily Checklist (Independent Checkboxes)
              </p>
              <div className="space-y-2">
                {month1Plan.checklistItems.map((item) => {
                  const checked = isItemCompleted(month1Plan.dayNumber, item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all"
                      style={{
                        background: checked ? "var(--bg-secondary)" : "var(--bg-card)",
                        borderColor: checked ? "var(--primary)40" : "var(--border-color)",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleItem(month1Plan.dayNumber, item.id);
                      }}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {checked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-500" />
                        )}
                      </div>
                      <span
                        className="text-xs sm:text-sm leading-relaxed flex-1"
                        style={{
                          color: checked ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: checked ? "line-through" : "none",
                        }}
                      >
                        {item.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
        <div className="flex items-center gap-1.5 p-1 rounded-xl border flex-shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
          {STATUS_FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilterStatus(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: filterStatus === f.value ? "var(--primary)" : "transparent",
                color: filterStatus === f.value ? "white" : "var(--text-muted)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold px-2" style={{ color: "var(--text-muted)" }}>
          Showing {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="flex flex-col items-center">
            <BookOpen className="w-12 h-12 mb-3 opacity-30" style={{ color: "var(--primary)" }} />
            <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              No tasks found for this view
            </h3>
            <p className="text-xs max-w-sm mb-4" style={{ color: "var(--text-muted)" }}>
              {filterStatus !== "all"
                ? `No tasks with status "${filterStatus}". Try selecting "All Tasks".`
                : "Add your first personal study task or generate curriculum modules."}
            </p>
            <Button onClick={() => setShowAddModal(true)} size="sm">
              <Plus className="w-4 h-4" /> Add Task Now
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isPostponed = task.status === "postponed";
            const isSkipped = task.status === "skipped";
            const isTimerActive = activeTimerTaskId === task.id;

            return (
              <div
                key={task.id}
                className="group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg"
                style={{
                  background: isCompleted ? "var(--bg-secondary)90" : "var(--bg-card)",
                  borderColor: isTimerActive
                    ? (isBoyMode ? "#38BDF8" : "#D96B91")
                    : (isCompleted ? "var(--border-color)" : "var(--border-color)"),
                  opacity: isSkipped ? 0.6 : 1,
                }}
              >
                <div className="flex items-start gap-3.5">
                  {/* Complete Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                    style={{
                      borderColor: isCompleted ? "var(--success)" : "var(--border-color)",
                      background: isCompleted ? "var(--success)" : "transparent",
                    }}
                    title={isCompleted ? "Mark Pending" : "Mark Complete"}
                  >
                    {isCompleted && <Check className="w-4 h-4 text-white font-black" />}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-semibold text-xs px-2 py-0.5 rounded-md border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
                        {task.subject}
                      </span>
                      <TaskStatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />

                      {task.isCurriculumTask && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-500/10 text-sky-400 border-blue-500/30">
                          52-Week Curriculum
                        </span>
                      )}

                      {task.carryForwardCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30">
                          Overdue (+{task.carryForwardCount}d)
                        </span>
                      )}
                    </div>

                    <h4
                      className="font-bold text-sm sm:text-base leading-snug"
                      style={{
                        color: isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: isCompleted ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {task.description}
                      </p>
                    )}

                    {task.expectedOutput && (
                      <p className="text-xs mt-1.5 font-medium flex items-center gap-1.5" style={{ color: isBoyMode ? "#38BDF8" : "#D96B91" }}>
                        <Target className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Expected Output: {task.expectedOutput}</span>
                      </p>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {task.actualDurationMinutes
                          ? `${task.actualDurationMinutes} mins (actual) / ${task.durationMinutes} mins`
                          : `${task.durationMinutes} mins`}
                      </span>

                      {task.learningObjective && (
                        <span className="truncate max-w-xs hidden sm:inline" title={task.learningObjective}>
                          Objective: {task.learningObjective}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Live Timer Trigger */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => (isTimerActive ? handlePauseResumeTimer() : handleStartTimer(task.id))}
                        className="p-1.5 rounded-lg border hover:scale-105 transition-all"
                        style={{
                          background: isTimerActive ? "var(--primary)" : "var(--bg-secondary)",
                          color: isTimerActive ? "white" : "var(--text-secondary)",
                          borderColor: "var(--border-color)",
                        }}
                        title={isTimerActive ? "Pause Timer" : "Start Live Study Timer"}
                      >
                        <Timer className="w-4 h-4" />
                      </button>
                    )}

                    {/* Postpone button */}
                    {!isCompleted && !isPostponed && (
                      <button
                        type="button"
                        onClick={() => handlePostpone(task)}
                        className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                        title="Postpone to Tomorrow"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    )}

                    {/* Skip button */}
                    {!isCompleted && !isSkipped && (
                      <button
                        type="button"
                        onClick={() => handleSkip(task)}
                        className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity text-amber-400"
                        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
                        title="Skip Task"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete button (for non-curriculum tasks) */}
                    {!task.isCurriculumTask && (
                      <button
                        type="button"
                        onClick={() => handleDelete(task)}
                        className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity text-red-400"
                        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Task Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Personal Study Task"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Implement differential drive obstacle avoidance algorithm"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject / Topic *"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. ROS 2 / C++ / Fusion 360"
              required
            />

            <Select
              label="Task Category"
              value={form.task_type}
              onChange={(e) => setForm((f) => ({ ...f, task_type: e.target.value as any }))}
              options={TASK_TYPE_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Duration (minutes) *"
              type="number"
              min={10}
              max={240}
              value={form.duration_minutes}
              onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
              required
            />

            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
              options={PRIORITY_OPTIONS}
            />

            <Input
              label="Scheduled Date *"
              type="date"
              value={form.scheduled_date}
              onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Concrete Expected Output"
            value={form.expected_output}
            onChange={(e) => setForm((f) => ({ ...f, expected_output: e.target.value }))}
            placeholder="e.g. Published kinematics node on GitHub / Rendered A3 sketch sheet"
          />

          <Textarea
            label="Detailed Instructions & Learning Objective"
            value={form.description || form.learning_objective}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                description: e.target.value,
                learning_objective: e.target.value,
              }))
            }
            placeholder="Specify steps, resource links, and verification checks..."
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Task to Planner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
