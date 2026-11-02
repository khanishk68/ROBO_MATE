-- supabase/COMPLETE_SETUP.sql
-- =============================================================================
-- ROBO MATES: Complete Production PostgreSQL Database Schema & Curriculum Setup
-- Single Co-Founder Account with Netflix-Style Profile Selector:
--   1. Khanishk (Robotics Systems Engineer • Boy Mode)
--   2. Akshaya (Industrial & Robotics Product Designer • Girl Mode)
-- Shared Capstone Project: ROBO MATES AMR (Autonomous Mobile Robot)
-- Programme: 8 November 2026 to 7 November 2027 (52 Weeks • 365 Days)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'ROBO MATES Private Workspace',
    member_limit INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. PROFILES (Two profiles under one authenticated account)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL CHECK (slug IN ('khanishk', 'akshaya')),
    display_name TEXT NOT NULL,
    persona TEXT NOT NULL CHECK (persona IN ('boy', 'girl')),
    specialization TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    theme_mode TEXT NOT NULL DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark')),
    daily_study_hours NUMERIC NOT NULL DEFAULT 4.5,
    study_start_time TEXT NOT NULL DEFAULT '09:00',
    study_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6}',
    journey_start_date DATE NOT NULL DEFAULT '2026-11-08',
    journey_target_date DATE NOT NULL DEFAULT '2027-11-07',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(account_id, slug)
);

-- 3. WORKSPACE MEMBERS
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (workspace_id, profile_id)
);

-- 4. CURRICULUM MONTHS (12 Months per specialization)
CREATE TABLE IF NOT EXISTS public.roadmap_months (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona TEXT NOT NULL CHECK (persona IN ('boy', 'girl')),
    month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    main_subjects TEXT[] NOT NULL DEFAULT '{}',
    deliverable TEXT NOT NULL,
    estimated_hours INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(persona, month_number)
);

-- 5. CURRICULUM MODULES (52 Weekly modules per learner)
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(owner_id, week_number)
);

-- 6. STUDY TASKS (Curriculum & custom tasks)
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
    expected_output TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. TASK OCCURRENCES (Dated instances across all 365 programme days)
CREATE TABLE IF NOT EXISTS public.task_occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.study_tasks(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    original_due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'postponed', 'skipped')),
    completed_at TIMESTAMPTZ,
    actual_duration_minutes INTEGER,
    carry_forward_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(task_id, owner_id, scheduled_date)
);

-- 8. STUDY SESSIONS (Live timer tracking)
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

-- 9. DAILY CHECKINS (Streaks & reflection)
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

-- 10. ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.roadmap_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT NOT NULL DEFAULT 'weekly' CHECK (assessment_type IN ('weekly', 'monthly')),
    week_number INTEGER,
    month_number INTEGER,
    questions JSONB NOT NULL DEFAULT '[]',
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. ASSESSMENT RESULTS
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 100,
    answers JSONB NOT NULL DEFAULT '{}',
    weak_topics TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. SHARED AMR CAPSTONE PROJECT
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'ROBO MATES AMR — Autonomous Mobile Robot',
    description TEXT NOT NULL DEFAULT 'Shared long-term capstone: design, simulate, construct, test, and demonstrate an autonomous mobile robot.',
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed')),
    start_date DATE NOT NULL DEFAULT '2026-11-08',
    target_date DATE NOT NULL DEFAULT '2027-11-07',
    repository_url TEXT DEFAULT 'https://github.com/khanishk68/ROBO_MATE',
    cad_repository_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. PROJECT MILESTONES (6 Stages aligned with curriculum)
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 6),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    khanishk_deliverable TEXT NOT NULL,
    akshaya_deliverable TEXT NOT NULL,
    shared_deliverable TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. PROJECT TASKS
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 15. PROJECT NOTES & ACTIVITY
CREATE TABLE IF NOT EXISTS public.project_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 16. STUDY RESOURCES
CREATE TABLE IF NOT EXISTS public.study_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'website',
    url TEXT,
    file_path TEXT,
    is_shared BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 17. AI CONVERSATIONS & MESSAGES (Scoped by profile_id)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Robotics Discussion',
    context_type TEXT NOT NULL DEFAULT 'tutor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 18. REMINDERS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.reminder_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    reminder_time TEXT NOT NULL DEFAULT '09:00',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    remind_overdue BOOLEAN NOT NULL DEFAULT true,
    remind_streak BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(user_id, endpoint)
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    data JSONB,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 19. AUTOMATED PROFILES PROVISIONING FUNCTION
CREATE OR REPLACE FUNCTION public.provision_founder_profiles(target_account_id UUID)
RETURNS VOID AS $$
DECLARE
    workspace_id UUID;
    khanishk_id UUID;
    akshaya_id UUID;
    proj_id UUID;
