---
name: mentorscroll
description: >-
  Routes MentorScroll educational reel requests to either the 3D Mixamo/Three.js
  pipeline or the 2D Kenney/SVG pipeline, then produces MP4/WebM. Use when the
  user asks to create a reel, educational video, MentorScroll content, or when
  choosing between 2D flat illustrations and 3D characters.
---

# MentorScroll Video Skills (Router)

## Choose a pipeline

| User intent | Skill to follow |
|-------------|-----------------|
| 3D character, Mixamo, The Boss / Xbot, FBX animations | [mentorscroll-3d](mentorscroll-3d/SKILL.md) |
| 2D flat illustrations, Kenney sprites, SVG diagrams/callouts, synced VO | [mentorscroll-2d](mentorscroll-2d/SKILL.md) |
| Unspecified | Ask once: **2D** or **3D**? Default to **2D** for diagrams/formulas; **3D** for character-performance hooks |

## Shared outputs

- Portrait **1080×1920**, 30–60s (default 45)
- Render via Playwright + FFmpeg → `outputs/`
- Always brainstorm **3 hook options** and **write a plan** before locking (unless user already locked one)
- **2D:** each option picks a distinct **UI recipe** (stage/header/callout/caption) so reels don't reuse the same chrome — see [mentorscroll-2d](mentorscroll-2d/SKILL.md)

## Quick pointers

- **3D project:** `mentorscroll-reel/` + `mixamo/`
- **2D project:** `mentorscroll-reel-2d/` + `kenney/` + `plans/`
- **Kenney packs:** `node kenney_downloader/downloadPacks.mjs`
- **Freepik:** optional manual files in `assets/freepik/` (2D only)
- **2D audio:** `ELEVENLABS_API_KEY` → voices + TTS(+timestamps) + forced alignment — see [mentorscroll-2d/elevenlabs-audio.md](mentorscroll-2d/elevenlabs-audio.md)
