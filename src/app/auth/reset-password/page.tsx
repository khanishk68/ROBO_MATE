// src/app/auth/reset-password/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { error: showError, success } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      showError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      showError("Password too short", "Use at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      showError("Update failed", error.message);
    } else {
      success("Password updated!");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--gradient-accent)" }}
          >
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black gradient-text">Set New Password</h1>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <form onSubmit={handleReset} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              hint="At least 8 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Button type="submit" loading={loading} className="w-full">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

