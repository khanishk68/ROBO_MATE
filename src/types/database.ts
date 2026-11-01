// src/types/database.ts
// Supabase database type definitions

export type Persona = "boy" | "girl";
export type ThemeMode = "light" | "dark";
export type TaskStatus = "pending" | "in_progress" | "completed" | "missed" | "skipped";
export type Priority = "low" | "medium" | "high" | "critical";
export type ResourceType = "book" | "pdf" | "website" | "tutorial" | "youtube" | "note" | "image" | "other";
export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed";
export type MessageRole = "user" | "assistant";
export type NotificationType = "reminder" | "streak" | "overdue" | "milestone" | "system";
export type AssessmentType = "weekly" | "monthly";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          persona: Persona;
          avatar_url: string | null;
          timezone: string;
          theme_mode: ThemeMode;
          daily_study_hours: number;
          study_start_time: string;
          study_days: number[];
          journey_start_date: string | null;
          journey_target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          member_limit: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workspaces"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workspaces"]["Insert"]>;
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "member";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workspace_members"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workspace_members"]["Insert"]>;
      };
      roadmap_months: {
        Row: {
          id: string;
          persona: Persona;
          month_number: number;
          title: string;
          description: string;
          main_subjects: string[];
          deliverable: string;
          estimated_hours: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["roadmap_months"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["roadmap_months"]["Insert"]>;
      };
      roadmap_modules: {
        Row: {
          id: string;
          owner_id: string;
          month_id: string;
          title: string;
          description: string;
          week_number: number;
          sequence: number;
          start_date: string | null;
          end_date: string | null;
          status: "not_started" | "in_progress" | "completed" | "skipped";
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["roadmap_modules"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["roadmap_modules"]["Insert"]>;
      };
      study_tasks: {
        Row: {
          id: string;
          owner_id: string;
          module_id: string | null;
          title: string;
          description: string | null;
          subject: string;
          learning_objective: string | null;
          duration_minutes: number;
          priority: Priority;
          resource_url: string | null;
          task_type: "theory" | "practical" | "exercise" | "assessment" | "project" | "revision";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["study_tasks"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["study_tasks"]["Insert"]>;
      };
      task_occurrences: {
        Row: {
          id: string;
          task_id: string;
          owner_id: string;
          scheduled_date: string;
          original_due_date: string;
          status: TaskStatus;
          completed_at: string | null;
          actual_duration_minutes: number | null;
          carry_forward_count: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["task_occurrences"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["task_occurrences"]["Insert"]>;
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_occurrence_id: string | null;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["study_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["study_sessions"]["Insert"]>;
      };
      daily_checkins: {
        Row: {
          id: string;
          user_id: string;
          study_date: string;
          reflection: string | null;
          mood: number | null;
          total_minutes_studied: number;
          tasks_completed: number;
          tasks_total: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["daily_checkins"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["daily_checkins"]["Insert"]>;
      };
      assessments: {
        Row: {
          id: string;
          owner_id: string;
          module_id: string | null;
          title: string;
          description: string | null;
          assessment_type: AssessmentType;
          week_number: number | null;
          month_number: number | null;
          questions: AssessmentQuestion[];
          due_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["assessments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["assessments"]["Insert"]>;
      };
      assessment_results: {
        Row: {
          id: string;
          assessment_id: string;
          user_id: string;
          score: number;
          max_score: number;
          answers: Record<string, string>;
          weak_topics: string[];
          notes: string | null;
          completed_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["assessment_results"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["assessment_results"]["Insert"]>;
      };
      reminder_preferences: {
        Row: {
          id: string;
          user_id: string;
          enabled: boolean;
          reminder_time: string;
          timezone: string;
          remind_overdue: boolean;
          remind_streak: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reminder_preferences"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reminder_preferences"]["Insert"]>;
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["push_subscriptions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["push_subscriptions"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: NotificationType;
          sent_at: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_conversations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["ai_conversations"]["Insert"]>;
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["ai_messages"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          description: string | null;
          status: ProjectStatus;
          start_date: string | null;
          target_date: string | null;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      project_tasks: {
        Row: {
          id: string;
          project_id: string;
          owner_id: string | null;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: Priority;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["project_tasks"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["project_tasks"]["Insert"]>;
      };
      project_attachments: {
        Row: {
          id: string;
          project_id: string;
          uploaded_by: string;
          file_path: string | null;
          file_name: string;
          file_url: string | null;
          file_type: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["project_attachments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["project_attachments"]["Insert"]>;
      };
      project_notes: {
        Row: {
          id: string;
          project_id: string;
          author_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["project_notes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["project_notes"]["Insert"]>;
      };
      study_resources: {
        Row: {
          id: string;
          owner_id: string;
          module_id: string | null;
          title: string;
          description: string | null;
          resource_type: ResourceType;
          resource_url: string | null;
          file_path: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["study_resources"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["study_resources"]["Insert"]>;
      };
      journey_settings: {
        Row: {
          id: string;
          user_id: string;
          theory_percentage: number;
          practical_percentage: number;
          hardware_percentage: number;
          revision_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["journey_settings"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["journey_settings"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "short_answer" | "practical";
  options?: string[];
  correct_answer?: string;
  points: number;
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];
export type RoadmapMonth = Database["public"]["Tables"]["roadmap_months"]["Row"];
export type RoadmapModule = Database["public"]["Tables"]["roadmap_modules"]["Row"];
export type StudyTask = Database["public"]["Tables"]["study_tasks"]["Row"];
export type TaskOccurrence = Database["public"]["Tables"]["task_occurrences"]["Row"];
export type StudySession = Database["public"]["Tables"]["study_sessions"]["Row"];
export type DailyCheckin = Database["public"]["Tables"]["daily_checkins"]["Row"];
export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"];
export type ReminderPreference = Database["public"]["Tables"]["reminder_preferences"]["Row"];
export type PushSubscription = Database["public"]["Tables"]["push_subscriptions"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type AIConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
export type AIMessage = Database["public"]["Tables"]["ai_messages"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectTask = Database["public"]["Tables"]["project_tasks"]["Row"];
export type ProjectAttachment = Database["public"]["Tables"]["project_attachments"]["Row"];
export type ProjectNote = Database["public"]["Tables"]["project_notes"]["Row"];
export type StudyResource = Database["public"]["Tables"]["study_resources"]["Row"];
export type JourneySettings = Database["public"]["Tables"]["journey_settings"]["Row"];

// Extended types with joins
export type TaskOccurrenceWithTask = TaskOccurrence & {
  study_tasks: StudyTask;
};

export type RoadmapModuleWithMonth = RoadmapModule & {
  roadmap_months: RoadmapMonth;
};

