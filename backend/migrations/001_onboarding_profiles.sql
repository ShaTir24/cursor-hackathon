-- Onboarding profile fields (Supabase Postgres)
-- Up
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS persona text
    CHECK (persona IS NULL OR persona IN ('student', 'tutor')),
  ADD COLUMN IF NOT EXISTS age_group_id text,
  ADD COLUMN IF NOT EXISTS teaching_age_group_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS topic_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS theme_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY,
  persona text CHECK (persona IS NULL OR persona IN ('student', 'tutor')),
  age_group_id text,
  teaching_age_group_ids text[] NOT NULL DEFAULT '{}',
  topic_ids text[] NOT NULL DEFAULT '{}',
  theme_ids text[] NOT NULL DEFAULT '{}',
  display_name text,
  onboarding_complete boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Down
-- ALTER TABLE profiles DROP COLUMN IF EXISTS persona;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS age_group_id;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS teaching_age_group_ids;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS topic_ids;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS theme_ids;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS display_name;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS onboarding_complete;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS updated_at;
