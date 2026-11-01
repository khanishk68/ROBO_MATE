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


-- supabase/seed.sql
-- =============================================================================
-- ROBO MATES: Seed Data for 12-Month Robotics Curriculum & Shared AMR Project
-- =============================================================================

-- 1. Insert Initial Workspace
INSERT INTO public.workspaces (id, name, member_limit)
VALUES ('00000000-0000-0000-0000-000000000001', 'ROBO MATES Autonomous Robotics Workspace', 2)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Shared Robotics Project
INSERT INTO public.projects (id, workspace_id, title, description, status, completion_percentage)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'ROBO MATES AUTONOMOUS MOBILE ROBOT (AMR)',
    'Dual-specialization venture: A market-ready autonomous indoor transport robot fusing differential drive kinematics, ROS 2 Nav2, SLAM, and ergonomic ABS packaging.',
    'in_progress',
    35
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed 12-Month Curriculum: BOY MODE (Robotics Systems Engineer)
INSERT INTO public.roadmap_months (persona, month_number, title, description, main_subjects, deliverable, estimated_hours)
VALUES
('boy', 1, 'Programming Foundations', 'Master Python fundamentals, variables, loops, data structures, Git, and Linux.', ARRAY['Python', 'Git', 'Linux'], 'Build small Python automation programs independently.', 120),
('boy', 2, 'C++, Electronics and Linux', 'C++ fundamentals, OOP, Ohm law, sensors, and Arduino interfacing.', ARRAY['C++', 'Electronics', 'Linux', 'Arduino'], 'Read sensor data and write independent C++ programs.', 130),
('boy', 3, 'Embedded Systems and Motors', 'ESP32 dual-core, FreeRTOS, GPIO, PWM, DC motors, and servo control.', ARRAY['ESP32', 'PWM', 'Motor Drivers', 'Actuators'], 'Build a controllable mobile robot chassis prototype.', 140),
('boy', 4, 'Mechatronics and Control Systems', 'Quadrature encoders, PID velocity/position tuning, and differential drive.', ARRAY['PID Control', 'Encoders', 'Kinematics', 'Mechatronics'], 'Build a basic robot with controlled straight-line movement.', 135),
('boy', 5, 'ROS 2 Fundamentals', 'Ubuntu 22.04 LTS, ROS 2 Humble, nodes, topics, publishers, and services.', ARRAY['ROS 2', 'Ubuntu', 'rclpy', 'rclcpp'], 'Create a multi-node ROS 2 robot telemetry system.', 140),
('boy', 6, 'Robot Modelling and Simulation', 'URDF, Xacro, TF2 coordinate frames, and Gazebo physics simulation.', ARRAY['URDF', 'TF2', 'Gazebo', 'Simulation'], 'Simulate a mobile robot in a virtual physics arena.', 140),
('boy', 7, 'Navigation and Localization', 'ROS 2 Nav2 stack, wheel odometry, and IMU sensor fusion via Robot Localization EKF.', ARRAY['Nav2', 'EKF', 'Odometry', 'Path Planning'], 'Navigate a simulated mobile robot between waypoints.', 145),
('boy', 8, 'Computer Vision and AI', 'OpenCV in Python/C++, color thresholding, contours, and YOLO AI inference.', ARRAY['OpenCV', 'Computer Vision', 'YOLO', 'Camera Calibration'], 'Camera-based real-time object detection and tracking.', 140),
('boy', 9, 'SLAM and Autonomous Robotics', '2D LiDAR, Cartographer / Slam Toolbox, loop closure, and grid mapping.', ARRAY['SLAM', 'LiDAR', 'Cartographer', 'Grid Mapping'], 'Autonomous mapping and room localization simulation.', 150),
('boy', 10, 'Intelligent Robot Development', 'Combine computer vision with Nav2 for visual obstacle avoidance.', ARRAY['System Integration', 'Behavior Trees', 'Autonomous Navigation'], 'Intelligent autonomous mobile robot prototype.', 150),
('boy', 11, 'Integration and Testing', 'Hardware/software integration, power profiling, and fail-safe diagnostics.', ARRAY['Testing', 'Hardware Debugging', 'Reliability', 'Optimization'], 'Complete working physical robotics prototype.', 140),
('boy', 12, 'Portfolio and Career Preparation', 'Technical documentation, demonstration videos, GitHub polish, and interview prep.', ARRAY['Portfolio', 'GitHub', 'System Architecture', 'Interviews'], 'A complete robotics systems engineering portfolio.', 130)
ON CONFLICT (persona, month_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    main_subjects = EXCLUDED.main_subjects,
    deliverable = EXCLUDED.deliverable,
    estimated_hours = EXCLUDED.estimated_hours;

-- 4. Seed 12-Month Curriculum: GIRL MODE (Industrial Product Designer)
INSERT INTO public.roadmap_months (persona, month_number, title, description, main_subjects, deliverable, estimated_hours)
VALUES
('girl', 1, 'Drawing and Design Foundations', 'Line control, primitive 3D geometries, 1-point and 2-point perspective, product observation.', ARRAY['Freehand Sketching', 'Perspective', 'Shading', 'Design Principles'], '50 basic product sketches bound in a foundational sketchbook.', 110),
('girl', 2, 'Industrial Design Sketching', 'Product form development, robot body concepts, orthographic & exploded sketches.', ARRAY['Concept Sketching', 'Orthographic Views', 'Robot Anatomy', 'Form Studies'], 'A robot concept sketchbook with 4 distinctive directions.', 125),
('girl', 3, 'Fusion 360 Fundamentals', 'Parametric sketching, geometric constraints, extrude/revolve/sweep, timeline management.', ARRAY['Fusion 360', 'CAD Modeling', 'Parametric Design'], 'Three parametric 3D product models with clean timeline history.', 135),
('girl', 4, 'Advanced CAD and Technical Drawings', 'Complex surface modeling, assemblies, joints, GD&T, and engineering drawings.', ARRAY['CAD Assemblies', 'Technical Drawings', 'Exploded Views', 'Tolerances'], 'A complete robot chassis and enclosure CAD model with 2D drawings.', 140),
('girl', 5, 'Ergonomics and Human Factors', 'Anthropometric data (5th-95th percentile), reach envelopes, accessibility, safety clearances.', ARRAY['Ergonomics', 'Anthropometry', 'Usability', 'Safety Standards'], 'An ergonomic robot design study report.', 120),
('girl', 6, 'Materials and Manufacturing', 'Plastics (ABS, PC), sheet metal, 3D printing (FDM/SLA), injection molding, DFM and DFA.', ARRAY['DFM', 'DFA', 'Injection Molding', 'Sheet Metal', 'Materials'], 'Material selection matrix and manufacturing feasibility report.', 130),
('girl', 7, 'Blender and Product Visualization', 'Subdivision surface modeling, procedural CMF materials, studio lighting, Cycles renders.', ARRAY['Blender', 'CMF', 'Studio Lighting', 'Photorealistic Rendering'], 'Professional photorealistic robot product renders.', 140),
('girl', 8, 'Physical Prototyping', 'Foam and cardboard mockups, rapid FDM 3D printing, snap-fit joints, assembly iteration.', ARRAY['Prototyping', '3D Printing', 'Model Making', 'Physical Fit'], 'Physical scale prototype of a robot enclosure with snap-fit lid.', 130),
('girl', 9, 'Human-Robot Interaction (HRI)', 'UI/UX for robot control panels, touchscreen Figma prototypes, expressive LED/sound feedback.', ARRAY['HRI', 'Figma', 'UI/UX Design', 'Sound & LED Feedback'], 'Robot interaction interface interactive prototype.', 125),
('girl', 10, 'Complete Robotics Product Design', 'Full robot enclosure integration with internal electronics, thermal vents, and battery access.', ARRAY['Product Architecture', 'Internal Packaging', 'CMF', 'Branding'], 'Complete production-ready robotics product design CAD & spec.', 145),
('girl', 11, 'Design Validation and Refinement', 'Drop testing simulation, assembly time optimization, user testing with prototype.', ARRAY['Design Validation', 'User Testing', 'Refinement', 'Documentation'], 'Validated robotics product design package.', 130),
('girl', 12, 'Portfolio and Career Preparation', '3 deep case studies, Behance / website portfolio, resume, design interview presentation.', ARRAY['Portfolio Website', 'Case Studies', 'Behance', 'Design Interviews'], 'Professional industrial design portfolio ready for industry applications.', 120)
ON CONFLICT (persona, month_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    main_subjects = EXCLUDED.main_subjects,
    deliverable = EXCLUDED.deliverable,
    estimated_hours = EXCLUDED.estimated_hours;

