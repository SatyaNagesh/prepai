-- PrepAI Database Schema
-- Run this in Supabase SQL Editor

-- Users table (managed by Supabase Auth, but we add a view)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  college TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  plan TEXT DEFAULT 'free'
);

-- Interview sessions
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  ai_score INTEGER,
  ai_feedback TEXT,
  improved_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can read own sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, college, year)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'college',
    (NEW.raw_user_meta_data->>'year')::INTEGER
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
