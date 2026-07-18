---
name: mentorscroll-3d
description: >-
  Builds MentorScroll educational vertical reels with Three.js + Mixamo 3D
  characters, catalog-driven animations, and Playwright+FFmpeg MP4 output. Use
  when the user wants a 3D reel, Mixamo character performance, The Boss/Xbot,
  or FBX-based motion — not flat 2D Kenney/SVG diagrams.
---

# MentorScroll 3D Video Skill

## What This Skill Does
Transforms an educational topic into a scroll-stopping 30-60 second vertical reel using Three.js + Mixamo characters. Generates production-ready code that renders to MP4/WebM.

For **2D Kenney/SVG** reels, use [mentorscroll-2d](../mentorscroll-2d/SKILL.md) instead.

## When to Trigger
- User provides a topic/script idea for MentorScroll
- User says: "create a reel about X", "generate a video for", "make educational content about"
- User wants to iterate on hook/storyboard options
- User needs MP4/WebM output for the platform

## Workflow

### 1. Input Stage
User provides:
- **Topic**: What to teach (e.g., "binary search", "photosynthesis", "calculus limits")
- **Duration**: 30-60 seconds (default 45)
- **Skill Level**: beginner/intermediate/advanced
- Optional: specific script or key points to cover

### 2. AI Brainstorm / Planning Stage (use Mixamo catalog here)
**Before writing storyboards**, load the Mixamo animation name list:
- Prefer `mixamo/animation-names.json` (names only)
- Or `mixamo/animation-catalog.json` (id + name + pack flags)
- Refresh if missing/stale: `node mixamo_anims_downloader/listAnimsNode.mjs` (full catalog ~2484)

Skill generates **3 hook + storyboard options**. Each option must include:
- **Hook Type**: eye-catching opening (question, visual surprise, character gesture)
- **Character Choice**: which Mixamo character fits (The Boss=authoritative, Xbot=calm/logical, Female=energetic, Warrok=dramatic)
- **Animation Sequence**: every beat uses a **real Mixamo name from the catalog** (not invented labels) + text overlays + camera moves
- **Required clips list**: distinct catalog names this option would need (for later download)
- **Visual Strategy**: set design / background, text reveal timing, emphasis colors, transitions
- **Script**: concise educational narration (30-60 sec read time)

Planning rules:
- Pick **standing / explainer-friendly** clips when possible (talk, point, think, wave, celebrate, look-around, stretch). Avoid seated/crouch/combat/zombie unless the topic needs them.
- Prefer clips already in `mixamo/assets/<character>/inventory.json` when they fit; otherwise name new catalog entries to download later.
- Do **not** download FBXs during planning — only select names.

Example brainstorm output:
```
OPTION 1: "The Aha Moment"
- Hook: Character waves, screen flashes "WAIT!"
- Character: The Boss
- Sequence:
  1. Standing Greeting (0-4s) + hook text
  2. Agreeing (4-14s) + concept
  3. Pointing Gesture (14-25s) + key formula
  4. Thinking (25-36s) + twist
  5. Victory Idle (36-45s) + closer
- Required Mixamo clips: Standing Greeting, Agreeing, Pointing Gesture, Thinking, Victory Idle
- Background: topic-appropriate set (not flat color)
- Output: 45sec MP4, portrait 1080x1920
```

### 3. User Picks Option
User selects best hook/storyboard, or requests modifications.
If the user says "create / make / generate the video", pick the strongest option and proceed.

### 4. Download Required Animations (after plan is locked)
Once the chosen storyboard is fixed, download **only** the Mixamo clips that option needs:
1. Read `mixamo/assets/<character>/inventory.json` (what is already on disk).
2. Diff against the option’s **Required Mixamo clips** list.
3. Download missing clips via `mixamo_anims_downloader` + `MIXAMO_ACCESS_TOKEN` in `.env`.
4. Store under both:
   - `mixamo/assets/<character>/animations/<slug>.fbx` (character-scoped)
   - `mixamo/assets/<slug>.fbx` (flat path used by `mentorscroll-reel`)
