// src/components/ui/ProgressBar.tsx
"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  height?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  className,
  height = "sm",
  showLabel = false,
  label,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn("progress-bar w-full", heights[height])}
      >
        <div
          className={cn("progress-fill", animated && "transition-all duration-700")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  label,
  sublabel,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && (
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

