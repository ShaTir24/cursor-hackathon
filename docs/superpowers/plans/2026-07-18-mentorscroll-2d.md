# MentorScroll 2D Implementation Plan

> **For agentic workers:** Implement task-by-task; verify each deliverable before moving on.  
> **Spec:** `docs/superpowers/specs/2026-07-18-mentorscroll-2d-design.md`

## File map

| Path | Responsibility |
|------|----------------|
| `.cursor/skills/SKILL.md` | Router: 3D Mixamo vs 2D Kenney |
| `.cursor/skills/mentorscroll-2d/SKILL.md` | 2D skill workflow |
| `kenney_downloader/downloadPacks.mjs` | Fetch Kenney CC0 zips → `kenney/assets/` |
| `mentorscroll-reel-2d/` | Scene + Playwright render |
| `outputs/` | Final MP4/WebM |

## Tasks

### Task 1: Skills
- Write `mentorscroll-2d/SKILL.md`
- Rewrite root skill as router + keep 3D details

### Task 2: Kenney downloader + packs
- Script downloads game-icons (and/or shape pack)
- Inventory JSON listing useful sprites

### Task 3: 2D reel project
- `public/index.html`, `src/scene.js`, CSS
- Newton 5-beat SVG diagrams + Kenney accents
- `scripts/render.mjs`, `scripts/smoke.mjs`

### Task 4: Render Newton MP4
- Smoke → full render → clean frames
