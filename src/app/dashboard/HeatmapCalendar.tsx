// src/app/dashboard/HeatmapCalendar.tsx
"use client";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { DailyCheckin } from "@/types/database";

interface HeatmapCalendarProps {
  checkins: DailyCheckin[];
}

export function HeatmapCalendar({ checkins }: HeatmapCalendarProps) {
  const { isBoyMode } = useTheme();

  // Build a map of date -> minutes
  const minuteMap = new Map<string, number>();
  for (const c of checkins) {
    minuteMap.set(c.study_date, c.total_minutes_studied || 0);
  }

  // Build last 28 days
  const days: { date: string; minutes: number; label: string }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      minutes: minuteMap.get(dateStr) || 0,
      label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    });
  }

  const primaryColor = isBoyMode ? "#2563EB" : "#D96B91";

  function getOpacity(minutes: number): number {
    if (minutes === 0) return 0;
    if (minutes < 30) return 0.15;
    if (minutes < 60) return 0.3;
    if (minutes < 120) return 0.5;
    if (minutes < 180) return 0.7;
    return 1;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {d}
          </div>
        ))}
        {days.map(({ date, minutes, label }) => {
          const opacity = getOpacity(minutes);
          return (
            <div
              key={date}
              className="aspect-square rounded-md cursor-default"
              style={{
                background:
                  opacity === 0 ? "var(--bg-secondary)" : primaryColor,
                opacity: opacity === 0 ? 1 : opacity,
                transition: "transform 0.15s",
              }}
              title={`${label}: ${Math.round(minutes / 60 * 10) / 10}h studied`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <span>Less</span>
        {[0, 0.2, 0.4, 0.7, 1].map((op, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{
              background: op === 0 ? "var(--bg-secondary)" : primaryColor,
              opacity: op === 0 ? 1 : op,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

