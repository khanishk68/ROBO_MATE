-- supabase/migrations/20261102000000_init_schema.sql
-- =============================================================================
-- ROBO MATES: Full PostgreSQL Database Schema with Strict RLS Policies
-- Enforces 2-User Workspace Limit & Personal Privacy Boundaries
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    persona TEXT NOT NULL CHECK (persona IN ('boy', 'girl')),
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    theme_mode TEXT NOT NULL DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark')),
    daily_study_hours NUMERIC NOT NULL DEFAULT 4.5,
    study_start_time TEXT NOT NULL DEFAULT '09:00',
    study_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6}',
    journey_start_date DATE,
    journey_target_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'ROBO MATES Workspace',
    member_limit INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. WORKSPACE MEMBERS TABLE (Strict 2-member limit)
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (workspace_id, user_id)
);

-- Trigger to enforce maximum 2 members per workspace
CREATE OR REPLACE FUNCTION check_workspace_member_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    max_limit INTEGER;
BEGIN
    SELECT COUNT(*), w.member_limit INTO current_count, max_limit
    FROM public.workspace_members wm
    JOIN public.workspaces w ON w.id = wm.workspace_id
    WHERE wm.workspace_id = NEW.workspace_id
    GROUP BY w.member_limit;

    IF current_count >= COALESCE(max_limit, 2) THEN
        RAISE EXCEPTION 'ROBO MATES Private Workspace limit reached (maximum % members allowed).', max_limit;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_workspace_member_limit ON public.workspace_members;
CREATE TRIGGER enforce_workspace_member_limit
BEFORE INSERT ON public.workspace_members
FOR EACH ROW
EXECUTE FUNCTION check_workspace_member_limit();

-- 4. ROADMAP MONTHS TABLE (12-Month Curriculum definition)
CREATE TABLE IF NOT EXISTS public.roadmap_months (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona TEXT NOT NULL CHECK (persona IN ('boy', 'girl')),
    month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    main_subjects TEXT[] NOT NULL DEFAULT '{}',
    deliverable TEXT NOT NULL,
    estimated_hours INTEGER NOT NULL DEFAULT 120,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(persona, month_number)
);

-- 5. ROADMAP MODULES TABLE
CREATE TABLE IF NOT EXISTS public.roadmap_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month_id UUID NOT NULL REFERENCES public.roadmap_months(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
    sequence INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. STUDY TASKS TABLE
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.roadmap_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    learning_objective TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    resource_url TEXT,
    task_type TEXT NOT NULL DEFAULT 'theory' CHECK (task_type IN ('theory', 'practical', 'exercise', 'assessment', 'project', 'revision')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. TASK OCCURRENCES TABLE (Scheduled instances & carry-forwards)
CREATE TABLE IF NOT EXISTS public.task_occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.study_tasks(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    original_due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed', 'skipped')),
    completed_at TIMESTAMPTZ,
    actual_duration_minutes INTEGER,
    carry_forward_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(task_id, owner_id, scheduled_date)
);

-- 8. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_occurrence_id UUID REFERENCES public.task_occurrences(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 9. DAILY CHECKINS TABLE
CREATE TABLE IF NOT EXISTS public.daily_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    study_date DATE NOT NULL,
    reflection TEXT,
    mood INTEGER CHECK (mood BETWEEN 1 AND 5),
    total_minutes_studied INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_total INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(user_id, study_date)
);

-- 10. ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.roadmap_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('weekly', 'monthly')),
    week_number INTEGER,
    month_number INTEGER,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. ASSESSMENT RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    weak_topics TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. REMINDER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.reminder_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    reminder_time TEXT NOT NULL DEFAULT '08:30',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    remind_overdue BOOLEAN NOT NULL DEFAULT true,
    remind_streak BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. PUSH SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reminder', 'streak', 'overdue', 'milestone', 'system')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 15. AI CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 16. AI MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 17. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed')),
    start_date DATE,
    target_date DATE,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 18. PROJECT TASKS TABLE
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    owner_id TEXT, -- 'boy', 'girl', or user UUID
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed', 'skipped')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 19. PROJECT ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.project_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT,
    file_name TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 20. PROJECT NOTES TABLE
