-- videos table for progressive HLS (Supabase / Postgres)
-- Apply when Supabase URL is configured.

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'ready', 'failed')),
  hls_path TEXT NOT NULL,
  playlist_type TEXT NOT NULL CHECK (playlist_type IN ('EVENT', 'VOD')),
  scenes_ready INT NOT NULL DEFAULT 0,
  scenes_total INT NULL,
  error TEXT NULL,
  timeline_json JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS videos_user_id_idx ON videos (user_id);