5. Update that character’s `inventory.json` with the new files / Mixamo names.
6. Map each storyboard beat → local FBX path / scene key before coding.

Do not bulk-download the whole catalog. Only what the selected plan requires.

### 5. Code Generation Stage
Skill generates **production Three.js code** that:
- Loads Mixamo FBX character from `/mixamo/assets/` (or character-scoped copy)
- Loads **the downloaded action FBXs** for the chosen plan (not a hardcoded default set)
- Applies animation sequences with precise timing — **character must visibly act every beat**
- Builds a **proper 3D background/set** (walls, props, lighting) — never a flat solid color alone
- Adds text overlays, captions, visual effects
- Handles camera positioning for vertical framing
- Uses Playwright + FFmpeg pipeline to render MP4/WebM
- Outputs to project `outputs/` (or `/mnt/user-data/outputs/` when available)
- Deletes temporary frame folders after encode

### 6. Quality Check (required before delivering)
Verify from screenshots at ~10%, 40%, 70% of the timeline:
1. **Character pose differs** across beats (arms/torso moving — not frozen T-pose/idle)
2. **Background reads as a place** (classroom, lab, stage, etc.)
3. Captions match the current beat
If motion fails, fix AnimationMixer scrubbing before re-render (see pitfalls).

## Hard Requirements (do not ship without these)

### Motion is non-negotiable
- Every storyboard beat must map to a **distinct Mixamo full-body clip** chosen from the catalog at planning time
- Idle-only / T-pose-only videos are failures — redo
- Wave at the start is not enough; middle beats need talking, pointing, thinking, celebrate (or catalog equivalents)
- After the plan is locked, download missing FBXs before code gen / render — never assume a clip exists on disk
- Offline render must **scrub** clips deterministically:
  - hard-switch actions (no crossFade during frame capture)
  - set `action.time` from beat-local time, `action.paused = true`, then `mixer.update(0)`
  - strip root motion (hips X/Z) so the character stays on stage
- Smoke-test that a bone quaternion changes between `t` and `t+0.45` before full render

### Background is non-negotiable
- Do not deliver flat single-color void backgrounds
- Build a simple set: floor + walls or skybox + at least 2 props + intentional lighting
- Add subtle background motion (orbiting accents, light pulse, camera drift) so the frame feels alive
- Match set to topic when possible (e.g. chalkboard + formulas for physics)

## Code Template Structure

### Three.js Setup
```javascript
// Load skinned character FBX from /mixamo/assets/
// Load action FBXs; mixer.clipAction(clip, character)
// Hard-switch + scrub in frameAt(t) for offline render
// Portrait camera 1080x1920 + real set/environment
// Text overlays with beat timing
```

### Animation Sequencing
Each beat has:
- **Start / end time** (seconds)
- **Mixamo catalog name** (from planning) + **local FBX** under `/mixamo/assets/` (downloaded in stage 4)
- **Text overlay**
- Optional camera emphasis

### FFmpeg Rendering
- Capture canvas frames at 30fps (default; 60 optional)
- Encode H.264 MP4 + VP9 WebM, 1080x1920
- **Delete** `outputs/frames_*` after successful encode to save disk
- Audio optional (TTS)

## Animation Library (Mixamo)

### Catalog (planning)
- `mixamo/animation-names.json` — list of available Mixamo names (~150+)
- `mixamo/animation-catalog.json` — names + product ids
- Refresh: `node mixamo_anims_downloader/listAnimsNode.mjs 150`

### Downloads (after planning)
- Use `MIXAMO_ACCESS_TOKEN` from `.env`
- Batch helper for common explainer set: `mixamo_anims_downloader/downloadAnimsNode.mjs [characterId]`
- For plan-specific clips: search Mixamo by the exact catalog name, export FBX (no skin), save as a slug under the character
- Prefer standing clips (reject seated/crouch/pack results when searching the API)

### On-disk layout
```
mixamo/
  animation-names.json
  animation-catalog.json
  assets/
    the-boss.fbx                 # flat character (reel compat)
    <slug>.fbx                   # flat action FBXs (reel compat)
    the-boss/
      character.fbx
      inventory.json             # which clips already downloaded
      animations/<slug>.fbx
```

