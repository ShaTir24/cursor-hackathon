# EduReels

EduReels turns a learner’s **age group**, **topics**, and **entertainment interests** into short, personalized learning reels (~30s). Students discover concept micro-videos; teachers generate class demos with optional lesson packs. Canonical product UI is the Next.js app under `web/`.

| | |
|---|---|
| **Working name** | EduReels |
| **Primary user** | Student (learner) |
| **Secondary user** | Teacher (content creator) |
| **Core format** | Vertical short learning video |
| **Stack** | Next.js 15 · NestJS · Supabase Auth · FFmpeg HLS · ElevenLabs TTS |

Product requirements: [`specs/prd.md`](specs/prd.md) · Onboarding contract: [`specs/onboarding.md`](specs/onboarding.md)

---

## Repository layout

| Path | Role |
|------|------|
| [`web/`](web/) | Next.js App Router UI (port **3001**) |
| [`backend/`](backend/) | NestJS API + async HLS generation (port **3000**) |
| [`mentorscroll-reel/`](mentorscroll-reel/) | Offline **3D** reel pipeline (Three.js + Mixamo) |
| [`mentorscroll-reel-2d/`](mentorscroll-reel-2d/) | Offline **2D** reel pipeline (Kenney + SVG) |
| [`kenney/`](kenney/), [`kenney_downloader/`](kenney_downloader/) | 2D CC0 sprite packs + downloader |
| [`mixamo/`](mixamo/), [`mixamo_anims_downloader/`](mixamo_anims_downloader/) | 3D Mixamo catalogs / anim downloader (git submodule) |
| [`specs/`](specs/) | PRD + frozen onboarding API |
| [`e2e/WEB_SMOKE.md`](e2e/WEB_SMOKE.md) | Browser smoke checklist |
| [`.cursor/skills/`](.cursor/skills/) | Agent skills for 2D/3D reel production |

---

## Quick start (local)

### Prerequisites

- Node.js **22+**
- npm
- Optional: Docker + Docker Compose, FFmpeg (bundled/system for API HLS), Supabase project

### 1. Install

```bash
npm install
npm install --prefix backend --legacy-peer-deps
npm install --prefix web
```

### 2. Environment

**API** — copy and fill (see [`docker-compose.env.example`](docker-compose.env.example) for the full set):

```bash
cp docker-compose.env.example docker-compose.env   # Compose
# or for local Nest:
cp backend/.env.example backend/.env
```

**Web:**

```bash
cp web/.env.example web/.env.local
```

Key variables:

| Variable | Where | Purpose |
|----------|--------|---------|
| `SUPABASE_URL` / `SUPABASE_JWT_SECRET` | Nest | JWT verify (JWKS or HS256) |
| `SUPABASE_SERVICE_ROLE_KEY` | Nest | Supabase admin client (optional; profiles are in-memory today) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web | Browser auth |
| `NEXT_PUBLIC_API_BASE` | Web | Nest base URL (default `http://localhost:3000`) |
| `AUTH_DEV_BYPASS` + `NEXT_PUBLIC_AUTH_DEV_BYPASS` | Both | Local demos without Supabase (`x-user-id`) |
| `ELEVENLABS_API_KEY` / `TTS_FORCE_FIXTURES` | Nest | Real TTS vs fixture audio |
| `HLS_ROOT` / `TTS_CACHE_DIR` | Nest | Media artifact dirs |

### 3. Run API + web

```bash
# from repo root — Nest :3000 + Next :3001
npm run dev
```

Or separately:

```bash
npm run backend   # http://localhost:3000/health
npm run web       # http://localhost:3001
```

### Dev auth bypass (no Supabase)

```bash
# backend/.env
AUTH_DEV_BYPASS=true

# web/.env.local
NEXT_PUBLIC_AUTH_DEV_BYPASS=true
```

Then any email/password on `/login` works. API calls send `x-user-id` instead of a Bearer JWT.

### API-only sanity

With Nest running and `AUTH_DEV_BYPASS=true`:

```bash
npm run sanity:onboarding
```

---

## Docker Compose

```bash
cp docker-compose.env.example docker-compose.env
# fill Supabase + NEXT_PUBLIC_* values

docker compose --env-file docker-compose.env up --build
```

| Service | URL |
|---------|-----|
| API | http://localhost:3000 (`GET /health`) |
| Web | http://localhost:3001 |

Root [`Dockerfile`](Dockerfile) builds the **API** image only. Web uses [`web/Dockerfile`](web/Dockerfile). Full smoke steps: [`e2e/WEB_SMOKE.md`](e2e/WEB_SMOKE.md).

Deploy sketch for the API: [`render.yaml`](render.yaml).

---

## Product flow

```text
/login → bootstrap profile → /role (student | teacher)
  → /onboarding → /home
  → Generate reel → /player/:id (HLS + progress)
```

