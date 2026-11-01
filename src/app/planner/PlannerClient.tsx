// src/app/planner/PlannerClient.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Check, Clock, SkipForward,
  Timer, Pause, Play, Trash2, Edit3, AlertTriangle, ExternalLink,
  RefreshCw
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
import { useTheme } from "@/contexts/ThemeContext";
import { formatDuration, getProgressPercentage } from "@/lib/utils";
import type { Profile, TaskOccurrence, StudyTask, RoadmapModule, Priority, TaskStatus } from "@/types/database";

interface PlannerClientProps {
  userId: string;
  profile: Profile | null;
  modules: { id: string; title: string; week_number?: number }[];
  today: string;
}

type OccurrenceWithTask = TaskOccurrence & { study_tasks: StudyTask };

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: "low",      label: "Low" },
  { value: "medium",   label: "Medium" },
  { value: "high",     label: "High" },
  { value: "critical", label: "Critical" },
];

const TASK_TYPE_OPTIONS = [
  { value: "theory",     label: "Theory" },
  { value: "practical",  label: "Practical" },
  { value: "exercise",   label: "Exercise" },
  { value: "assessment", label: "Assessment" },
  { value: "project",    label: "Project" },
  { value: "revision",   label: "Revision" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all",         label: "All" },
  { value: "pending",     label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed",   label: "Completed" },
  { value: "missed",      label: "Missed" },
  { value: "skipped",     label: "Skipped" },
];

interface TaskForm {
  title: string;
  description: string;
  subject: string;
  learning_objective: string;
  duration_minutes: number;
  priority: string;
  resource_url: string;
  task_type: string;
  module_id: string;
}

const defaultForm: TaskForm = {
  title: "",
  description: "",
  subject: "",
  learning_objective: "",
  duration_minutes: 45,
  priority: "medium",
  resource_url: "",
  task_type: "theory",
  module_id: "",
};

export function PlannerClient({ userId, profile, modules, today }: PlannerClientProps) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [occurrences, setOccurrences] = useState<OccurrenceWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<OccurrenceWithTask | null>(null);
  const [form, setForm] = useState<TaskForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [timerOcc, setTimerOcc] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const { success, error: showError, info } = useToast();
  const { isBoyMode } = useTheme();
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("task_occurrences")
      .select("*, study_tasks(*)")
      .eq("owner_id", userId)
      .eq("scheduled_date", selectedDate)
      .order("created_at");

    if (error) showError("Failed to load tasks");
    else setOccurrences((data as OccurrenceWithTask[]) || []);
    setLoading(false);
  }, [selectedDate, userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const navigate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const isToday = selectedDate === today;
  const isPast = selectedDate < today;

  const completed = occurrences.filter((o) => o.status === "completed").length;
  const total = occurrences.length;
  const progress = getProgressPercentage(completed, total);

  const filtered = filterStatus === "all"
    ? occurrences
    : occurrences.filter((o) => o.status === filterStatus);

  async function handleComplete(occ: OccurrenceWithTask) {
    const actualMins = timerOcc === occ.id
      ? Math.round(timerSeconds / 60)
      : undefined;

    const { error } = await supabase
      .from("task_occurrences")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        actual_duration_minutes: actualMins || occ.study_tasks.duration_minutes,
      })
      .eq("id", occ.id)
      .eq("owner_id", userId);

    if (error) showError("Failed to mark complete");
    else {
      success("Task completed! 🎉");
      if (timerOcc === occ.id) {
        setTimerOcc(null);
        setTimerRunning(false);
        setTimerSeconds(0);
      }
      fetchTasks();
      updateCheckin();
    }
  }

  async function handleSkip(occ: OccurrenceWithTask) {
    const { error } = await supabase
      .from("task_occurrences")
      .update({ status: "skipped" })
      .eq("id", occ.id)
      .eq("owner_id", userId);

    if (error) showError("Failed to skip");
    else { info("Task skipped"); fetchTasks(); }
  }

  async function handleDelete(occ: OccurrenceWithTask) {
    if (!confirm(`Delete "${occ.study_tasks?.title}"?`)) return;

    const { error } = await supabase
      .from("task_occurrences")
      .delete()
      .eq("id", occ.id)
      .eq("owner_id", userId);

    if (error) showError("Failed to delete");
    else { success("Task deleted"); fetchTasks(); }
  }

  async function handleSaveTask() {
    if (!form.title.trim()) { showError("Title is required"); return; }

    setSaving(true);

    // Create or update study_task
    let taskId: string;

    if (editingTask) {
      taskId = editingTask.task_id;
      await supabase
        .from("study_tasks")
        .update({
          title: form.title,
          description: form.description || null,
          subject: form.subject,
          learning_objective: form.learning_objective || null,
          duration_minutes: form.duration_minutes,
          priority: form.priority as Priority,
          resource_url: form.resource_url || null,
          task_type: form.task_type as StudyTask["task_type"],
          module_id: form.module_id || null,
        })
        .eq("id", taskId);
    } else {
      const { data: newTask, error } = await supabase
        .from("study_tasks")
        .insert({
          owner_id: userId,
          title: form.title,
          description: form.description || null,
          subject: form.subject || (isBoyMode ? "Python" : "Drawing"),
          learning_objective: form.learning_objective || null,
          duration_minutes: form.duration_minutes,
          priority: form.priority as Priority,
          resource_url: form.resource_url || null,
          task_type: form.task_type as StudyTask["task_type"],
          module_id: form.module_id || null,
        })
        .select()
        .single();

      if (error) { showError("Failed to create task"); setSaving(false); return; }
      taskId = newTask.id;

      // Create occurrence
      await supabase.from("task_occurrences").insert({
        task_id: taskId,
        owner_id: userId,
        scheduled_date: selectedDate,
        original_due_date: selectedDate,
        status: "pending",
        carry_forward_count: 0,
      });
    }

    success(editingTask ? "Task updated!" : "Task added!");
    setShowAddModal(false);
    setEditingTask(null);
    setForm(defaultForm);
    fetchTasks();
    setSaving(false);
  }

  async function updateCheckin() {
    // Upsert daily check-in with latest stats
    const allOccs = await supabase
      .from("task_occurrences")
      .select("status, actual_duration_minutes, study_tasks(duration_minutes)")
      .eq("owner_id", userId)
      .eq("scheduled_date", today);

    if (!allOccs.data) return;

    const tasksCompleted = (allOccs.data as any[]).filter((o) => o.status === "completed").length;
    const totalMinutes = (allOccs.data as any[])
      .filter((o) => o.status === "completed")
      .reduce((sum: number, o: any) =>
        sum + (o.actual_duration_minutes || o.study_tasks?.duration_minutes || 0), 0);

    await supabase.from("daily_checkins").upsert(
      {
        user_id: userId,
        study_date: today,
        tasks_completed: tasksCompleted,
        tasks_total: allOccs.data.length,
        total_minutes_studied: totalMinutes,
      },
      { onConflict: "user_id,study_date" }
    );
  }

  async function runRescheduling() {
    setRescheduling(true);
    try {
      const res = await fetch("/api/tasks/reschedule", { method: "POST" });
      if (res.ok) {
        success("Rescheduling complete");
        fetchTasks();
      } else {
        showError("Rescheduling failed");
      }
    } catch {
      showError("Network error");
    }
    setRescheduling(false);
  }

  function openEdit(occ: OccurrenceWithTask) {
    setEditingTask(occ);
    setForm({
      title: occ.study_tasks.title,
      description: occ.study_tasks.description || "",
      subject: occ.study_tasks.subject,
      learning_objective: occ.study_tasks.learning_objective || "",
      duration_minutes: occ.study_tasks.duration_minutes,
      priority: occ.study_tasks.priority,
      resource_url: occ.study_tasks.resource_url || "",
      task_type: occ.study_tasks.task_type,
      module_id: occ.study_tasks.module_id || "",
    });
    setShowAddModal(true);
  }

  function startTimer(occId: string) {
    setTimerOcc(occId);
    setTimerSeconds(0);
    setTimerRunning(true);
  }

  const timerDisplay = `${Math.floor(timerSeconds / 3600).toString().padStart(2, "0")}:${Math.floor((timerSeconds % 3600) / 60).toString().padStart(2, "0")}:${(timerSeconds % 60).toString().padStart(2, "0")}`;

  const moduleOptions = [
    { value: "", label: "No module" },
    ...modules.map((m) => ({ value: m.id, label: m.title })),
  ];

  return (
    <div className="space-y-5">
      {/* Date Navigator */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl border hover:opacity-70 transition-opacity"
          style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            {new Date(selectedDate).toLocaleDateString("en-IN", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </p>
          {isToday && (
            <span className="text-xs" style={{ color: "var(--primary)" }}>Today</span>
          )}
          {isPast && !isToday && (
            <span className="text-xs text-amber-400">Past date</span>
          )}
        </div>

        <button onClick={() => navigate(1)} className="p-2 rounded-xl border hover:opacity-70 transition-opacity"
          style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          <ChevronRight className="w-5 h-5" />
        </button>

        <button onClick={() => setSelectedDate(today)}
          className="px-3 py-2 rounded-xl border text-xs font-medium hover:opacity-70 transition-opacity"
          style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          Today
        </button>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {completed}/{total} tasks completed
            </span>
            <span className="font-bold text-lg" style={{ color: "var(--primary)" }}>
              {progress}%
            </span>
          </div>
          <ProgressBar value={progress} height="md" animated />

          {timerOcc && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
            >
              <Timer className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                {timerDisplay}
              </span>
              <button onClick={() => setTimerRunning(!timerRunning)}
                className="p-1.5 rounded-lg hover:opacity-70"
                style={{ color: "var(--primary)" }}>
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={() => { setTimerOcc(null); setTimerRunning(false); setTimerSeconds(0); }}
                className="p-1.5 rounded-lg hover:opacity-70 text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { setEditingTask(null); setForm(defaultForm); setShowAddModal(true); }}>
          <Plus className="w-4 h-4" /> Add Task
        </Button>
        <Button variant="secondary" onClick={runRescheduling} loading={rescheduling} size="sm">
          <RefreshCw className="w-4 h-4" /> Reschedule Missed
        </Button>

        {/* Status filter */}
        <div className="flex gap-1 ml-auto flex-wrap">
          {STATUS_FILTER_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: filterStatus === s.value ? "var(--primary)" : "var(--bg-secondary)",
                color: filterStatus === s.value ? "white" : "var(--text-muted)",
                border: "1px solid",
                borderColor: filterStatus === s.value ? "var(--primary)" : "var(--border-color)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
        >
          <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
            No tasks for this day
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Add a task using the button above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((occ) => (
            <TaskCard
              key={occ.id}
              occ={occ}
              onComplete={() => handleComplete(occ)}
              onSkip={() => handleSkip(occ)}
              onDelete={() => handleDelete(occ)}
              onEdit={() => openEdit(occ)}
              onStartTimer={() => startTimer(occ.id)}
              isTimerActive={timerOcc === occ.id}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingTask(null); setForm(defaultForm); }}
        title={editingTask ? "Edit Task" : "Add Study Task"}
        size="lg"
      >
        <div className="p-5 space-y-4">
          <Input
            label="Task Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Learn Python functions"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Python"
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 45 })}
              min={5}
              max={480}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            />
            <Select
              label="Task Type"
              options={TASK_TYPE_OPTIONS}
              value={form.task_type}
              onChange={(e) => setForm({ ...form, task_type: e.target.value })}
            />
          </div>
          <Select
            label="Roadmap Module (optional)"
            options={moduleOptions}
            value={form.module_id}
            onChange={(e) => setForm({ ...form, module_id: e.target.value })}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What will you learn?"
            rows={2}
          />
          <Input
            label="Learning Objective"
            value={form.learning_objective}
            onChange={(e) => setForm({ ...form, learning_objective: e.target.value })}
            placeholder="By the end, I will be able to..."
          />
          <Input
            label="Resource URL"
            type="url"
            value={form.resource_url}
            onChange={(e) => setForm({ ...form, resource_url: e.target.value })}
            placeholder="https://..."
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveTask} loading={saving} className="flex-1">
              {editingTask ? "Update Task" : "Add Task"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setShowAddModal(false); setEditingTask(null); setForm(defaultForm); }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TaskCard({
  occ,
  onComplete,
  onSkip,
  onDelete,
  onEdit,
  onStartTimer,
  isTimerActive,
}: {
  occ: OccurrenceWithTask;
  onComplete: () => void;
  onSkip: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onStartTimer: () => void;
  isTimerActive: boolean;
}) {
  const task = occ.study_tasks;
  const isCarried = occ.carry_forward_count > 0;
  const isDone = occ.status === "completed";
  const isSkipped = occ.status === "skipped";

  return (
    <div
      className="rounded-xl border p-4 transition-all duration-200"
      style={{
        background: isDone
          ? "rgba(16,185,129,0.04)"
          : isCarried
          ? "rgba(239,68,68,0.04)"
          : "var(--bg-card)",
        borderColor: isDone
          ? "rgba(16,185,129,0.2)"
          : isCarried
          ? "rgba(239,68,68,0.2)"
          : isTimerActive
          ? "var(--primary)"
          : "var(--border-color)",
        opacity: isSkipped ? 0.6 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={isDone ? undefined : onComplete}
          className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
          disabled={isDone}
        >
          <Check
            className="w-5 h-5"
            style={{ color: isDone ? "var(--success)" : "var(--border-color)" }}
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p
              className="font-semibold text-sm"
              style={{
                color: "var(--text-primary)",
                textDecoration: isDone ? "line-through" : "none",
                opacity: isDone ? 0.6 : 1,
              }}
            >
              {task?.title}
            </p>
            {isCarried && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertTriangle className="w-3 h-3" />
                Overdue (×{occ.carry_forward_count})
              </span>
            )}
            <TaskStatusBadge status={occ.status} />
            <PriorityBadge priority={task?.priority as any} />
          </div>

          {task?.description && (
            <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>{task?.subject}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(task?.duration_minutes || 30)}
            </span>
            {occ.actual_duration_minutes && (
              <>
                <span>•</span>
                <span className="text-green-400">
                  Actual: {formatDuration(occ.actual_duration_minutes)}
                </span>
              </>
            )}
            {task?.resource_url && (
              <a
                href={task.resource_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                <ExternalLink className="w-3 h-3" /> Resource
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isDone && !isSkipped && (
          <div className="flex gap-1 flex-shrink-0">
            {!isTimerActive && (
              <button
                onClick={onStartTimer}
                className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)" }}
                title="Start timer"
              >
                <Timer className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-muted)" }}
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onSkip}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-muted)" }}
              title="Skip"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-red-400"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {occ.notes && (
        <div
          className="mt-3 p-2.5 rounded-lg text-xs"
          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
        >
          📝 {occ.notes}
        </div>
      )}
    </div>
  );
}