Common baseline (may already be present; still verify against the plan):
- `idle.fbx`, `wave.fbx`, `talking.fbx`, `pointing.fbx`, `thinking.fbx`, `celebrate.fbx`

## Character Choices
- **The Boss** (authoritative, street-smart): rules, laws, "listen up" energy — id `c9012369-6099-4f23-b1e8-e45cbdc23d74`
- **Xbot** (technical, calm): logic / CS topics
- **Female** (energetic): dynamic explainers
- **Warrok** (dramatic): story / history

## Project Layout
```
mixamo/                  # catalog + character/animation FBXs
mixamo_anims_downloader/ # listAnimsNode.mjs, downloadAnimsNode.mjs
mentorscroll-reel/       # Three.js scene + Playwright render
  src/scene.js
  scripts/render.mjs
  scripts/smoke.mjs
outputs/                 # final mp4/webm (+ smoke png)
```

## Output Location
- **MP4**: `outputs/mentorscroll_{topic}_{timestamp}.mp4`
- **WebM**: `outputs/mentorscroll_{topic}_{timestamp}.webm`
- **FINAL DELIVERY (required):** copy the finished MP4 to **`output.mp4` at the root of the agent workspace** (the `cwd` the agent started in, e.g. `video-workspaces/{username}/{n}/output.mp4`). The MentorScroll backend serves this file and the web app plays it. Since render runs from inside `mentorscroll-reel/`, copy back to the workspace root with an absolute path:

```bash
# WORKSPACE_ROOT = the agent's starting cwd (video-workspaces/{username}/{n})
cp "outputs/mentorscroll_{topic}_{timestamp}.mp4" "$WORKSPACE_ROOT/output.mp4"
```

- Do **not** keep large `frames_*` directories after encode unless debugging
- Do **not** nest the deliverable in a subfolder — it must be `output.mp4` directly in the workspace root

## Technical Requirements
- Node.js + Three.js + Playwright + FFmpeg
- Mixamo FBX files at `/mixamo/assets/`
- `MIXAMO_ACCESS_TOKEN` in `.env` for downloads

## Common Pitfalls & Solutions

| Problem | Solution |
|---------|----------|
| Character only waves then freezes | Offline `frameAt` must scrub `action.time` + `mixer.update(1e-6)`; do not rely on crossFade / realtime clock during capture |
| Animations don't bind / frozen pose | Mixamo FBXs often ship **duplicate armatures** — prune bones not used by `SkinnedMesh.skeleton` BEFORE creating `AnimationMixer`, or PropertyBinding animates a hidden rig |
| Animations don't bind (names) | `mixer.clipAction(clip, character)`; clone clips; strip hips X/Z root motion |
| Seated / wrong clip downloaded | Prefer standing Mixamo search hits; use `--force` re-download |
| Flat boring background | Build walls/floor/props + lights; add moving accent objects |
| Text off-screen | Keep captions in lower safe area for 1080x1920 |
| Disk fills with frames | Delete `outputs/frames_*` after encode |
| Render too slow | 30fps default; smoke-test before full 45s render |

## Example Usage

**User Input:**
```
Create a reel about "What is recursion?" for a CS101 audience.
Keep it playful but clear. 45 seconds.
```

**Skill Output:**
```
read animation-names.json → 3 hook options with real Mixamo clip names
  → pick best → download only missing required FBXs → motion-first Three.js scene
  + real background set → smoke bone-motion check → MP4/WebM
```

## Integration with MentorScroll Platform
- Output videos upload to your platform's CDN
- Metadata: topic, duration, character, skill_level, hook_type
- Creator can monetize based on views/engagement
- Users swipe through vertical feed seamlessly

---

**Version**: 1.2  
**Updated**: July 2026  
**Stack**: Three.js + Mixamo FBX + Playwright + FFmpeg + Node.js  
**Quality bar**: catalog-driven planning → download only needed clips → visible actions every beat + proper 3D background
