# EduReels API (NestJS)

NestJS service for auth bootstrap, catalogue, onboarding profiles, async HLS video generation, and media serving. Consumed by the Next.js app in [`../web`](../web) (port **3001**).

Root overview: [`../README.md`](../README.md).

## Run

```bash
cd backend
cp .env.example .env
# For local demos without Supabase JWT:
# AUTH_DEV_BYPASS=true

npm install --legacy-peer-deps
npm run start:dev
```

Health: `GET http://localhost:3000/health`

From repo root (with `AUTH_DEV_BYPASS=true` and API up):

```bash
npm run sanity:onboarding
```

## Environment

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Listen port | `3000` |
| `SUPABASE_URL` | JWKS + optional Supabase client | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client (optional) | — |
| `SUPABASE_JWT_SECRET` | HS256 fallback verify | — |
| `AUTH_DEV_BYPASS` | Skip JWT; require `x-user-id` | off |
| `HLS_ROOT` | HLS output directory | `data/hls` |
| `TTS_CACHE_DIR` | TTS cache | `data/tts-cache` |
| `FFMPEG_PATH` | FFmpeg binary | `ffmpeg` / bundled |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` / `ELEVENLABS_MODEL` | TTS | fixtures if unset |
| `TTS_FORCE_FIXTURES` | Force offline TTS | `false` |
| `TTS_DAILY_CHAR_BUDGET` | Char budget | `50000` |
| `EXA_ENABLED` / `EXA_API_KEY` | Research enrichment | optional |

Compose template with web vars: [`../docker-compose.env.example`](../docker-compose.env.example).

## Auth

Global `JwtAuthGuard`:

1. `@Public()` routes skip auth (`/health`, catalogue, media).
2. `AUTH_DEV_BYPASS=true` → header `x-user-id`.
3. Otherwise `Authorization: Bearer <supabase_access_token>` (JWKS, then `SUPABASE_JWT_SECRET`).

No Nest signup/login — clients use Supabase Auth; this API verifies tokens.

## Routes

Prefix: `/api/v1` (except health).

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/health` | Public |
| `POST` | `/api/v1/auth/bootstrap` | JWT / bypass |
| `GET` | `/api/v1/catalogue` | Public |
| `GET` | `/api/v1/profiles/me` | JWT / bypass |
| `PUT` | `/api/v1/profiles/onboarding` | JWT / bypass |
| `POST` | `/api/v1/videos` | JWT / bypass → **202** |
| `GET` | `/api/v1/videos/:id` | JWT / bypass |
| `GET` | `/api/v1/lesson-packs/:id` | JWT / bypass |
| `GET` | `/api/v1/media/:videoId/:file` | Public |

`POST /videos` optional body: `topicId`, `interestId`, `language`, `purpose` (`learn` \| `teach`), `includeLessonPack`. Requires completed onboarding.

## Generation pipeline

`POST /videos` starts an async job:

1. Optional Exa research
2. Scene drafts (student vs teacher)
3. TTS (ElevenLabs or fixtures) with cache
4. FFmpeg HLS pack (EVENT → VOD playlist)
5. Finalize timeline; serve under `/api/v1/media/...`

Artifacts: `$HLS_ROOT/{videoId}/`. Teacher jobs may also create an in-memory lesson pack.

**Note:** Profiles, catalogue, videos, and lesson packs are **in-memory** `Map` stores in the current process. SQL migrations under `migrations/` describe the intended Supabase schema.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Dev server (`ts-node-dev`) |
| `npm run build` / `npm start` | Compile + `node dist/main.js` |
| `npm test` | Jest unit specs |
| `npx ts-node scripts/sanity-onboarding.ts` | HTTP onboarding → video smoke |
| `npx ts-node scripts/smoke-hls.ts` | Fixture HLS pack smoke |

## Docker

Root [`../Dockerfile`](../Dockerfile) builds this service (`EXPOSE 3000`, volume `/data`). Compose service: `api` in [`../docker-compose.yml`](../docker-compose.yml).