BEGIN
    -- 1. Ensure Workspace
    SELECT id INTO workspace_id FROM public.workspaces LIMIT 1;
    IF workspace_id IS NULL THEN
        INSERT INTO public.workspaces (name, member_limit)
        VALUES ('ROBO MATES Private Workspace', 2)
        RETURNING id INTO workspace_id;
    END IF;

    -- 2. Upsert Khanishk Profile
    SELECT id INTO khanishk_id FROM public.profiles WHERE account_id = target_account_id AND slug = 'khanishk';
    IF khanishk_id IS NULL THEN
        INSERT INTO public.profiles (
            account_id, slug, display_name, persona, specialization, theme_mode,
            daily_study_hours, study_start_time, journey_start_date, journey_target_date
        ) VALUES (
            target_account_id, 'khanishk', 'Khanishk', 'boy', 'Robotics Systems Engineer', 'dark',
            5.0, '09:00', '2026-11-08', '2027-11-07'
        ) RETURNING id INTO khanishk_id;
    END IF;

    -- 3. Upsert Akshaya Profile
    SELECT id INTO akshaya_id FROM public.profiles WHERE account_id = target_account_id AND slug = 'akshaya';
    IF akshaya_id IS NULL THEN
        INSERT INTO public.profiles (
            account_id, slug, display_name, persona, specialization, theme_mode,
            daily_study_hours, study_start_time, journey_start_date, journey_target_date
        ) VALUES (
            target_account_id, 'akshaya', 'Akshaya', 'girl', 'Industrial & Robotics Product Designer', 'light',
            2.75, '10:00', '2026-11-08', '2027-11-07'
        ) RETURNING id INTO akshaya_id;
    END IF;

    -- 4. Workspace Memberships
    INSERT INTO public.workspace_members (workspace_id, profile_id, role)
    VALUES (workspace_id, khanishk_id, 'owner')
    ON CONFLICT (workspace_id, profile_id) DO NOTHING;

    INSERT INTO public.workspace_members (workspace_id, profile_id, role)
    VALUES (workspace_id, akshaya_id, 'member')
    ON CONFLICT (workspace_id, profile_id) DO NOTHING;

    -- 5. Ensure Shared AMR Project
    SELECT id INTO proj_id FROM public.projects WHERE workspace_id = workspace_id LIMIT 1;
    IF proj_id IS NULL THEN
        INSERT INTO public.projects (workspace_id, title, description, start_date, target_date)
        VALUES (workspace_id, 'ROBO MATES AMR — Autonomous Mobile Robot', 'Shared long-term capstone: design, simulate, construct, test, and demonstrate an autonomous mobile robot.', '2026-11-08', '2027-11-07')
        RETURNING id INTO proj_id;

        -- Seed 6 Capstone Stages
        INSERT INTO public.project_milestones (project_id, stage_number, title, description, target_date, khanishk_deliverable, akshaya_deliverable, shared_deliverable)
        VALUES 
        (proj_id, 1, 'Stage 1: Requirements and Concept', 'Months 1-2. Foundations and system specification.', '2027-01-08', 'Hardware & compute requirements, differential-drive kinematics.', 'Ergonomic proportions, moodboards, initial concept sketches.', 'Product Requirements Document & System Architecture Proposal'),
        (proj_id, 2, 'Stage 2: Foundational Hardware and Design', 'Months 3-4. Motor drive and CAD chassis.', '2027-03-08', 'Motor control circuits, wheel encoders, differential base test.', 'CAD chassis models, fastener selection, component packaging.', 'Functional motorized prototype and CAD assembly'),
        (proj_id, 3, 'Stage 3: Simulation Environment', 'Months 5-6. ROS 2 and Gazebo model.', '2027-05-08', 'ROS 2 nodes, URDF/Xacro robot description, Gazebo world.', 'Refined exterior form, sensor placement aesthetics, CAD export.', 'Simulated differential robot navigating in Gazebo simulation'),
        (proj_id, 4, 'Stage 4: Autonomous Navigation & HRI', 'Months 7-9. Nav2, SLAM, Vision & Interface.', '2027-08-08', 'Nav2 costmaps, 2D LiDAR SLAM, camera object perception.', 'Physical enclosure refinement, Figma tablet control interface.', 'Simulated robot navigating an indoor environment with UI control'),
        (proj_id, 5, 'Stage 5: Physical Robot Integration', 'Months 10-11. Embedded hardware and chassis assembly.', '2027-10-08', 'Power distribution, embedded controller wiring, real-world Nav2.', '3D printed / sheet metal body, maintenance access panels.', 'Physical indoor autonomous mobile robot prototype'),
        (proj_id, 6, 'Stage 6: Final Demonstration & Capstone', 'Month 12. Public launch, portfolio & capstone review.', '2027-11-07', 'Engineering docs, GitHub repository, demonstration video.', 'Product renderings, design case study, technical report.', 'Complete Capstone Demonstration, Published Portfolios & CVs');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 20. AUTH TRIGGER (Auto-provisions both profiles on single-account signup)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.provision_founder_profiles(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 21. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view & manage profiles belonging to their account
DROP POLICY IF EXISTS "Account profiles access" ON public.profiles;
CREATE POLICY "Account profiles access" ON public.profiles FOR ALL TO authenticated
USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());

