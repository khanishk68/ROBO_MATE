// src/components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none";

  const variants = {
    primary: "btn-primary focus-visible:ring-blue-500",
    secondary:
      "border focus-visible:ring-blue-500",
    ghost: "hover:opacity-80 focus-visible:ring-blue-500",
    danger:
      "bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500",
    outline:
      "border hover:opacity-80 focus-visible:ring-blue-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  const variantStyle: React.CSSProperties =
    variant === "secondary"
      ? {
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          borderColor: "var(--border-color)",
        }
      : variant === "ghost"
      ? { color: "var(--text-secondary)", background: "transparent" }
      : variant === "outline"
      ? {
          background: "transparent",
          color: "var(--primary)",
          borderColor: "var(--primary)",
        }
      : {};

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      style={variantStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

