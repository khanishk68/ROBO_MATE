// src/app/dashboard/WeeklyChart.tsx
"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import type { DailyCheckin } from "@/types/database";

interface WeeklyChartProps {
  checkins: DailyCheckin[];
}

export function WeeklyChart({ checkins }: WeeklyChartProps) {
  const { isBoyMode, isDark } = useTheme();

  // Build last 7 days
  const days: { day: string; minutes: number; date: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const checkin = checkins.find((c) => c.study_date === dateStr);
    days.push({
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      minutes: checkin?.total_minutes_studied || 0,
      date: dateStr,
    });
  }

  const data = days.map((d) => ({
    day: d.day,
    Hours: Math.round((d.minutes / 60) * 10) / 10,
  }));

  const barColor = isBoyMode ? "#2563EB" : "#D96B91";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const textColor = isDark ? "#94A3B8" : "#80576B";

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: textColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: textColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}h`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "12px",
          }}
          formatter={(value: any) => [`${value}h`, "Study Time"]}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="Hours" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