-- Allow all authenticated users to read curriculum months
DROP POLICY IF EXISTS "Curriculum months viewable" ON public.roadmap_months;
CREATE POLICY "Curriculum months viewable" ON public.roadmap_months FOR SELECT TO authenticated
USING (true);

-- Roadmap modules access
DROP POLICY IF EXISTS "Roadmap modules access" ON public.roadmap_modules;
CREATE POLICY "Roadmap modules access" ON public.roadmap_modules FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Tasks & Occurrences access
DROP POLICY IF EXISTS "Study tasks access" ON public.study_tasks;
CREATE POLICY "Study tasks access" ON public.study_tasks FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Task occurrences access" ON public.task_occurrences;
CREATE POLICY "Task occurrences access" ON public.task_occurrences FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Daily checkins & sessions
DROP POLICY IF EXISTS "Checkins access" ON public.daily_checkins;
CREATE POLICY "Checkins access" ON public.daily_checkins FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Sessions access" ON public.study_sessions;
CREATE POLICY "Sessions access" ON public.study_sessions FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Shared project access
DROP POLICY IF EXISTS "Projects access" ON public.projects;
CREATE POLICY "Projects access" ON public.projects FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Milestones access" ON public.project_milestones;
CREATE POLICY "Milestones access" ON public.project_milestones FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Project tasks access" ON public.project_tasks;
CREATE POLICY "Project tasks access" ON public.project_tasks FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Project notes access" ON public.project_notes;
CREATE POLICY "Project notes access" ON public.project_notes FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Resources
DROP POLICY IF EXISTS "Study resources access" ON public.study_resources;
CREATE POLICY "Study resources access" ON public.study_resources FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- AI conversations & messages
DROP POLICY IF EXISTS "AI conversations access" ON public.ai_conversations;
CREATE POLICY "AI conversations access" ON public.ai_conversations FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "AI messages access" ON public.ai_messages;
CREATE POLICY "AI messages access" ON public.ai_messages FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Assessments
DROP POLICY IF EXISTS "Assessments access" ON public.assessments;
CREATE POLICY "Assessments access" ON public.assessments FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Assessment results access" ON public.assessment_results;
CREATE POLICY "Assessment results access" ON public.assessment_results FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Notifications
DROP POLICY IF EXISTS "Notifications access" ON public.notifications;
CREATE POLICY "Notifications access" ON public.notifications FOR ALL TO authenticated
USING (true) WITH CHECK (true);
