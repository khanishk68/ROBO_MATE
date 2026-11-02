// src/app/projects/RobotMissionLoggerView.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Terminal,
  CheckCircle2,
  Circle,
  GitBranch,
  Save,
  ExternalLink,
  Code2,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import { ROBOT_MISSION_LOGGER_SPEC, MONTH_1_METADATA } from "@/lib/curriculum-month1-khanishk";
import { useToast } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/client";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

interface RobotMissionLoggerViewProps {
  userId: string;
}

export function RobotMissionLoggerView({ userId }: RobotMissionLoggerViewProps) {
  const { success, error: showError } = useToast();
  const supabase = createClient();

  // Storage key
  const storageKey = `robomates_logger_${userId || "khanishk"}`;

  // State
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [passedTests, setPassedTests] = useState<Record<string, boolean>>({});
  const [passCriteria, setPassCriteria] = useState<Record<number, boolean>>({});

  // Submission form
  const [repoUrl, setRepoUrl] = useState("https://github.com/khanishk68/ROBO_MATE");
  const [releaseTag, setReleaseTag] = useState("v1.0.0");
  const [demoNotes, setDemoNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.milestones) setCompletedMilestones(parsed.milestones);
        if (parsed.tests) setPassedTests(parsed.tests);
        if (parsed.criteria) setPassCriteria(parsed.criteria);
        if (parsed.repoUrl) setRepoUrl(parsed.repoUrl);
        if (parsed.releaseTag) setReleaseTag(parsed.releaseTag);
        if (parsed.demoNotes) setDemoNotes(parsed.demoNotes);
      }
    } catch (_) {}
  }, [storageKey]);

  const saveToStorage = (updates: any) => {
    try {
      const existing = localStorage.getItem(storageKey);
      const parsed = existing ? JSON.parse(existing) : {};
      const merged = { ...parsed, ...updates };
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch (_) {}
  };

  const toggleMilestone = (id: string) => {
    const next = { ...completedMilestones, [id]: !completedMilestones[id] };
    setCompletedMilestones(next);
    saveToStorage({ milestones: next });
  };

  const toggleTest = (id: string) => {
    const next = { ...passedTests, [id]: !passedTests[id] };
    setPassedTests(next);
    saveToStorage({ tests: next });
  };

  const toggleCriterion = (idx: number) => {
    const next = { ...passCriteria, [idx]: !passCriteria[idx] };
    setPassCriteria(next);
    saveToStorage({ criteria: next });
  };

  const handleSaveSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    saveToStorage({ repoUrl, releaseTag, demoNotes });

    try {
      // Also sync to Supabase project notes or metadata if available
      success("Submission Saved", "Your GitHub repository and project milestone progress have been recorded.");
    } catch (err: any) {
      showError("Sync error", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const totalTests = ROBOT_MISSION_LOGGER_SPEC.testSuite.length;
  const passedCount = Object.values(passedTests).filter(Boolean).length;
  const testPct = Math.round((passedCount / totalTests) * 100);

  const milestones = [
    {
      id: "m1",
      day: 27,
      title: "Plan & Specify Requirements",
      desc: "Specify mission name, duration, status, and notes schema. Write pseudocode and initial 5 test cases in `mission_logger_spec.md`.",
      deliverable: "mission_logger_spec.md",
    },
    {
      id: "m2",
      day: 28,
      title: "Build CLI Menu & CRUD Operations",
      desc: "Implement interactive while loop menu to add, list, and filter missions. Validate inputs and save records locally as CSV or JSON.",
      deliverable: "main.py & logger_core.py",
    },
    {
      id: "m3",
      day: 29,
      title: "10-Test Scenario Verification & Docs",
      desc: "Run full suite of 10 test scenarios covering normal inputs, invalid numbers, and corrupted files. Write comprehensive README.",
      deliverable: "10-Test Checklist & README.md",
    },
    {
      id: "m4",
      day: 30,
      title: "Final Walkthrough Demo & GitHub Release",
      desc: "Tag release `v1.0.0` on GitHub. Record or document 5-minute live demo. Complete Month-End Pass Criteria review.",
      deliverable: "GitHub Release & Demo Evidence",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div
        className="rounded-2xl border p-5 sm:p-7 relative overflow-hidden backdrop-blur-md"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Month 1 Capstone Project • Days 27–30
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Target: 17 Planned Hours • Software-First (₹0)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              {ROBOT_MISSION_LOGGER_SPEC.title}
            </h1>
            <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {ROBOT_MISSION_LOGGER_SPEC.objective}
            </p>
          </div>

          {/* Test Suite Progress Indicator */}
          <div
            className="p-4 rounded-xl border flex items-center gap-4 w-full md:w-auto md:min-w-[220px]"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span style={{ color: "var(--text-secondary)" }}>10-Test Suite</span>
                <span className="font-bold text-emerald-400">{testPct}% Verified</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${testPct}%`,
                    background: "var(--gradient-accent)",
                  }}
                />
              </div>
              <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-muted)" }}>
                {passedCount} of {totalTests} test cases passed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Knowledge & Schema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Required Knowledge */}
        <div
          className="p-5 rounded-2xl border space-y-3"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Required Engineering Foundations
            </h3>
          </div>
          <ul className="space-y-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Variables, data types, and arithmetic (Days 1–5)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Input validation and conditional branching (Days 4, 8)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interactive while loop CLI menus (Day 10)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modular functions and docstrings (Day 13)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dictionaries for mission state modeling (Day 16)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>File handling: JSON/CSV persistent storage (Day 17)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exception handling with try/except blocks (Day 18)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Git commits, .gitignore, and GitHub push (Days 21, 24)</span>
            </li>
          </ul>
        </div>

        {/* Mission Schema Specification */}
        <div
          className="p-5 rounded-2xl border space-y-3"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              AMR Mission Data Model Schema
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            {ROBOT_MISSION_LOGGER_SPEC.missionFields.map((field) => (
              <div
                key={field.name}
                className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div>
                  <span className="font-mono font-bold text-sky-400">{field.name}</span>
                  <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-black/30 font-mono text-slate-400">
                    {field.type}
                  </span>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {field.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step-by-Step Milestones */}
      <div
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            Step-by-Step Implementation Milestones (Days 27–30)
          </h3>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Toggle checkboxes as you advance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {milestones.map((m) => {
            const isDone = Boolean(completedMilestones[m.id]);
            return (
              <div
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                className="p-4 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3"
                style={{
                  background: isDone ? "var(--bg-secondary)" : "var(--bg-card)",
                  borderColor: isDone ? "var(--primary)50" : "var(--border-color)",
                }}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-sky-400 font-bold">
                      Day {m.day}
                    </span>
                    <h4
                      className="font-bold text-xs sm:text-sm"
                      style={{
                        color: isDone ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {m.title}
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {m.desc}
                  </p>
                  <p className="text-[11px] font-mono mt-1 text-emerald-400">
                    Deliverable: {m.deliverable}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10-Test Scenario Checklist */}
      <div
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
              10-Test Scenario Verification Suite
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Execute each test against your code and check off when verified
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {passedCount}/{totalTests} Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ROBOT_MISSION_LOGGER_SPEC.testSuite.map((tc) => {
            const isPassed = Boolean(passedTests[tc.id]);
            return (
              <div
                key={tc.id}
                onClick={() => toggleTest(tc.id)}
                className="p-3.5 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3"
                style={{
                  background: isPassed ? "var(--bg-secondary)" : "var(--bg-card)",
                  borderColor: isPassed ? "#10B98150" : "var(--border-color)",
                }}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400">{tc.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-slate-400">
                      {tc.id}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    <strong className="text-slate-300">Input:</strong> {tc.inputDescription}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    <strong className="text-emerald-400">Expected:</strong> {tc.expectedBehavior}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Month-End Pass Criteria (7 Points) */}
      <div
        className="p-5 sm:p-6 rounded-2xl border space-y-3"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            Month-End Pass Criteria (Official 7-Point Audit)
          </h3>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Ensure all 7 criteria are achieved before concluding Month 1 and progressing to Month 2 C++ &amp; Electronics:
        </p>

        <div className="space-y-2 pt-1">
          {MONTH_1_METADATA.passCriteria.map((criterion, idx) => {
            const isMet = Boolean(passCriteria[idx]);
            return (
              <label
                key={idx}
                onClick={() => toggleCriterion(idx)}
                className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all"
                style={{
                  background: isMet ? "var(--bg-secondary)" : "var(--bg-card)",
                  borderColor: isMet ? "#10B98140" : "var(--border-color)",
                }}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isMet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  )}
                </div>
                <span
                  className="text-xs sm:text-sm leading-relaxed"
                  style={{
                    color: isMet ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: isMet ? "line-through" : "none",
                  }}
                >
                  {criterion}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* GitHub Submission Form */}
      <div
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2">
          <GithubIcon className="w-5 h-5 text-white" />
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            Project Submission &amp; Repository Link
          </h3>
        </div>

        <form onSubmit={handleSaveSubmission} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/khanishk68/ROBO_MATE"
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-mono border outline-none"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Release Tag / Commit Hash
              </label>
              <input
                type="text"
                value={releaseTag}
                onChange={(e) => setReleaseTag(e.target.value)}
                placeholder="v1.0.0"
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-mono border outline-none"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
              Demo Notes / Self-Evaluation Reflection
            </label>
            <textarea
              rows={3}
              value={demoNotes}
              onChange={(e) => setDemoNotes(e.target.value)}
              placeholder="Record your 5-minute demo link, strengths, limitations, and areas to target in Month 2..."
              className="w-full px-3 py-2 rounded-xl text-xs border outline-none"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold flex items-center gap-1.5 text-sky-400 hover:underline"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Open on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              style={{ background: "var(--gradient-accent)" }}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Project Submission"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

