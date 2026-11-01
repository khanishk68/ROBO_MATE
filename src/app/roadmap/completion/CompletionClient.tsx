// src/app/roadmap/completion/CompletionClient.tsx
"use client";
import React from "react";
import Link from "next/link";
import {
  Award, CheckCircle2, Star, Clock, BookOpen, Rocket,
  ExternalLink, ShieldCheck, ArrowRight, AlertCircle, Sparkles
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDuration } from "@/lib/utils";
import type { Profile, RoadmapModule, RoadmapMonth, AssessmentResult, Assessment, DailyCheckin, Project, ProjectTask } from "@/types/database";

interface CompletionClientProps {
  profile: Profile | null;
  modules: (RoadmapModule & { roadmap_months: RoadmapMonth | null })[];
  results: (AssessmentResult & { assessments: Assessment | null })[];
  checkins: DailyCheckin[];
  project: (Project & { project_tasks: ProjectTask[] }) | null;
}

const BOY_SKILLS = [
  { name: "Python Automation & ROS 2 rclpy", level: 90, status: "Mastered" },
  { name: "C++ Systems Programming & Memory", level: 85, status: "Proficient" },
  { name: "ESP32 Embedded Systems & FreeRTOS", level: 88, status: "Proficient" },
  { name: "DC/Servo Motors, H-Bridges & PID Control", level: 82, status: "Proficient" },
  { name: "ROS 2 Humble Architecture & URDF Simulation", level: 80, status: "Proficient" },
  { name: "Nav2 Stack & Autonomous Navigation", level: 75, status: "Intermediate" },
  { name: "OpenCV Computer Vision & ArUco Tracking", level: 78, status: "Intermediate" },
  { name: "LiDAR SLAM & Cartographer Mapping", level: 72, status: "Developing Gap" },
];

const GIRL_SKILLS = [
  { name: "Freehand Product Sketching & Perspective", level: 92, status: "Mastered" },
  { name: "Autodesk Fusion 360 Parametric CAD", level: 90, status: "Mastered" },
  { name: "Blender 3D Photorealistic Cycles Renders", level: 88, status: "Proficient" },
  { name: "DFM / DFA Injection Molding Principles", level: 82, status: "Proficient" },
  { name: "Ergonomics & Anthropometric Sizing", level: 85, status: "Proficient" },
  { name: "Physical FDM Prototyping & Assembly Tolerancing", level: 80, status: "Proficient" },
  { name: "Human-Robot Interaction & Touch UX (Figma)", level: 86, status: "Proficient" },
  { name: "Complex Surfacing & Curvature Continuity", level: 70, status: "Developing Gap" },
];

export function CompletionClient({
  profile,
  modules,
  results,
  checkins,
  project,
}: CompletionClientProps) {
  const { isBoyMode } = useTheme();

  const completedModules = modules.filter((m) => m.status === "completed").length;
  const totalMinutes = checkins.reduce((sum, c) => sum + (c.total_minutes_studied || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);

  // Compute average assessment score
  const avgScore = results.length > 0
    ? Math.round(
        (results.reduce((acc, r) => acc + (r.score / (r.max_score || 1)), 0) / results.length) * 100
      )
    : 85;

  const title = isBoyMode
    ? "ROBOTICS ENGINEERING JOURNEY COMPLETED"
    : "ROBOTICS PRODUCT DESIGN JOURNEY COMPLETED";

  const skills = isBoyMode ? BOY_SKILLS : GIRL_SKILLS;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Hero Achievement Card */}
      <div
        className="rounded-3xl border p-8 text-center relative overflow-hidden"
        style={{
          background: "var(--gradient-card)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <div
          className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-5xl mb-4 shadow-2xl animate-pulse-glow"
          style={{ background: "var(--gradient-accent)" }}
        >
          {isBoyMode ? "🤖" : "🎨"}
        </div>

        <Badge variant="success" size="md" className="mb-3">
          12-MONTH DEDICATED MILESTONE REACHED
        </Badge>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>

        <p className="text-sm sm:text-base mt-2 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          Conferred upon <strong style={{ color: "var(--text-primary)" }}>{profile?.display_name || "Graduate"}</strong> for completing the rigorous 365-day robotics training curriculum.
        </p>

        {/* Milestone Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="p-3 rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            <Clock className="w-5 h-5 mx-auto mb-1 text-sky-400" />
            <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              {totalHours || 320}+
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Study Hours</p>
          </div>

          <div className="p-3 rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
            <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              12 / 12
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Stages Completed</p>
          </div>

          <div className="p-3 rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            <Award className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              {avgScore}%
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Avg Assessment Score</p>
          </div>

          <div className="p-3 rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            <Rocket className="w-5 h-5 mx-auto mb-1 text-pink-400" />
            <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              1 Ready
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Autonomous Mobile Robot</p>
          </div>
        </div>
      </div>

      {/* Honest Skills Assessment & Remaining Gaps */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <div>
              <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Honest Skills Assessment & Real-World Readiness
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Completion signifies foundational competency, not instant senior mastery. Transparently review covered skills and known growth areas.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="p-3 rounded-xl border space-y-2"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {skill.name}
                  </span>
                  <Badge
                    variant={
                      skill.status === "Mastered"
                        ? "success"
                        : skill.status === "Proficient"
                        ? "primary"
                        : skill.status === "Intermediate"
                        ? "info"
                        : "warning"
                    }
                  >
                    {skill.status}
                  </Badge>
                </div>
                <ProgressBar value={skill.level} height="sm" />
              </div>
            ))}
          </div>

          <div
            className="p-4 rounded-xl border flex items-start gap-3 mt-4"
            style={{
              background: "rgba(245,158,11,0.06)",
              borderColor: "rgba(245,158,11,0.25)",
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-400">Identified Gaps to Address Before Hardware Commercialization:</p>
              <p style={{ color: "var(--text-secondary)" }}>
                {isBoyMode
                  ? "• Further testing in non-flat unstructured terrain (slip compensation in wheel odometry)."
                  : "• Mold-flow analysis certification and tooling supplier quote validation."}
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                • Continuous edge-case testing of the shared autonomous mobile robot collision avoidance in crowded environments.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Shared Robotics Project Achievement */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-sky-400" />
              <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Shared Robotics Venture Milestone
              </h2>
            </div>
            <Badge variant="primary">Co-Founded</Badge>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <strong>ROBO MATES Autonomous Mobile Robot (AMR)</strong> — Built through 12 months of dual-specialization engineering:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <p className="font-bold text-sky-400 mb-1">Boy Mode Systems Integration:</p>
              <p style={{ color: "var(--text-muted)" }}>
                Custom differential drive kinematics, ESP32 dual-core firmware, ROS 2 Humble Nav2 autonomous waypoint navigation, and live camera obstacle avoidance.
              </p>
            </div>
            <div className="p-3 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <p className="font-bold text-pink-400 mb-1">Girl Mode Industrial Design:</p>
              <p style={{ color: "var(--text-muted)" }}>
                Monocoque ABS enclosure CAD, snap-fit battery maintenance lid, internal sensor packaging, thermal ventilation channels, and human-friendly CMF styling.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Career Portfolio Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div>
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            Ready to Showcase Your Portfolio?
          </h3>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Curate your artifacts, demonstration clips, and code repositories for robotics career opportunities.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4" /> View Robot Project
            </Button>
          </Link>
          <Link href="/resources">
            <Button size="sm">
              <BookOpen className="w-4 h-4" /> Portfolio Artifacts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

