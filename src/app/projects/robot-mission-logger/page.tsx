// src/app/projects/robot-mission-logger/page.tsx
import { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RobotMissionLoggerView } from "../RobotMissionLoggerView";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Robot Mission Logger v1 | ROBO MATES Capstone",
  description: "Month 1 Capstone Project: Command-line AMR Mission Logger in Python with CSV/JSON storage and 10-test scenario checklist.",
};

export default async function RobotMissionLoggerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AppShell title="Robot Mission Logger v1">
      <div className="max-w-6xl mx-auto pb-16">
        <RobotMissionLoggerView userId={user?.id || "khanishk"} />
      </div>
    </AppShell>
  );
}

