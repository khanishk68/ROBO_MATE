// src/lib/curriculum-engine.ts
// =============================================================================
// ROBO MATES: 365-Day Programme & Curriculum Date Engine
// Fixed Timeline: 8 November 2026 to 7 November 2027 (Asia/Kolkata)
// =============================================================================

import { KHANISHK_CURRICULUM, type CurriculumMonth, type CurriculumWeek, type CurriculumDailyTaskTemplate } from "./curriculum-khanishk";
import { AKSHAYA_CURRICULUM } from "./curriculum-akshaya";
import type { ProfileSlug } from "@/types/database";

export const PROGRAMME_START_DATE = "2026-11-08"; // Sunday, 8 Nov 2026
export const PROGRAMME_END_DATE = "2027-11-07";   // Sunday, 7 Nov 2027
export const TOTAL_PROGRAMME_DAYS = 365;
export const TOTAL_PROGRAMME_WEEKS = 52;
export const TOTAL_PROGRAMME_MONTHS = 12;

export interface ProgrammeDayInfo {
  dayNumber: number; // 1 to 365
  weekNumber: number; // 1 to 52
  monthNumber: number; // 1 to 12
  dayOfWeek: number; // 1 to 7 (Day 7 is Review / Rest day)
  isRestDay: boolean;
  calendarDate: string; // YYYY-MM-DD
  dayLabel: string;
}

export interface GeneratedDailyTask {
  id: string;
  title: string;
  instructions: string;
  learningObjective: string;
  expectedDurationMinutes: number;
  category: "theory" | "practical" | "exercise" | "assessment" | "project" | "revision";
  difficulty: "beginner" | "intermediate" | "advanced";
  requiredResources: string;
  expectedOutput: string;
  completionCriteria: string;
  scheduledDate: string;
  weekNumber: number;
  monthNumber: number;
  subject: string;
}

/**
 * Calculates the exact programme day (1..365) from any calendar date.
 */
export function getProgrammeDayInfo(dateInput?: string | Date): ProgrammeDayInfo {
  const start = new Date(PROGRAMME_START_DATE + "T00:00:00Z");
  
  let target: Date;
  if (!dateInput) {
    target = new Date();
  } else if (typeof dateInput === "string") {
    target = new Date(dateInput.split("T")[0] + "T00:00:00Z");
  } else {
    target = new Date(dateInput.toISOString().split("T")[0] + "T00:00:00Z");
  }

  const diffMs = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Calculate clamped dayNumber (1 to 365)
  let dayNumber = diffDays + 1;
  if (dayNumber < 1) dayNumber = 1;
  if (dayNumber > TOTAL_PROGRAMME_DAYS) dayNumber = TOTAL_PROGRAMME_DAYS;

  // Calculate weekNumber (1 to 52)
  const weekNumber = Math.min(52, Math.max(1, Math.floor((dayNumber - 1) / 7) + 1));

  // Calculate monthNumber (1 to 12)
  // Mapping 52 weeks across 12 months (Months 4, 7, 10, 12 have 5 weeks; others have 4 weeks)
  const monthNumber = getMonthForWeek(weekNumber);

  // Day of week (1 to 7)
  const dayOfWeek = ((dayNumber - 1) % 7) + 1;
  const isRestDay = dayOfWeek === 7;

  const calendarDate = getDateForProgrammeDay(dayNumber);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayIndex = (new Date(calendarDate + "T00:00:00Z")).getUTCDay();

  return {
    dayNumber,
    weekNumber,
    monthNumber,
    dayOfWeek,
    isRestDay,
    calendarDate,
    dayLabel: `${dayNames[dayIndex]} • Programme Day ${dayNumber} of 365`,
  };
}

/**
 * Maps week 1..52 to month 1..12
 */
export function getMonthForWeek(week: number): number {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  if (week <= 12) return 3;
  if (week <= 17) return 4;
  if (week <= 21) return 5;
  if (week <= 25) return 6;
  if (week <= 30) return 7;
  if (week <= 34) return 8;
  if (week <= 38) return 9;
  if (week <= 43) return 10;
  if (week <= 47) return 11;
  return 12;
}

/**
 * Returns the exact YYYY-MM-DD date for programme day 1..365
 */
export function getDateForProgrammeDay(dayNumber: number): string {
  const start = new Date(PROGRAMME_START_DATE + "T00:00:00Z");
  start.setUTCDate(start.getUTCDate() + (dayNumber - 1));
  return start.toISOString().split("T")[0];
}

/**
 * Gets curriculum dataset for given profile
 */
export function getCurriculumForProfile(slug: ProfileSlug | string): CurriculumMonth[] {
  return slug === "akshaya" ? AKSHAYA_CURRICULUM : KHANISHK_CURRICULUM;
}

/**
 * Finds specific week definition across the 12 months
 */
