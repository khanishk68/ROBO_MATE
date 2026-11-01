// src/components/ui/Card.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className, elevated, hover, style }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        hover && "hover:border-primary/50 hover:shadow-glow cursor-pointer",
        elevated ? "card-elevated" : "card",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("p-4 pb-3 border-b", className)} style={{ borderColor: "var(--border-color)", ...style }}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn("p-4", className)} style={style}>{children}</div>;
}

export function CardFooter({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("p-4 pt-3 border-t", className)}
      style={{ borderColor: "var(--border-color)", ...style }}
    >
      {children}
    </div>
  );
}

