// src/app/login/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Zap, Eye, EyeOff, Shield, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";

export default function LoginPage() {
  const router = useRouter();
  const { error: showError, success } = useToast();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("ROBO MATES Private Workspace");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showError("Sign in failed", error.message);
      setLoading(false);
    } else {
      success("Authenticated!", "Loading your co-founder profiles...");
      router.push("/profile-select");
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showError("Email and password are required");
      return;
    }
    if (password.length < 6) {
      showError("Password too short", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Register & auto-confirm via Server Admin API (provisions Khanishk & Akshaya profiles)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, workspaceName }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Setup failed. Please check credentials.");
      }

      // 2. Automatically log the user in immediately
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        showError("Account initialized, please sign in", signInError.message);
        setMode("signin");
        setLoading(false);
        return;
      }

      success("Workspace Activated!", "Select your profile to begin learning...");
      router.push("/profile-select");
      router.refresh();
    } catch (err: any) {
      showError("Activation failed", err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      showError("Reset failed", error.message);
    } else {
      success("Reset email sent", "Check your inbox for the password reset link.");
      setMode("signin");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 tech-grid"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: "var(--neon)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl"
            style={{ background: "var(--gradient-accent)" }}
          >
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black gradient-text tracking-tight">ROBO MATES</h1>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            Khanishk &amp; Akshaya • Two Specializations • One Robotics Journey
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6 sm:p-8 shadow-2xl backdrop-blur-md"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          {/* Mode Switcher Tabs */}
          {mode !== "reset" && (
            <div
              className="flex p-1 rounded-xl mb-6 border"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
            >
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
                style={{
                  background: mode === "signin" ? "var(--primary)" : "transparent",
                  color: mode === "signin" ? "white" : "var(--text-muted)",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
                style={{
                  background: mode === "signup" ? "var(--primary)" : "transparent",
                  color: mode === "signup" ? "white" : "var(--text-muted)",
                }}
              >
                Activate Account
              </button>
            </div>
          )}

          {/* Sign In Form */}
          {mode === "signin" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Co-Founder Account Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
              />

              <Button type="submit" loading={loading} className="w-full mt-2 font-bold">
                Sign In to Workspace
              </Button>

              <div className="flex justify-between items-center text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  First-time setup? Activate →
                </button>
              </div>
            </form>
          )}

          {/* Activate Workspace / Initial Setup Form */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div
                className="p-3.5 rounded-xl border mb-2 text-xs leading-relaxed"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1" style={{ color: "var(--primary)" }}>
                  <Shield className="w-4 h-4" /> Single Authenticated Co-Founder Account
                </div>
                Activating this account creates access for both <strong>Khanishk</strong> (Robotics Systems Engineer) and <strong>Akshaya</strong> (Product Designer). You will choose your profile on the next screen.
              </div>

              <Input
                label="Account Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tkhanishk0@gmail.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <Input
                label="Create Password (min. 6 characters)"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="new-password"
              />

              <Button type="submit" loading={loading} className="w-full mt-2 font-bold">
                Activate Co-Founder Workspace
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  Already have an account? Sign in instead →
                </button>
              </div>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Enter your account email to receive a password reset link.
              </p>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-xs font-semibold hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          ROBO MATES AMR • 8 November 2026 – 7 November 2027
        </p>
      </div>
    </div>
  );
}
