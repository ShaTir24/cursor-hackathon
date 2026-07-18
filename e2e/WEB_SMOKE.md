# Web smoke checklist (real auth + craft chrome)

## Docker Compose
- [ ] `cp docker-compose.env.example docker-compose.env` with real Supabase URL + anon key
- [ ] `AUTH_DEV_BYPASS=false` and `NEXT_PUBLIC_AUTH_DEV_BYPASS=false`
- [ ] Supabase Site URL = `http://localhost:3001`; Redirect URL includes `/auth/callback`
- [ ] Prefer Confirm email **off** for demos (or confirm users in Auth → Users)
- [ ] Migration `002_role_onboarding.sql` applied if using Supabase profiles
- [ ] `TTS_FORCE_FIXTURES=true` (zero ElevenLabs credits)
- [ ] `docker compose --env-file docker-compose.env up` (web is **hot-reload** `next dev` — edit `web/` and refresh `:3001`; rebuild only if Dockerfile/deps change)
- [ ] First web start may `npm ci` into the `web_node_modules` volume (one-time / after lockfile change)
- [ ] `GET http://localhost:3000/health` → ok
- [ ] Open `http://localhost:3001/` — brand entry mesh; **Sign in** / **Create account** (`entry-signin`, `entry-signup`)
- [ ] `/login` — Sign in or Create account unchanged (`auth-mode-signin` / `auth-mode-signup`, `auth-email`, `auth-password`, `auth-submit`)
- [ ] After auth → `/role` equal Student/Teacher cards (`role-student`, `role-teacher`) — both fully visible
- [ ] `/onboarding` Stepper (Profile → Focus/Classroom → Review) → `onboarding-submit`
- [ ] `/home` stage Generate (`generate-submit`) + Empty or recent Item list
- [ ] Player cinematic stage + Progress; teacher `lesson-pack-open` Sheet sections
- [ ] Demo HLS: `backend/data/demo-source.mp4` present → Generate packs that MP4 (`HLS_USE_DEMO_MP4=auto`); playlist plays in `hls-player`
- [ ] Optional: `cd backend && npm run pack:demo-hls` → `GET /media/demo/index.m3u8`
- [ ] Favicon / app icon is EduReels mark; shell + entry + empty states use logo
- [ ] Shell: Learn/Teach badge; Sign out → `/login`; unauthenticated `/home` → `/login`

## Production web image (optional)
- [ ] Set compose `web.build.target: runner` and remove `./web` volume mounts, then `docker compose build web`

## Demo MP4 → HLS
- Place file at `backend/data/demo-source.mp4` (gitignored `*.mp4`)
- Compose mounts `./backend/data` → `/app/data` and sets `HLS_USE_DEMO_MP4=auto`
- Restart API after adding the file; Generate uses that MP4 instead of slideshow TTS

## Dev (no Docker)
- [ ] `backend` with `AUTH_DEV_BYPASS=false` + `SUPABASE_URL` (JWKS)
- [ ] `web` `.env.local` with `NEXT_PUBLIC_SUPABASE_*` and `NEXT_PUBLIC_API_BASE`
- [ ] Same happy path with a real registered user

## Notes
- Canonical UI is Next.js under `web/` (Compose: `api` + `web`).
- Auth pages (`auth-form`, `/login`, `/auth/callback`) are frozen during craft chrome.
- Curl / API-only: `e2e/SANITY.md`.
