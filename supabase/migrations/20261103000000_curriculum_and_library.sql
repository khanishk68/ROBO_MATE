-- supabase/migrations/20261103000000_curriculum_and_library.sql
-- =============================================================================
-- ROBO MATES: Daily Checklist Progress, Study Library & Document Storage Migration
-- =============================================================================

-- 1. Daily Checklist Progress Table
CREATE TABLE IF NOT EXISTS public.daily_checklist_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 365),
    item_id TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(profile_id, day_number, item_id)
);

CREATE INDEX IF NOT EXISTS idx_checklist_profile_day 
    ON public.daily_checklist_progress(profile_id, day_number);

CREATE INDEX IF NOT EXISTS idx_checklist_completion 
    ON public.daily_checklist_progress(profile_id, is_completed);

-- 2. Uploaded Documents (Study Library)
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    month_number INTEGER NOT NULL DEFAULT 1,
    subject TEXT NOT NULL DEFAULT 'Robotics Engineering Foundation',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_docs_profile_month 
    ON public.uploaded_documents(profile_id, month_number);

-- 3. Row Level Security
ALTER TABLE public.daily_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Checklist policies (shared account members can access workspace profiles)
DROP POLICY IF EXISTS "Authenticated users can view checklist progress" ON public.daily_checklist_progress;
CREATE POLICY "Authenticated users can view checklist progress"
    ON public.daily_checklist_progress FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert/update checklist progress" ON public.daily_checklist_progress;
CREATE POLICY "Authenticated users can insert/update checklist progress"
    ON public.daily_checklist_progress FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Uploaded documents policies
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.uploaded_documents;
CREATE POLICY "Authenticated users can view documents"
    ON public.uploaded_documents FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage documents" ON public.uploaded_documents;
CREATE POLICY "Authenticated users can manage documents"
    ON public.uploaded_documents FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Supabase Storage bucket setup (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage object policies for study-materials bucket
DROP POLICY IF EXISTS "Authenticated users can view study materials" ON storage.objects;
CREATE POLICY "Authenticated users can view study materials"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'study-materials');

DROP POLICY IF EXISTS "Authenticated users can upload study materials" ON storage.objects;
CREATE POLICY "Authenticated users can upload study materials"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'study-materials');

DROP POLICY IF EXISTS "Authenticated users can update study materials" ON storage.objects;
CREATE POLICY "Authenticated users can update study materials"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'study-materials');

DROP POLICY IF EXISTS "Authenticated users can delete study materials" ON storage.objects;
CREATE POLICY "Authenticated users can delete study materials"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'study-materials');

