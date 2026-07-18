# Live Progressive HLS Streaming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Progressive EVENT HLS (slideshow + MP3 → `.ts`) while EduReels generates scenes; player attaches on 202.

**Architecture:** VideoTimeline internal; HlsPackager + PlaylistWriter publish ordered segments; Remotion export-only; Render hosts API+ffmpeg.

**Tech Stack:** NestJS, ffmpeg / ffmpeg-static, ElevenLabs flash, optional Exa, hls.js (web), Docker/Render.

---

### Task 0: Spec + idea
- [x] `docs/ideas/live-hls-streaming.md`
- [x] `specs/live-hls-streaming.md` (BE_FIRST, perk runbook, security)

### Task 1–3: ffmpeg foundation
- [x] `PlaylistWriter` + unit tests (atomic EVENT → ENDLIST)
- [x] `HlsPackagerService` + fixture pack test
- [x] `npm run smoke:hls` / Docker + `ffmpeg-static`

### Task 4–7: Pipeline + API
- [x] `TtsService` cache + fixtures + budget
- [x] `ResearchService` (Exa optional)
- [x] `PipelineService` ordered publish
- [x] `POST /api/v1/videos` 202 + `GET` + `/media/:videoId/:file` + `/health`

### Task 8–10: Player + Render
- [x] `HlsPlayer.web.tsx` (hls.js EVENT)
- [x] `HlsPlayer.tsx` + `startLivePlayback` (attach on 202)
- [x] `Dockerfile` + `render.yaml` with `/data` disk

### Task 11–13: Harden
- [x] Path traversal tests + auth headers on video routes
- [x] Credit runbook in spec
- [x] Updated `video-pipeline-and-verify.mdc` Playwright HLS steps
