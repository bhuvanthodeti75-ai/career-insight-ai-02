-- Create enum for career application status
CREATE TYPE public.application_status AS ENUM ('draft', 'submitted', 'analyzed');

-- Create enum for work preference
CREATE TYPE public.work_preference AS ENUM ('technical', 'analytical', 'creative', 'people_oriented');

-- Create enum for work style
CREATE TYPE public.work_style AS ENUM ('individual', 'team_based');

-- Create enum for work environment
CREATE TYPE public.work_environment AS ENUM ('startup', 'corporate', 'flexible_hybrid');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create career_applications table (one per user)
CREATE TABLE public.career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status application_status DEFAULT 'draft' NOT NULL,
    
    -- Personal Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER NOT NULL,
    current_city TEXT NOT NULL,
    
    -- Educational Background
    highest_qualification TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    current_status TEXT NOT NULL,
    graduation_year TEXT NOT NULL,
    
    -- Skills & Exposure
    technical_skills TEXT[] DEFAULT '{}',
    soft_skills TEXT[] DEFAULT '{}',
    tools_technologies TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    
    -- Interests & Inclinations
    subjects_enjoyed TEXT[] DEFAULT '{}',
    areas_of_interest TEXT[] DEFAULT '{}',
    work_preference work_preference,
    work_style work_style,
    
    -- Personality & Work Values
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    work_environment work_environment,
    problem_solving_preference TEXT,
    
    -- Career Intent & Vision
    long_term_goal TEXT,
    industries_of_interest TEXT[] DEFAULT '{}',
    willing_to_learn BOOLEAN DEFAULT true,
    
    -- Customization
    salary_expectation INTEGER DEFAULT 0,
    plan_duration_days INTEGER DEFAULT 30,
    
    -- AI Analysis Results
    career_mirror_summary TEXT,
    career_recommendations JSONB,
    daily_plan JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create daily_progress table
CREATE TABLE public.daily_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    application_id UUID REFERENCES public.career_applications(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    reflection_answer TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    UNIQUE(application_id, day_number)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Career Applications RLS policies
CREATE POLICY "Users can view own application"
    ON public.career_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application"
    ON public.career_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own application"
    ON public.career_applications FOR UPDATE
    USING (auth.uid() = user_id);

-- Daily Progress RLS policies
CREATE POLICY "Users can view own progress"
    ON public.daily_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
    ON public.daily_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON public.daily_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_applications_updated_at
    BEFORE UPDATE ON public.career_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();