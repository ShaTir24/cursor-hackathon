# Web smoke checklist

## Docker Compose
- [ ] `cp docker-compose.env.example docker-compose.env` filled with Supabase URL, anon key
- [ ] Migration `002_role_onboarding.sql` applied
- [ ] Email confirmation off (or user confirmed)
- [ ] Supabase Site URL = `http://localhost:3001` (not `:3000`); Redirect URL includes `/auth/callback`
- [ ] `docker compose --env-file docker-compose.env up --build`
- [ ] `GET http://localhost:3000/health` → ok
- [ ] Open `http://localhost:3001/login`
- [ ] Sign up / sign in → `/role` → onboarding chips (keyboard + `aria-pressed`) → `/home`
- [ ] **Student home:** Learn eyebrow, topics/interests, Generate learning reel, recent list
- [ ] **Teacher home:** Teach eyebrow, subjects/grades, Generate class demo, lesson pack note
- [ ] Generate → player shows Progress + status; HLS attaches; teacher Lesson pack Sheet (retry on error)
- [ ] Failed generation shows Alert; poll stops on ready/failed

## Dev (no Docker)
- [ ] `backend` with `SUPABASE_URL` (JWKS) + `AUTH_DEV_BYPASS=false`
- [ ] `web` `.env.local` with `NEXT_PUBLIC_*`
- [ ] Same happy path in browser

## Notes
- Canonical UI is Next.js under `web/` (Compose services: `api` + `web` only).
- Curl / API-only checks: `e2e/SANITY.md`.
