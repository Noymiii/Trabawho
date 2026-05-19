CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE worker_availability AS ENUM ('available', 'busy', 'offline');
CREATE TYPE job_status AS ENUM ('open', 'matched', 'completed', 'cancelled');
CREATE TYPE swipe_direction AS ENUM ('left', 'right');
CREATE TYPE match_status AS ENUM ('matched', 'completed', 'cancelled');

CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fullname TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'worker',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.worker_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills JSONB DEFAULT '[]'::JSONB,
  bio TEXT,
  experience TEXT,
  location TEXT,
  availability worker_availability DEFAULT 'available',
  contact_info TEXT,
  CONSTRAINT worker_profiles_user_id_key UNIQUE (user_id)
);

CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  skill_required TEXT,
  budget NUMERIC(10, 2),
  location TEXT,
  schedule TEXT,
  status job_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  direction swipe_direction NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  status match_status NOT NULL DEFAULT 'matched',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT matches_worker_job_key UNIQUE (worker_id, job_id)
);

CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, fullname, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'worker'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
