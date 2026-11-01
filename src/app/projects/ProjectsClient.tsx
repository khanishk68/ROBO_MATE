// src/app/projects/ProjectsClient.tsx
"use client";
import React, { useState } from "react";
import {
  Rocket, CheckCircle2, Clock, Plus, ExternalLink, Paperclip,
  FileText, Users, Bot, GitBranch, Shield, Check, Trash2
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/client";
import type { Project, ProjectTask, ProjectAttachment, ProjectNote, Profile, TaskStatus, Priority } from "@/types/database";

interface ProjectsClientProps {
  userId: string;
  project: (Project & {
    project_tasks: ProjectTask[];
    project_attachments: ProjectAttachment[];
    project_notes: ProjectNote[];
  }) | null;
  profiles: { id: string; display_name: string; persona: "boy" | "girl" }[];
}

const DEFAULT_AMR_TASKS: Omit<ProjectTask, "id" | "created_at" | "updated_at">[] = [
  // Boy responsibilities
  { project_id: "default", owner_id: "boy", title: "ESP32 dual-core FreeRTOS firmware setup", description: "Telemetry on Core 0, motor PID loop on Core 1", status: "completed", priority: "critical", due_date: "2026-11-20", completed_at: new Date().toISOString() },
  { project_id: "default", owner_id: "boy", title: "TB6612FNG motor driver & quadrature encoder wiring", description: "Precise RPM feedback via optical quadrature encoders", status: "completed", priority: "high", due_date: "2026-12-05", completed_at: new Date().toISOString() },
  { project_id: "default", owner_id: "boy", title: "ROS 2 Humble Nav2 differential kinematics node", description: "Publish /odom and subscribe to /cmd_vel", status: "in_progress", priority: "critical", due_date: "2027-01-15", completed_at: null },
  { project_id: "default", owner_id: "boy", title: "2D LiDAR Cartographer SLAM integration", description: "Indoor occupancy grid map generation", status: "pending", priority: "high", due_date: "2027-02-28", completed_at: null },
  { project_id: "default", owner_id: "boy", title: "OpenCV camera obstacle detection node", description: "Real-time edge detection and ArUco landing beacon tracking", status: "pending", priority: "medium", due_date: "2027-03-30", completed_at: null },

  // Girl responsibilities
  { project_id: "default", owner_id: "girl", title: "Robot form factor sketching & 4 concept directions", description: "Friendly consumer styling with organic rounded corners", status: "completed", priority: "critical", due_date: "2026-11-20", completed_at: new Date().toISOString() },
  { project_id: "default", owner_id: "girl", title: "Parametric chassis mounting plate in Fusion 360", description: "Mounting holes for ESP32, battery cage, and motors", status: "completed", priority: "high", due_date: "2026-12-10", completed_at: new Date().toISOString() },
  { project_id: "default", owner_id: "girl", title: "ABS outer enclosure with quick-release battery hatch", description: "Snap-fit lid, intake vents, and internal PCB standoffs", status: "in_progress", priority: "critical", due_date: "2027-01-20", completed_at: null },
  { project_id: "default", owner_id: "girl", title: "Ergonomics and anthropometric handle placement", description: "Lifting balance test and human-friendly touchpoints", status: "pending", priority: "high", due_date: "2027-02-15", completed_at: null },
  { project_id: "default", owner_id: "girl", title: "Photorealistic Blender Cycles CMF renders", description: "Studio lighting, matte/gloss ABS plastic texture", status: "pending", priority: "medium", due_date: "2027-03-25", completed_at: null },
];

export function ProjectsClient({ userId, project, profiles }: ProjectsClientProps) {
  const { success, error: showError } = useToast();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"tasks" | "notes" | "attachments">("tasks");
  const [filterOwner, setFilterOwner] = useState<"all" | "boy" | "girl">("all");

  // Local state for tasks
  const [tasks, setTasks] = useState<ProjectTask[]>(
    project?.project_tasks && project.project_tasks.length > 0
      ? project.project_tasks
      : DEFAULT_AMR_TASKS.map((t, i) => ({
          ...t,
          id: `task-${i}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
  );

  // New task modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskOwner, setNewTaskOwner] = useState<string>("boy");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [newTaskDue, setNewTaskDue] = useState("");

  const boyProfile = profiles.find((p) => p.persona === "boy");
  const girlProfile = profiles.find((p) => p.persona === "girl");

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const projectPct = Math.round((completedCount / (tasks.length || 1)) * 100);

  const filteredTasks = filterOwner === "all"
    ? tasks
    : tasks.filter((t) => {
        if (filterOwner === "boy") {
          return t.owner_id === "boy" || t.owner_id === boyProfile?.id;
        } else {
          return t.owner_id === "girl" || t.owner_id === girlProfile?.id;
        }
      });

  async function handleToggleTask(taskId: string, currentStatus: TaskStatus) {
    const nextStatus: TaskStatus = currentStatus === "completed" ? "in_progress" : "completed";
    const completedAt = nextStatus === "completed" ? new Date().toISOString() : null;

    if (project?.id) {
      await supabase
        .from("project_tasks")
        .update({ status: nextStatus, completed_at: completedAt, updated_at: new Date().toISOString() })
        .eq("id", taskId);
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus, completed_at: completedAt } : t
      )
    );
    success(nextStatus === "completed" ? "Task completed! 🚀" : "Task updated");
  }

  function handleCreateTask() {
    if (!newTaskTitle.trim()) {
      showError("Please enter a task title");
      return;
    }

    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      project_id: project?.id || "default",
      owner_id: newTaskOwner,
      title: newTaskTitle,
      description: newTaskDesc || null,
      status: "pending",
      priority: newTaskPriority,
      due_date: newTaskDue || null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setShowAddModal(false);
    setNewTaskTitle("");
    setNewTaskDesc("");
    success("New robotics project task added!");
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Project Banner */}
      <div
        className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: "var(--gradient-card)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="md">
                SHARED ROBOTICS VENTURE
              </Badge>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Co-Engineered by Boy & Girl Founders
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              ROBO MATES AUTONOMOUS MOBILE ROBOT (AMR)
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              Goal: Build a market-ready autonomous indoor transport robot fusing precision differential drive, SLAM navigation, ROS 2, and sleek ergonomic ABS industrial packaging.
            </p>
          </div>

          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Add Project Task
          </Button>
        </div>

        {/* Milestone Progress Bar */}
        <div className="mt-6 pt-6 border-t space-y-2" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
              AMR Development Progress: {completedCount} / {tasks.length} tasks completed
            </span>
            <span className="font-bold text-base" style={{ color: "var(--primary)" }}>
              {projectPct}%
            </span>
          </div>
          <ProgressBar value={projectPct} height="md" animated />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("tasks")}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: activeTab === "tasks" ? "var(--primary)" : "transparent",
              color: activeTab === "tasks" ? "white" : "var(--text-secondary)",
            }}
          >
            Engineering Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: activeTab === "notes" ? "var(--primary)" : "transparent",
              color: activeTab === "notes" ? "white" : "var(--text-secondary)",
            }}
          >
            Meeting Minutes & Specs
          </button>
          <button
            onClick={() => setActiveTab("attachments")}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: activeTab === "attachments" ? "var(--primary)" : "transparent",
              color: activeTab === "attachments" ? "white" : "var(--text-secondary)",
            }}
          >
            CAD & Code Repositories
          </button>
        </div>

        {activeTab === "tasks" && (
          <div className="flex gap-1">
            <button
              onClick={() => setFilterOwner("all")}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border"
              style={{
                background: filterOwner === "all" ? "var(--bg-secondary)" : "transparent",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilterOwner("boy")}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border"
              style={{
                background: filterOwner === "boy" ? "var(--bg-secondary)" : "transparent",
                borderColor: "var(--border-color)",
                color: "#38BDF8",
              }}
            >
              🤖 Boy Tasks
            </button>
            <button
              onClick={() => setFilterOwner("girl")}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border"
              style={{
                background: filterOwner === "girl" ? "var(--bg-secondary)" : "transparent",
                borderColor: "var(--border-color)",
                color: "#F5B8CC",
              }}
            >
              🎨 Girl Tasks
            </button>
          </div>
        )}
      </div>

      {/* Tab: Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const isDone = t.status === "completed";
            const isBoyOwner = t.owner_id === "boy" || t.owner_id === boyProfile?.id;

            return (
              <div
                key={t.id}
                className="p-4 rounded-xl border flex items-start gap-4 transition-all"
                style={{
                  background: isDone ? "rgba(16,185,129,0.04)" : "var(--bg-card)",
                  borderColor: isDone ? "rgba(16,185,129,0.25)" : "var(--border-color)",
                }}
              >
                <button
                  onClick={() => handleToggleTask(t.id, t.status)}
                  className="mt-1 p-1 rounded-md border transition-all hover:scale-110 flex-shrink-0"
                  style={{
                    background: isDone ? "var(--success)" : "transparent",
                    borderColor: isDone ? "var(--success)" : "var(--border-color)",
                    color: isDone ? "white" : "var(--text-muted)",
                  }}
                >
                  <Check className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="font-bold text-sm"
                      style={{
                        color: "var(--text-primary)",
                        textDecoration: isDone ? "line-through" : "none",
                        opacity: isDone ? 0.6 : 1,
                      }}
                    >
                      {t.title}
                    </p>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: isBoyOwner ? "rgba(56,189,248,0.15)" : "rgba(245,184,204,0.2)",
                        color: isBoyOwner ? "#38BDF8" : "#D96B91",
                      }}
                    >
                      {isBoyOwner ? "🤖 Systems / Boy" : "🎨 Design / Girl"}
                    </span>
                    <Badge variant={t.priority === "critical" ? "error" : t.priority === "high" ? "warning" : "muted"}>
                      {t.priority}
                    </Badge>
                  </div>

                  {t.description && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {t.description}
                    </p>
                  )}

                  {t.due_date && (
                    <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                      <Clock className="w-3 h-3" /> Target: {t.due_date}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Co-Founder Engineering Minutes: AMR System Interface Spec
              </h3>
            </CardHeader>
            <CardBody className="space-y-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <p><strong>1. Motor Standoff & Thermal Clearances:</strong> Casing must reserve a 15mm clearance above the ESP32 heatsink and dual TB6612FNG drivers for convection airflow.</p>
              <p><strong>2. Sensor Windows:</strong> Ultrasonic sensors HC-SR04 require 16mm through-holes on the front bumper. LiDAR requires unobstructed 360° horizontal line-of-sight at height 120mm.</p>
              <p><strong>3. Emergency Kill-Switch:</strong> Girl Mode CAD model features a recessed top-mount emergency latch wired directly in series with the 12V LiPo battery power bus.</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab: Attachments */}
      {activeTab === "attachments" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                  Firmware & ROS 2 Repo
                </h3>
              </div>
            </CardHeader>
            <CardBody className="text-xs space-y-2">
              <p style={{ color: "var(--text-muted)" }}>GitHub repo containing ESP32 FreeRTOS control loops, Nav2 configs, and URDF description files.</p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:underline font-semibold"
              >
                github.com/robo-mates/amr-firmware <ExternalLink className="w-3 h-3" />
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-pink-400" />
                <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                  Autodesk Fusion 360 CAD Model
                </h3>
              </div>
            </CardHeader>
            <CardBody className="text-xs space-y-2">
              <p style={{ color: "var(--text-muted)" }}>Full parametric STEP/F3D assembly with DFM-optimized ABS enclosure, chassis ribs, and exploded views.</p>
              <a
                href="https://autodesk.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-pink-400 hover:underline font-semibold"
              >
                myhub.autodesk360.com/robo-mates-amr <ExternalLink className="w-3 h-3" />
              </a>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Modal: Add Task */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add AMR Project Task"
        size="md"
      >
        <div className="p-5 space-y-4">
          <Input
            label="Task Title *"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g. Test Nav2 costmap recovery behavior"
          />

          <Textarea
            label="Description"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            placeholder="Technical details and requirements..."
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned Owner"
              value={newTaskOwner}
              onChange={(e) => setNewTaskOwner(e.target.value)}
              options={[
                { value: "boy", label: "🤖 Boy Mode (Systems & Code)" },
                { value: "girl", label: "🎨 Girl Mode (Design & CAD)" },
              ]}
            />

            <Select
              label="Priority"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
            />
          </div>

          <Input
            label="Due Date (optional)"
            type="date"
            value={newTaskDue}
            onChange={(e) => setNewTaskDue(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreateTask} className="flex-1">
              Add Task
            </Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

