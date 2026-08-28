-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Dynamic Telegram Channels Map
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_channel_id BIGINT UNIQUE NOT NULL,
    category_name TEXT NOT NULL, -- 'DSA', 'System Design', 'DBMS', 'Computer Networks'
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Default 4 Channel IDs
INSERT INTO public.channels (telegram_channel_id, category_name, description, icon)
VALUES 
    (-4390749731, 'DSA', 'Data Structures & Algorithms, LeetCode Patterns, Code Starters', 'code-2'),
    (-4329144420, 'System Design', 'Distributed Systems, Microservices, Architecture Blueprints', 'cpu'),
    (-4332462419, 'DBMS', 'Relational Databases, SQL Optimization, Transaction Locks', 'database'),
    (-4308430774, 'Computer Networks', 'TCP/IP, HTTP/3, Packet Traces, Socket Programming', 'network')
ON CONFLICT (telegram_channel_id) DO UPDATE SET 
    category_name = EXCLUDED.category_name,
    description = EXCLUDED.description;

-- 2. Ingested Lecture Videos & Transcripts
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    telegram_file_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    duration_seconds INT DEFAULT 0,
    transcript TEXT,
    quiz_json JSONB DEFAULT '[]'::jsonb,
    thumbnail_url TEXT,
    stream_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fts tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(transcript, ''))) STORED
);

-- 3. Ingested Study Attachments (PDF, Word, ZIP, SQL, etc.)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    telegram_file_id TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'docx', 'zip', 'sql', 'rar', 'txt'
    file_size_bytes BIGINT DEFAULT 0,
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Question Solving Logs (Tracking Velocity & Speed in Mins)
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
    question_type TEXT CHECK (question_type IN ('MCQ', 'CODING')) NOT NULL,
    question_title TEXT,
    time_taken_seconds INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. User Activity & Dedicated Hours Tracker
CREATE TABLE IF NOT EXISTS public.user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('LECTURE', 'QUIZ', 'CODING')) NOT NULL,
    duration_seconds INT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_videos_fts ON public.videos USING gin(fts);
CREATE INDEX IF NOT EXISTS idx_attachments_video ON public.attachments(video_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user ON public.question_attempts(user_id, attempted_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user ON public.user_analytics(user_id, logged_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Security Policies
DROP POLICY IF EXISTS "Allow read channels" ON public.channels;
CREATE POLICY "Allow read channels" ON public.channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read videos" ON public.videos;
CREATE POLICY "Allow read videos" ON public.videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read attachments" ON public.attachments;
CREATE POLICY "Allow read attachments" ON public.attachments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own attempts" ON public.question_attempts;
CREATE POLICY "Users manage own attempts" ON public.question_attempts FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users manage own analytics" ON public.user_analytics;
CREATE POLICY "Users manage own analytics" ON public.user_analytics FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 6. User DSA Progress & Multi-Sheet Tracker
CREATE TABLE IF NOT EXISTS public.user_dsa_progress (
    user_email TEXT PRIMARY KEY,
    user_id TEXT,
    active_sheet TEXT DEFAULT 'sde',
    solved_sde JSONB DEFAULT '[]'::jsonb,
    solved_a2z JSONB DEFAULT '[]'::jsonb,
    solved_79 JSONB DEFAULT '[]'::jsonb,
    solved_blind75 JSONB DEFAULT '[]'::jsonb,
    solved_mik JSONB DEFAULT '[]'::jsonb,
    lld_solved_ids JSONB DEFAULT '[]'::jsonb,
    revision_ids JSONB DEFAULT '[]'::jsonb,
    linked_profiles JSONB DEFAULT '{}'::jsonb,
    active_mins DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. User Billing Transactions & Wallet Ledger
CREATE TABLE IF NOT EXISTS public.billing_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    balance_after DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_dsa_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to user_dsa_progress" ON public.user_dsa_progress;
CREATE POLICY "Allow full access to user_dsa_progress" ON public.user_dsa_progress FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to billing_transactions" ON public.billing_transactions;
CREATE POLICY "Allow full access to billing_transactions" ON public.billing_transactions FOR ALL USING (true) WITH CHECK (true);

