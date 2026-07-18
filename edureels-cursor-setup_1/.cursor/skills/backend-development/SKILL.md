---
name: backend-development
description: Implement NestJS modules, Supabase migrations, and the video generation pipeline from the spec's frozen contract. Stage 3 of the workflow. Works with .cursor/rules/nestjs-backend.mdc.
---

# Backend Development (Stage 3)

## Order of work
1. Migration first: write + apply the spec's DB delta; verify against Supabase locally.
2. DTOs verbatim from the spec contract (class-validator decorators = spec validation column).
3. Module skeleton: controller (thin) → service → repository. Wire into app.module.ts
   (append-only — do not reorder existing imports).
4. Implement service logic. 5. Unit test happy path. 6. Curl smoke test every endpoint;
   paste the curl transcript into the PR description.

## Domain-specific patterns
- **Auth**: Supabase Auth issues JWTs; a NestJS guard verifies them. User id ALWAYS
  from token claims, never request body. Guard is global; `@Public()` decorator opts out
  (auth routes only).
- **Analytics**: pure SQL aggregates over watch_events —
  total/topic time: SUM(seconds_watched) GROUP BY topic_id;
  peak hours: GROUP BY date_trunc('hour', created_at) ORDER BY sum DESC;
  most-watched topic: same query LIMIT 1. One `/analytics/summary` endpoint returns all
  widgets in one response — the FE never aggregates.
- **Generation pipeline** (async): POST /videos inserts row status='processing',
  fire-and-forget the pipeline, return {id, status}. Pipeline: scene template for
  (topic, interest, ageGroup) → per-scene TtsService.getOrSynthesize → measure mp3
  duration (music-metadata) → assemble VideoTimeline → status='ready'. Client polls
  GET /videos/:id. Any scene failure → status='failed' with a reason; never half-ready.
- **TtsService**: cache table keyed sha256(text+voiceId+model); disk files under
  /data/tts; fixtures when NODE_ENV=test|dev-offline; enforce TTS_DAILY_CHAR_BUDGET
  before real calls. This is the only file allowed to import the ElevenLabs client.

## Definition of done
Boots clean; endpoints match spec byte-for-byte (method, path, DTO, errors);
migration reversible; unit tests pass; curl transcript captured.