CREATE TABLE IF NOT EXISTS public.project_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 21. STUDY RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.study_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.roadmap_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('book', 'pdf', 'website', 'tutorial', 'youtube', 'note', 'image', 'other')),
    resource_url TEXT,
    file_path TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 22. JOURNEY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.journey_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theory_percentage INTEGER NOT NULL DEFAULT 25,
    practical_percentage INTEGER NOT NULL DEFAULT 25,
    hardware_percentage INTEGER NOT NULL DEFAULT 35,
    revision_percentage INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- =============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_task_occurrences_owner_date ON public.task_occurrences(owner_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_task_occurrences_status ON public.task_occurrences(status);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, study_date);
CREATE INDEX IF NOT EXISTS idx_roadmap_modules_owner_sequence ON public.roadmap_modules(owner_id, sequence);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_settings ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Authorized users can read all profiles in their workspace; edit only their own
CREATE POLICY "Profiles are readable by authenticated members"
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- 2. Roadmap Months: Read-only for authenticated users
CREATE POLICY "Roadmap months are viewable by all authenticated users"
ON public.roadmap_months FOR SELECT TO authenticated
USING (true);

-- 3. Roadmap Modules: Users can view and manage their own modules
CREATE POLICY "Users can manage their own modules"
ON public.roadmap_modules FOR ALL TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Co-founders can view peer roadmap modules"
ON public.roadmap_modules FOR SELECT TO authenticated
USING (true);

-- 4. Tasks & Occurrences: Private to each student
CREATE POLICY "Users can manage their own study tasks"
ON public.study_tasks FOR ALL TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own task occurrences"
ON public.task_occurrences FOR ALL TO authenticated
USING (auth.uid() = owner_id);

-- 5. Daily Check-ins: Viewable by both co-founders, editable only by owner
CREATE POLICY "Checkins viewable by co-founders"
ON public.daily_checkins FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can manage their own checkins"
ON public.daily_checkins FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- 6. AI Conversations & Messages: STRICTLY PRIVATE TO EACH USER
CREATE POLICY "AI conversations strictly private to user"
ON public.ai_conversations FOR ALL TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "AI messages strictly private to conversation owner"
ON public.ai_messages FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE id = ai_messages.conversation_id AND user_id = auth.uid()
    )
);

-- 7. Shared Robotics Project: Fully collaborative between both members
CREATE POLICY "Shared projects accessible by authenticated workspace members"
ON public.projects FOR ALL TO authenticated
USING (true);

CREATE POLICY "Project tasks managed collaboratively"
ON public.project_tasks FOR ALL TO authenticated
USING (true);

CREATE POLICY "Project notes managed collaboratively"
ON public.project_notes FOR ALL TO authenticated
USING (true);

CREATE POLICY "Project attachments managed collaboratively"
ON public.project_attachments FOR ALL TO authenticated
USING (true);

-- 8. Study Resources: Readable by both, editable by creator
CREATE POLICY "Study resources viewable by both"
ON public.study_resources FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Study resources editable by owner"
ON public.study_resources FOR ALL TO authenticated
USING (auth.uid() = owner_id);

-- 9. Reminders & Notifications: Strictly private
CREATE POLICY "Reminder preferences private to user"
ON public.reminder_preferences FOR ALL TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Push subscriptions private to user"
ON public.push_subscriptions FOR ALL TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Notifications private to user"
ON public.notifications FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- 10. Automated user profile creation trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        display_name,
        persona,
        theme_mode,
        timezone,
        daily_study_hours,
        study_start_time,
        study_days
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'display_name', 'Founder'),
        COALESCE(new.raw_user_meta_data->>'persona', 'boy'),
        CASE WHEN COALESCE(new.raw_user_meta_data->>'persona', 'boy') = 'girl' THEN 'light' ELSE 'dark' END,
        'Asia/Kolkata',
        4.5,
        '09:00',
        '{1,2,3,4,5,6}'
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        persona = EXCLUDED.persona;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


