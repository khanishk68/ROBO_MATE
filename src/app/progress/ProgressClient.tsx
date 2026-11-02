// src/app/progress/ProgressClient.tsx
"use client";
import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Flame, Clock, Target, Award, Calendar, TrendingUp,
  BookOpen, Sparkles, CheckCircle2, ChevronRight
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDuration } from "@/lib/utils";
import type { Profile, DailyCheckin, RoadmapModule, RoadmapMonth, AssessmentResult, Assessment } from "@/types/database";

interface ProgressClientProps {
  userId: string;
  profile: Profile | null;
  checkins: DailyCheckin[];
  modules: (RoadmapModule & { roadmap_months: RoadmapMonth | null })[];
  assessmentResults: (AssessmentResult & { assessments: Assessment | null })[];
}

export function ProgressClient({
  userId,
  profile,
  checkins,
  modules,
  assessmentResults,
}: ProgressClientProps) {
  const { isBoyMode, isDark } = useTheme();

  // Metrics
  const totalMinutes = checkins.reduce((acc, c) => acc + (c.total_minutes_studied || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const completedModules = modules.filter((m) => m.status === "completed").length;
  const totalModules = Math.max(modules.length, 12);
  const modulePct = Math.round((completedModules / totalModules) * 100);

  // Streak
  const streak = checkins.filter((c) => c.tasks_completed > 0).length;

  // Average quiz score
  const avgScore = assessmentResults.length > 0
    ? Math.round(
        (assessmentResults.reduce((acc, r) => acc + (r.score / (r.max_score || 1)), 0) /
          assessmentResults.length) * 100
      )
    : 85;

  // Weekly hours chart (last 14 days)
  const last14Days: { date: string; label: string; hours: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const checkin = checkins.find((c) => c.study_date === dateStr);
    last14Days.push({
      date: dateStr,
      label: d.toLocaleDateString("en-IN", { month: "numeric", day: "numeric" }),
      hours: Math.round(((checkin?.total_minutes_studied || 0) / 60) * 10) / 10,
    });
  }

  // Distribution chart
  const boyDistribution = [
    { name: "Hardware & Electronics (35%)", value: 35, color: "#38BDF8" },
    { name: "Programming Exercises (25%)", value: 25, color: "#2563EB" },
    { name: "Theory & Concepts (25%)", value: 25, color: "#818CF8" },
    { name: "Revision & Docs (15%)", value: 15, color: "#10B981" },
  ];

  const girlDistribution = [
    { name: "CAD & 3D Modeling (35%)", value: 35, color: "#D96B91" },
    { name: "Drawing & Sketching (25%)", value: 25, color: "#F5B8CC" },
    { name: "Prototyping & Portfolio (20%)", value: 20, color: "#C05578" },
    { name: "Design Theory & Ergonomics (20%)", value: 20, color: "#E8829E" },
  ];

  const distributionData = isBoyMode ? boyDistribution : girlDistribution;
  const barColor = isBoyMode ? "#2563EB" : "#D96B91";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#94A3B8" : "#80576B";

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-6xl mx-auto pb-16 w-full min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          Progress &amp; Analytics Centre
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Measurable growth metrics for {profile?.display_name || (isBoyMode ? "Robotics Engineer" : "Product Designer")}.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full min-w-0">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border min-w-0" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 mb-1.5" />
          <p className="text-[10px] sm:text-xs truncate" style={{ color: "var(--text-muted)" }}>Total Study Time</p>
          <p className="text-lg sm:text-2xl font-black mt-0.5 truncate" style={{ color: "var(--text-primary)" }}>
            {totalHours} hrs
          </p>
          <p className="text-[10px] sm:text-[11px] mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            ~4.5 hrs/day target
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border min-w-0" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mb-1.5" />
          <p className="text-[10px] sm:text-xs truncate" style={{ color: "var(--text-muted)" }}>Study Streak</p>
          <p className="text-lg sm:text-2xl font-black mt-0.5 text-amber-400 truncate">
            {streak} {streak === 1 ? "Day" : "Days"} 🔥
          </p>
          <p className="text-[10px] sm:text-[11px] mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            Consistency record
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border min-w-0" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mb-1.5" />
          <p className="text-[10px] sm:text-xs truncate" style={{ color: "var(--text-muted)" }}>Roadmap Modules</p>
          <p className="text-lg sm:text-2xl font-black mt-0.5 text-emerald-400 truncate">
            {completedModules}/{totalModules}
          </p>
          <p className="text-[10px] sm:text-[11px] mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            {modulePct}% completed
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border min-w-0" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-1.5" />
          <p className="text-[10px] sm:text-xs truncate" style={{ color: "var(--text-muted)" }}>Assessment Average</p>
          <p className="text-lg sm:text-2xl font-black mt-0.5 truncate" style={{ color: "var(--primary)" }}>
            {avgScore}%
          </p>
          <p className="text-[10px] sm:text-[11px] mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            Across all tests
          </p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        {/* 14-day study hours bar chart */}
        <Card className="lg:col-span-2 w-full min-w-0 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                  Daily Study Hours (Last 14 Days)
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Target: 4.5 hours per day
                </p>
              </div>
              <Badge variant="primary">Daily Trend</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last14Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val} hrs`, "Studied"]}
                />
                <Bar dataKey="hours" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Study Subject Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Recommended Study Split
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Balanced 4–5 hr daily curriculum
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontSize: "11px",
                    }}
                    formatter={(val: any) => [`${val}%`, "Target"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {distributionData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="truncate">{d.name}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Completed Modules Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Completed Roadmap Modules & Assessments
            </h3>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Verified mastery
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {modules.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
              Activate your roadmap to record module completions.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {modules.slice(0, 6).map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border flex items-center justify-between"
                  style={{
                    background: m.status === "completed" ? "rgba(16,185,129,0.05)" : "var(--bg-secondary)",
                    borderColor: m.status === "completed" ? "rgba(16,185,129,0.25)" : "var(--border-color)",
                  }}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {m.title}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      Week {m.week_number} • {m.status}
                    </p>
                  </div>
                  <CheckCircle2
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: m.status === "completed" ? "var(--success)" : "var(--border-color)" }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
