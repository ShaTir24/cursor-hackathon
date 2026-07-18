-- Role onboarding + catalogue + videos + lesson_packs (Supabase Postgres)
-- Apply via supabase db or SQL editor. RLS enabled; indexes on FKs.

-- Catalogue
CREATE TABLE IF NOT EXISTS catalogue_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS catalogue_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

-- Profiles (1:1 auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('student', 'teacher')),
  display_name TEXT,
  age_group TEXT CHECK (age_group IS NULL OR age_group IN ('8-10', '11-13', '14-16', '17-18')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_topics (
  user_id UUID NOT NULL REFERENCES profiles (user_id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES catalogue_topics (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, topic_id)
);
CREATE INDEX IF NOT EXISTS profile_topics_topic_id_idx ON profile_topics (topic_id);

CREATE TABLE IF NOT EXISTS profile_interests (
  user_id UUID NOT NULL REFERENCES profiles (user_id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES catalogue_interests (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, interest_id)
);
CREATE INDEX IF NOT EXISTS profile_interests_interest_id_idx ON profile_interests (interest_id);

CREATE TABLE IF NOT EXISTS teacher_subjects (
  user_id UUID NOT NULL REFERENCES profiles (user_id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES catalogue_topics (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS teacher_grade_bands (
  user_id UUID NOT NULL REFERENCES profiles (user_id) ON DELETE CASCADE,
  grade_band TEXT NOT NULL CHECK (grade_band IN ('8-10', '11-13', '14-16', '17-18')),
  PRIMARY KEY (user_id, grade_band)
);

-- Videos (persist HLS)
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles (user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'ready', 'failed')),
  hls_path TEXT NOT NULL,
  playlist_type TEXT NOT NULL CHECK (playlist_type IN ('EVENT', 'VOD')),
  scenes_ready INT NOT NULL DEFAULT 0,
  scenes_total INT NULL,
  purpose TEXT NOT NULL DEFAULT 'learn' CHECK (purpose IN ('learn', 'teach')),
  topic_id UUID REFERENCES catalogue_topics (id),
  interest_id UUID REFERENCES catalogue_interests (id),
  error TEXT NULL,
  timeline_json JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS videos_user_id_idx ON videos (user_id);

CREATE TABLE IF NOT EXISTS lesson_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles (user_id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lesson_packs_user_id_idx ON lesson_packs (user_id);
CREATE INDEX IF NOT EXISTS lesson_packs_video_id_idx ON lesson_packs (video_id);

-- Seed catalogue
INSERT INTO catalogue_topics (slug, label) VALUES
  ('photosynthesis', 'Photosynthesis'),
  ('fractions', 'Fractions'),
  ('gravity', 'Gravity'),
  ('water-cycle', 'Water Cycle'),
  ('democracy', 'Democracy')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO catalogue_interests (slug, label) VALUES
  ('cricket', 'Cricket'),
  ('gaming', 'Gaming'),
  ('cooking', 'Cooking'),
  ('space', 'Space'),
  ('music', 'Music')
ON CONFLICT (slug) DO NOTHING;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_grade_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogue_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogue_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY profiles_insert_own ON profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY profile_topics_own ON profile_topics FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY profile_interests_own ON profile_interests FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY teacher_subjects_own ON teacher_subjects FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY teacher_grade_bands_own ON teacher_grade_bands FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY videos_own ON videos FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY lesson_packs_own ON lesson_packs FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY catalogue_topics_read ON catalogue_topics FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY catalogue_interests_read ON catalogue_interests FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON catalogue_topics, catalogue_interests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles, profile_topics, profile_interests,
  teacher_subjects, teacher_grade_bands, videos, lesson_packs TO authenticated;