| Persona | Home CTA | Generation |
|---------|----------|------------|
| **Student** | Generate learning reel | Profile topics/interests → HLS reel |
| **Teacher** | Generate class demo | Same pipeline + optional **lesson pack** (objectives, talking points, quiz) |

Onboarding fields and frozen routes: [`specs/onboarding.md`](specs/onboarding.md).

---

## API overview

Base path: `/api/v1` (except `GET /health`).

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `GET` | `/health` | Public | Liveness |
| `POST` | `/api/v1/auth/bootstrap` | JWT / bypass | Create or return profile |
| `GET` | `/api/v1/catalogue` | Public | Topics + interests |
| `GET` | `/api/v1/profiles/me` | JWT / bypass | Current profile |
| `PUT` | `/api/v1/profiles/onboarding` | JWT / bypass | Complete student/teacher setup |
| `POST` | `/api/v1/videos` | JWT / bypass | **202** — start async generation |
| `GET` | `/api/v1/videos/:id` | JWT / bypass | Status + timeline (owner) |
| `GET` | `/api/v1/lesson-packs/:id` | JWT / bypass | Teacher lesson pack (owner) |
| `GET` | `/api/v1/media/:videoId/:file` | Public | HLS `.m3u8` / `.ts` / assets |

**Generation pipeline (Nest):** research (optional Exa) → scene drafts → TTS (ElevenLabs or fixtures) → FFmpeg HLS pack → pollable status + media URLs.

**Runtime storage today:** profiles, catalogue, videos, and lesson packs are **in-memory** in the Nest process. SQL under `backend/migrations/` documents the intended Supabase schema (apply manually if you wire persistence).

More detail: [`backend/README.md`](backend/README.md).

---

## Web app

- Next.js 15 App Router, shadcn/ui, Fraunces + Source Sans 3
- Dual persona via chrome/copy (shared palette) — see [`web/design-system/MASTER.md`](web/design-system/MASTER.md)
- HLS playback via `hls.js` on `/player/[id]`
- Recent videos cached in `localStorage` (`edureels:recent:{userId}`)

```bash
cd web && cp .env.example .env.local && npm install && npm run dev
```

Details: [`web/README.md`](web/README.md).

---

## MentorScroll offline reel pipelines

Separate from the Nest HLS path: agent-driven **portrait 1080×1920** renders via Playwright + FFmpeg into gitignored `outputs/`.

| Pipeline | Project | Assets | When to use |
|----------|---------|--------|-------------|
| **2D** | `mentorscroll-reel-2d/` | Kenney + SVG | Diagrams, formulas, flat illustrations |
| **3D** | `mentorscroll-reel/` | Mixamo FBX | Character performance hooks |

Router skill: [`.cursor/skills/SKILL.md`](.cursor/skills/SKILL.md).

### 2D quick commands

```bash
cd mentorscroll-reel-2d
npm install
npm run download-kenney   # once
npm run build-video       # sync-assets + render → ../outputs/
```

Optional VO: `ELEVENLABS_API_KEY` in root `.env` — see [`.cursor/skills/mentorscroll-2d/elevenlabs-audio.md`](.cursor/skills/mentorscroll-2d/elevenlabs-audio.md).

### 3D quick commands

```bash
cd mentorscroll-reel
npm install
# Mixamo downloader is a git submodule — init if needed:
# git submodule update --init mixamo_anims_downloader
npm run render            # → ../outputs/
```

Sample uploaded outputs layout: [`s3-outputs.md`](s3-outputs.md).

---

## Tests & verification

```bash
npm run test:backend          # Jest unit specs (HLS, TTS, pipeline)
npm run sanity:onboarding     # HTTP bootstrap → onboarding → video
```

Browser checklist: [`e2e/WEB_SMOKE.md`](e2e/WEB_SMOKE.md).

---

## Documentation index

| Doc | Description |
|-----|-------------|
| [`specs/prd.md`](specs/prd.md) | Product requirements |
| [`specs/onboarding.md`](specs/onboarding.md) | Role onboarding + frozen API |
| [`backend/README.md`](backend/README.md) | Nest API runbook |
| [`web/README.md`](web/README.md) | Next.js frontend |
| [`e2e/WEB_SMOKE.md`](e2e/WEB_SMOKE.md) | Compose / local smoke |
| [`web/design-system/MASTER.md`](web/design-system/MASTER.md) | Brand & UI tokens |
| [`.cursor/skills/SKILL.md`](.cursor/skills/SKILL.md) | 2D vs 3D reel router |
| [`docs/superpowers/specs/2026-07-18-mentorscroll-2d-design.md`](docs/superpowers/specs/2026-07-18-mentorscroll-2d-design.md) | 2D design notes |
| [`s3-outputs.md`](s3-outputs.md) | Example S3 output bucket layout |

Plans and ideas under [`docs/`](docs/) are historical / exploratory; prefer `specs/` and the READMEs above for current behavior.
