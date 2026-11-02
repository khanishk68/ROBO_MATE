// src/components/ui/Badge.tsx
import React from "react";
import { cn } from "@/lib/utils";
import type { TaskStatus, Priority } from "@/types/database";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "primary" | "muted";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "primary", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        `badge-${variant}`,
        size === "md" && "px-3 py-1 text-sm",
        className
      )}
    >
      {children}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; variant: BadgeProps["variant"] }> = {
    pending:     { label: "Pending",     variant: "muted" },
    in_progress: { label: "In Progress", variant: "info" },
    completed:   { label: "Completed",   variant: "success" },
    missed:      { label: "Missed",      variant: "error" },
    skipped:     { label: "Skipped",     variant: "warning" },
    postponed:   { label: "Postponed",   variant: "warning" },
  };
  const { label, variant } = map[status] || map.pending;
  return <Badge variant={variant}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { label: string; variant: BadgeProps["variant"] }> = {
    low:      { label: "Low",      variant: "muted" },
    medium:   { label: "Medium",   variant: "info" },
    high:     { label: "High",     variant: "warning" },
    critical: { label: "Critical", variant: "error" },
  };
  const { label, variant } = map[priority] || map.medium;
  return <Badge variant={variant}>{label}</Badge>;
}

