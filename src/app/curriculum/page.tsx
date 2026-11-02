// src/app/curriculum/page.tsx
import { Metadata } from "next";
import { CurriculumClient } from "./CurriculumClient";

export const metadata: Metadata = {
  title: "Official Curriculum | ROBO MATES",
  description: "30-Day Robotics Engineering Foundation plan, daily checklist, equipment, and verified study resources.",
};

export default function CurriculumPage() {
  return <CurriculumClient />;
}

