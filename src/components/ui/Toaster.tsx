// src/components/ui/Toaster.tsx
"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
};

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { ...opts, id }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const success = useCallback((title: string, description?: string) =>
    toast({ type: "success", title, description }), [toast]);
  const error = useCallback((title: string, description?: string) =>
    toast({ type: "error", title, description }), [toast]);
  const info = useCallback((title: string, description?: string) =>
    toast({ type: "info", title, description }), [toast]);
  const warning = useCallback((title: string, description?: string) =>
    toast({ type: "warning", title, description }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-lg border animate-fade-in",
              "backdrop-blur-sm"
            )}
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            <span
              className={cn(
                t.type === "success" && "text-green-400",
                t.type === "error" && "text-red-400",
                t.type === "warning" && "text-amber-400",
                t.type === "info" && "text-blue-400",
                "flex-shrink-0 mt-0.5"
              )}
            >
              {icons[t.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t.title}</p>
              {t.description && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within Toaster");
  return ctx;
}

