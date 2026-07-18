-- EduReels onboarding profiles (Supabase Postgres)
-- Catalogue remains JSON-seeded; this table stores selected catalogue ids.
-- user_id is text for MVP Bearer-<userId> auth; switch to uuid + auth.users FK later.

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id text PRIMARY KEY,
  persona text CHECK (persona IS NULL OR persona IN ('student', 'tutor')),
  age_group_id text,
  teaching_age_group_ids text[] NOT NULL DEFAULT '{}',
  topic_ids text[] NOT NULL DEFAULT '{}',
  theme_ids text[] NOT NULL DEFAULT '{}',
  display_name text,
  onboarding_complete boolean NOT NULL DEFAULT false,
  onboarding_completed_at timestamptz,
  ui_theme text NOT NULL DEFAULT 'lagoon'
    CHECK (ui_theme IN ('lagoon', 'ink')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_onboarding_complete_idx
  ON public.profiles (onboarding_complete);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Nest uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). No anon policies for MVP.
COMMENT ON TABLE public.profiles IS 'EduReels onboarding + preferences; catalogue ids are not FKs.';

-- Down (manual):
-- DROP TABLE IF EXISTS public.profiles;
