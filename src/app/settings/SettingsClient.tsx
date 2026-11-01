// src/app/settings/SettingsClient.tsx
"use client";
import React, { useState } from "react";
import {
  User, Bell, Clock, Sliders, Moon, Sun, Cpu, Heart,
  Shield, Check, Save, Smartphone, AlertCircle
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toaster";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ReminderPreference, JourneySettings, Persona, ThemeMode } from "@/types/database";

interface SettingsClientProps {
  user: { id: string; email?: string };
  profile: Profile | null;
  reminders: ReminderPreference | null;
  journeySettings: JourneySettings | null;
}

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST, UTC+9:00)" },
];

export function SettingsClient({
  user,
  profile,
  reminders: initialReminders,
  journeySettings,
}: SettingsClientProps) {
  const { isBoyMode, themeMode, setThemeMode, persona, setPersona } = useTheme();
  const { refreshProfile } = useAuth();
  const { success, error: showError, info } = useToast();
  const supabase = createClient();

  // Profile form state
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [selectedPersona, setSelectedPersona] = useState<Persona>(profile?.persona || persona);
  const [timezone, setTimezone] = useState(profile?.timezone || "Asia/Kolkata");
  const [savingProfile, setSavingProfile] = useState(false);

  // Daily Schedule state
  const [dailyHours, setDailyHours] = useState(profile?.daily_study_hours || 4.5);
  const [startTime, setStartTime] = useState(profile?.study_start_time || "09:00");
  const [studyDays, setStudyDays] = useState<number[]>(profile?.study_days || [1, 2, 3, 4, 5, 6]);

  // Push Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialReminders?.enabled ?? false);
  const [reminderTime, setReminderTime] = useState(initialReminders?.reminder_time || "08:30");
  const [remindOverdue, setRemindOverdue] = useState(initialReminders?.remind_overdue ?? true);
  const [remindStreak, setRemindStreak] = useState(initialReminders?.remind_streak ?? true);
  const [pushStatus, setPushStatus] = useState<string>("default");

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          persona: selectedPersona,
          timezone,
          daily_study_hours: dailyHours,
          study_start_time: startTime,
          study_days: studyDays,
          theme_mode: themeMode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setPersona(selectedPersona);
      await refreshProfile();
      success("Profile & Study Schedule Saved!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      showError(msg);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleEnablePush() {
    if (!("Notification" in window)) {
      showError("Browser notifications are not supported by this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === "granted") {
        setNotificationsEnabled(true);

        // Register push subscription if service worker is active
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

          if (vapidKey) {
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: vapidKey,
            });

            const p256dh = sub.getKey("p256dh");
            const auth = sub.getKey("auth");

            if (p256dh && auth) {
              await fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  endpoint: sub.endpoint,
                  p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
                  auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
                }),
              });
            }
          }
        }

        // Save preferences
        await supabase.from("reminder_preferences").upsert({
          user_id: user.id,
          enabled: true,
          reminder_time: reminderTime,
          timezone,
          remind_overdue: remindOverdue,
          remind_streak: remindStreak,
          updated_at: new Date().toISOString(),
        });

        success("Push Notifications Enabled! 🔔", "You'll receive daily morning study reminders.");
      } else {
        showError("Notification permission denied in browser settings.");
      }
    } catch (err) {
      console.error(err);
      showError("Failed to enable push notifications.");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Configure your personal profile, study schedule distribution, theme, and daily push notifications.
        </p>
      </div>

      {/* 1. Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Profile Identity & Specialization
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex"
            />
            <Input
              label="Registered Email (Private Account)"
              value={user.email || ""}
              disabled
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Specialization Mode"
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value as Persona)}
              options={[
                { value: "boy", label: "🤖 Boy Mode — Robotics Systems Engineer" },
                { value: "girl", label: "🎨 Girl Mode — Industrial Product Designer" },
              ]}
            />
            <Select
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={TIMEZONES}
            />
          </div>
        </CardBody>
      </Card>

      {/* 2. Theme & Visual Identity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Theme & Visual Identity
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            ROBO MATES supports four distinct visual aesthetics. Both Light/Dark and Boy/Girl operate independently.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Dark / Light toggle */}
            <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Appearance Mode</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{themeMode === "dark" ? "Dark Mode (Default)" : "Light Mode"}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setThemeMode("dark")}
                  className="p-2 rounded-lg border text-xs"
                  style={{
                    background: themeMode === "dark" ? "var(--primary)" : "transparent",
                    color: themeMode === "dark" ? "white" : "var(--text-muted)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("light")}
                  className="p-2 rounded-lg border text-xs"
                  style={{
                    background: themeMode === "light" ? "var(--primary)" : "transparent",
                    color: themeMode === "light" ? "white" : "var(--text-muted)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <Sun className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Boy / Girl toggle */}
            <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Design Language</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{isBoyMode ? "Obsidian & Neon Cyan" : "Baby Pink & Pearl White"}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setPersona("boy"); setSelectedPersona("boy"); }}
                  className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1"
                  style={{
                    background: isBoyMode ? "#2563EB" : "transparent",
                    color: isBoyMode ? "white" : "var(--text-muted)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <Cpu className="w-3.5 h-3.5" /> Boy
                </button>
                <button
                  onClick={() => { setPersona("girl"); setSelectedPersona("girl"); }}
                  className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1"
                  style={{
                    background: !isBoyMode ? "#D96B91" : "transparent",
                    color: !isBoyMode ? "white" : "var(--text-muted)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <Heart className="w-3.5 h-3.5" /> Girl
                </button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 3. Daily Study Schedule Customization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Daily Study Schedule & Time Allocation
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Target Daily Study Hours: {dailyHours}h
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-blue-600"
              />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Recommended: 4.0 – 5.0 hours/day for consistent 12-month progress.
              </span>
            </div>

            <Input
              label="Study Session Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: "var(--text-secondary)" }}>
              Active Study Days
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { day: 1, label: "Mon" },
                { day: 2, label: "Tue" },
                { day: 3, label: "Wed" },
                { day: 4, label: "Thu" },
                { day: 5, label: "Fri" },
                { day: 6, label: "Sat (Project)" },
                { day: 0, label: "Sun (Revision)" },
              ].map(({ day, label }) => {
                const active = studyDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setStudyDays(
                        active ? studyDays.filter((d) => d !== day) : [...studyDays, day]
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                    style={{
                      background: active ? "var(--primary)" : "var(--bg-secondary)",
                      color: active ? "white" : "var(--text-muted)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Push Notifications & Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Web Push Notifications & Daily Reminders
              </h2>
            </div>
            {notificationsEnabled && <Badge variant="success">Active</Badge>}
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Receive browser push notifications even when the tab is closed, powered by Web Push VAPID and Service Workers.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Daily Reminder Time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />

            <div className="flex items-end">
              <Button
                variant={notificationsEnabled ? "secondary" : "primary"}
                onClick={handleEnablePush}
                className="w-full"
              >
                <Smartphone className="w-4 h-4" />
                {notificationsEnabled ? "Re-sync Push Permission" : "Enable Web Push Reminders"}
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remindOverdue}
                onChange={(e) => setRemindOverdue(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span>Alert me about carried-over / overdue tasks</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remindStreak}
                onChange={(e) => setRemindStreak(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span>Send daily streak encouragement alerts</span>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Save Button Bar */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveProfile} loading={savingProfile} size="lg">
          <Save className="w-4 h-4" /> Save All Preferences
        </Button>
      </div>
    </div>
  );
}

