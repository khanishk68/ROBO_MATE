// src/app/login/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Zap, Eye, EyeOff, User, Cpu, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import type { Persona } from "@/types/database";

export default function LoginPage() {
  const router = useRouter();
  const { error: showError, success, info } = useToast();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [persona, setPersona] = useState<Persona>("boy");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showError("Sign in failed", error.message);
    } else {
      success("Welcome back to ROBO MATES!");
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showError("Please enter your name");
      return;
    }
    if (password.length < 6) {
      showError("Password too short", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // 1. Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          persona,
        },
      },
    });

    if (error) {
      showError("Setup failed", error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Create matching profile
      const defaultTheme = persona === "boy" ? "dark" : "light";
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName,
        persona,
        timezone: "Asia/Kolkata",
        theme_mode: defaultTheme,
      });

      // Save persona preference locally
      localStorage.setItem("rm-persona", persona);
      localStorage.setItem("rm-theme", defaultTheme);

      if (data.session) {
        success("Co-Founder Account Activated!", "Redirecting to your dashboard...");
        router.push("/dashboard");
        router.refresh();
      } else {
        info(
          "Account Created!",
          "If email confirmation is enabled in your Supabase project, check your inbox to confirm your email before signing in."
        );
        setMode("signin");
      }
    }

    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
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
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
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
            Two Learners. Two Specializations. One Robotics Journey.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6 sm:p-8 shadow-2xl"
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
                Register New User
              </button>
            </div>
          )}

          {/* Form */}
          {mode === "signin" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email address"
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

              <Button type="submit" loading={loading} className="w-full mt-2">
                Sign In
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
                  Need to register? Create account →
                </button>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                label="Your Name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex or Maya"
                required
                leftIcon={<User className="w-4 h-4" />}
              />

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Select Your Co-Founder Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPersona("boy")}
                    className="p-3 rounded-xl border text-left transition-all"
                    style={{
                      background: persona === "boy" ? "rgba(37,99,235,0.15)" : "var(--bg-secondary)",
                      borderColor: persona === "boy" ? "#2563EB" : "var(--border-color)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-1">
                      <Cpu className="w-3.5 h-3.5" /> Boy Mode
                    </div>
                    <p className="text-[11px] leading-tight" style={{ color: "var(--text-secondary)" }}>
                      Robotics Systems Engineer
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersona("girl")}
                    className="p-3 rounded-xl border text-left transition-all"
                    style={{
                      background: persona === "girl" ? "rgba(217,107,145,0.15)" : "var(--bg-secondary)",
                      borderColor: persona === "girl" ? "#D96B91" : "var(--border-color)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400 mb-1">
                      <Heart className="w-3.5 h-3.5" /> Girl Mode
                    </div>
                    <p className="text-[11px] leading-tight" style={{ color: "var(--text-secondary)" }}>
                      Industrial Product Designer
                    </p>
                  </button>
                </div>
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@robomates.app"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <Input
                label="Create Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

              <Button type="submit" loading={loading} className="w-full mt-2">
                Register Co-Founder Account
              </Button>

              <div className="text-center text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  Already registered? Sign in instead →
                </button>
              </div>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Reset Your Password
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Enter your email address and we&apos;ll send you a password reset link.
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

              <div className="text-center text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}

          {/* Private workspace notice */}
          <div
            className="mt-6 p-3 rounded-xl border text-center"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              🔒 <strong>Private 2-Person Workspace:</strong>
              <br />
              Authorized exclusively for the Robotics Engineer & Industrial Designer co-founders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