export function getCurriculumWeek(slug: ProfileSlug | string, weekNumber: number): { week: CurriculumWeek; month: CurriculumMonth } | null {
  const months = getCurriculumForProfile(slug);
  for (const month of months) {
    const foundWeek = month.weeks.find((w) => w.weekNumber === weekNumber);
    if (foundWeek) {
      return { week: foundWeek, month };
    }
  }
  return null;
}

/**
 * Generates the concrete daily tasks for a specific date and profile.
 */
export function getDailyTasksForDate(slug: ProfileSlug | string, dateString: string): GeneratedDailyTask[] {
  const dayInfo = getProgrammeDayInfo(dateString);
  const weekData = getCurriculumWeek(slug, dayInfo.weekNumber);

  if (!weekData) return [];

  const { week, month } = weekData;
  const isKhanishk = slug !== "akshaya";

  // Filter tasks designed for this day of week (1 to 7)
  let dayTasks = week.dailyTasks.filter((t) => t.dayOfWeek === dayInfo.dayOfWeek);

  // If week only defined day 1 and day 7 templates, dynamically synthesize the active day's tasks
  if (dayTasks.length === 0) {
    if (dayInfo.isRestDay) {
      // Day 7: Assessment & Review Day
      dayTasks = [
        {
          dayOfWeek: 7,
          title: `${week.title} — Knowledge & Practical Assessment`,
          instructions: `Complete weekly review for Week ${dayInfo.weekNumber}. Review notes and demonstrate milestone deliverable: ${week.deliverable}`,
          learningObjective: week.learningObjective,
          expectedDurationMinutes: isKhanishk ? 45 : 30,
          difficulty: "intermediate",
          category: "assessment",
          requiredResources: "Robo Mates Portal",
          expectedOutput: "Completed Assessment Submission",
          completionCriteria: "Score >= 80%",
        },
        {
          dayOfWeek: 7,
          title: isKhanishk ? "Git Push, Code Demonstration & Weekly Rest" : "Sketchbook Review, CAD Clean-up & Rest",
          instructions: isKhanishk
            ? "Commit clean code to GitHub repository, write 3-sentence summary of week learnings, and take time to recharge."
            : "Archive clean sketches and CAD assembly in project folder, document key design insights, and take creative rest.",
          learningObjective: "Weekly consolidation & rest",
          expectedDurationMinutes: isKhanishk ? 45 : 30,
          difficulty: "beginner",
          category: "revision",
          requiredResources: "Repository / Portfolio folder",
          expectedOutput: "Pushed Commit & Summary Note",
          completionCriteria: "Working tree clean, rested mind",
        },
      ];
    } else {
      // Days 1 to 6: Active Study Days
      const dayThemes = [
        { phase: "Theory & Principles", cat: "theory" as const, minK: 60, minA: 30 },
        { phase: "Hands-on Guided Practice", cat: "practical" as const, minK: 75, minA: 45 },
        { phase: "AMR Capstone Project Sub-Task", cat: "project" as const, minK: 90, minA: 45 },
        { phase: "Implementation Exercises & Lab", cat: "exercise" as const, minK: 60, minA: 30 },
        { phase: "Revision & Technical Documentation", cat: "revision" as const, minK: 30, minA: 15 },
      ];

      dayTasks = dayThemes.map((theme, idx) => ({
        dayOfWeek: dayInfo.dayOfWeek,
        title: `${week.title} — Day ${dayInfo.dayOfWeek}: ${theme.phase}`,
        instructions: isKhanishk
          ? `Module: ${week.title}. Focus on: ${month.mainSubjects.join(", ")}. Advance towards deliverable: ${week.deliverable}`
          : `Module: ${week.title}. Focus on: ${month.mainSubjects.join(", ")}. Advance towards deliverable: ${week.deliverable}`,
        learningObjective: week.learningObjective,
        expectedDurationMinutes: isKhanishk ? theme.minK : theme.minA,
        difficulty: idx === 2 ? "intermediate" : "beginner",
        category: theme.cat,
        requiredResources: month.mainSubjects.join(" / "),
        expectedOutput: `Verified work for ${theme.phase}`,
        completionCriteria: "Satisfies module objective",
      }));
    }
  }

  return dayTasks.map((t, idx) => ({
    id: `curr-${slug}-d${dayInfo.dayNumber}-t${idx + 1}`,
    title: t.title,
    instructions: t.instructions,
    learningObjective: t.learningObjective,
    expectedDurationMinutes: t.expectedDurationMinutes,
    category: t.category,
    difficulty: t.difficulty,
    requiredResources: t.requiredResources,
    expectedOutput: t.expectedOutput,
    completionCriteria: t.completionCriteria,
    scheduledDate: dateString,
    weekNumber: dayInfo.weekNumber,
    monthNumber: dayInfo.monthNumber,
    subject: month.mainSubjects[0] || (isKhanishk ? "Robotics" : "Design"),
  }));
}

