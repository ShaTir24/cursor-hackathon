# MentorScroll 2D Reel — Design Spec

**Date:** 2026-07-18  
**Status:** Approved  
**Asset policy:** Kenney CC0 first; Freepik optional manual drop-ins later  
**Stack:** HTML/CSS/SVG + Kenney PNGs + Playwright + FFmpeg (Approach A)

## Goal

Produce scroll-stopping 30–60s vertical (1080×1920) educational reels using **flat 2D illustrations** (Kenney sprites + SVG diagrams/callouts), rendering to MP4/WebM — without Mixamo/Three.js.

## Non-goals

- ElevenLabs/Sora text-to-video
- Freepik API integration (folder reserved only)
- Replacing the existing 3D Mixamo skill (it becomes a router + stays as 3D path)

## Layout

```
.cursor/skills/SKILL.md                 # router: 3D vs 2D
.cursor/skills/mentorscroll-2d/SKILL.md # 2D workflow
mentorscroll-reel-2d/                   # HTML/SVG scene + render
kenney/assets/                          # downloaded CC0 packs
assets/freepik/                         # optional manual PNGs (unused by default)
outputs/                                # mentorscroll2d_{topic}_{ts}.mp4
```

## Scene contract

Browser scene exposes:

- `window.__MS_READY`, `window.__MS_ERROR`
- `window.__MS = { duration, fps, frameAt(t), visualOk() }`

`frameAt(t)` drives beat switches, sprite motion, SVG diagram state, captions. Offline render scrubs deterministically (no realtime-only animation).

## Beat rules

Every beat must include:

1. Caption (lower safe area)
2. At least one **diagram or callout** (SVG or Kenney sprite emphasis)
3. Visible motion (sprite bounce/slide, SVG arrow pulse, progress, etc.)

## First topic

Newton’s three laws — Option 1 storyboard (45s): Hook → Law1 → Law2 → Law3 → Closer.

## Quality bar

Smoke screenshot at ~10%/40%/70%: captions match beat; diagram differs per beat; background is a designed stage (not flat void).
