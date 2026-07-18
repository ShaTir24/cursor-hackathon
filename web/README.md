# EduReels Web

Next.js 15 App Router frontend (shadcn/ui) for EduReels. Talks to the Nest API at `NEXT_PUBLIC_API_BASE` (default `http://localhost:3000`).

Root overview: [`../README.md`](../README.md) · Design tokens: [`design-system/MASTER.md`](design-system/MASTER.md).

## Run

```bash
cd web
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3001
```

From repo root (API + web):

```bash
npm run dev
```

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE` | Nest base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_AUTH_DEV_BYPASS` | Skip Supabase; pair with Nest `AUTH_DEV_BYPASS=true` |

## Routes

| Path | Purpose |
|------|---------|
| `/` | Redirect → `/login` |
| `/login` | Sign in / sign up |
| `/auth/callback` | Supabase PKCE / email confirm |
| `/role` | Student vs teacher picker |
| `/onboarding` | Profile setup (`?role=student\|teacher`) |
| `/home` | Persona-specific home + generate CTA |
| `/player/[id]` | HLS player, generation progress, teacher lesson pack |

## Auth

- Supabase email/password + PKCE (`src/lib/supabase/client.ts`)
- `(app)` layout requires a session (or redirect to `/login`)
- API client (`src/lib/api.ts`) sends `Authorization: Bearer <token>`, or `x-user-id` when `NEXT_PUBLIC_AUTH_DEV_BYPASS=true`

## Dual persona

| | Student | Teacher |
|---|---------|---------|
| Onboarding | Topics (≥2), interests (≥2), age group | Subjects (≥1), grade bands |
| Home CTA | Generate learning reel | Generate class demo (`includeLessonPack`) |
| Player | HLS | HLS + lesson pack sheet |

## Docker

[`Dockerfile`](Dockerfile) multi-stage standalone build (`EXPOSE 3001`). Compose service: `web` in [`../docker-compose.yml`](../docker-compose.yml).

Smoke checklist: [`../e2e/WEB_SMOKE.md`](../e2e/WEB_SMOKE.md).
