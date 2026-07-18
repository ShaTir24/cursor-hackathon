---
name: mentorscroll-2d
description: >-
  Builds MentorScroll 2D educational reels (Kenney sprites + SVG diagrams) with
  a director-grade shot list per beat, Kenney-only asset casting verified against
  inventory, ElevenLabs voice selection, TTS with timestamps, forced alignment,
  and Playwright+FFmpeg MP4. Use for 2D reels, flat illustrations, Kenney/SVG
  overlays, or synced narration/captions via ELEVENLABS_API_KEY.
---

# MentorScroll 2D Video Skill

## What This Skill Does

Produces a 30–60s portrait (1080×1920) educational reel:

1. **Plan** (required) — storyboard + **director shot list** + **asset cast** + voice + narration
2. **Audio** — ElevenLabs voices → TTS (+ timestamps) → forced alignment
3. **Visuals** — Kenney CC0 sprites + SVG diagrams/callouts, staged per shot list
4. **Render** — Playwright frames + FFmpeg → MP4/WebM, mux VO (+ optional music)

**Auth:** load `ELEVENLABS_API_KEY` from project root `.env`. Header: `xi-api-key`.  
API details: [elevenlabs-audio.md](elevenlabs-audio.md)

## When to Trigger

- "2D reel", "flat illustration", "Kenney", "SVG overlays", "diagrams/callouts"
- Synced captions / narration / forced alignment for MentorScroll 2D
- Router sends a 2D request here

## Hard gates (all three, in order)

1. **Plan before code** — no edits to `mentorscroll-reel-2d/src/scene.js` and no render until a plan file exists and is LOCKED.
2. **Shot list before audio** — every beat has a complete director shot list row (focal point, hierarchy, motion, cut/hold, negative space). No "TBD" cells.
3. **Asset cast verified on disk** — every sprite in the cast table is a real path from `kenney/assets/**/inventory.json`, verified to exist before coding. **Never invent filenames.** If a wanted sprite doesn't exist, recast from inventory or draw it as SVG — do not guess a path.

Save plan to: `mentorscroll-reel-2d/plans/{topic_slug}_{YYYYMMDD}.md`

---

## Think like a director

The reel is a sequence of **shots**, not a slideshow of icons. For every beat, decide before coding:

| Director question | Field | Rule of thumb |
|---|---|---|
| Where does the eye land first? | **Focal point** | Exactly ONE per beat (hero diagram, hero sprite, or big number/formula). Everything else supports it. |
| What's the reading order? | **Hierarchy** | 1 focal → 2 support → 3 caption. Max 3 layers. If an element isn't in the hierarchy, cut it. |
| What moves, and why? | **Motion** | Focal point gets the meaningful motion (slide, grow, pulse). Support gets subtle idle motion. Never everything moving at once. |
| Cut or hold? | **Cut/hold** | Hook cuts fast (≤4s). Concept beats hold long enough to read diagram + hear the line. Change something visible at every beat boundary (diagram swap, layout shift, palette accent). |
| Where does the frame breathe? | **Negative space** | Keep ~25–35% of the frame quiet. Top third = stage/board, middle = focal diagram, lower third = caption. Don't stack icons into corners to fill space. |

### Composition rules for 1080×1920

- **Vertical thirds:** stage/context (top), focal diagram (middle), caption (lower safe area). Progress bar at the very bottom.
- One **hero zone** per beat (~40% of frame height). The focal element lives there and nothing overlaps it.
- Sprites are **cast for meaning**, not decoration: an arrow shows a force, a trophy rewards mastery. If you can't say what a sprite *means* in the beat, cut it.
- Palette: one background family + ONE accent color for focal/callouts. Support elements stay muted.
- Beat-to-beat continuity: keep the stage and character anchored; change the focal diagram. The viewer should feel "same room, next idea".

### Asset cast (Kenney-only role casting)

Cast sprites like actors. Roles per beat:

| Role | Count | Purpose | Example |
|------|-------|---------|---------|
| **Hero** | 0–1 | The focal sprite (if the focal isn't pure SVG) | puck circle, trophy |
| **Support** | 0–2 | Reinforces the idea (direction, result) | arrowRight for force, checkmark for "holds true" |
| **Character** | persistent | Teacher/mascot, same across all beats | blue squircle body + face + hand |
| **UI accent** | 0–1 | Callout/badge flourish | exclamation tile on the hook |

Casting procedure:

1. Read `kenney/assets/game-icons/inventory.json` and `kenney/assets/shape-characters/inventory.json` (run `node kenney_downloader/downloadPacks.mjs` if missing).
2. For each beat, fill the cast table with **exact relative paths** from inventory `files` arrays.
3. Verify every cast path exists:

```bash
node -e '
const fs=require("fs");
const cast=[/* paths from plan */];
const missing=cast.filter(p=>!fs.existsSync("kenney/assets/"+p));
if(missing.length){console.error("MISSING:",missing);process.exit(1)}
console.log("cast ok:",cast.length)'
```

4. Add every cast path to `mentorscroll-reel-2d/scripts/sync-assets.mjs` `NEEDED` list.
5. Anything inventory can't provide → SVG in the diagram layer (formulas, force arrows, graphs are usually **better** as SVG anyway).

---

## Workflow

### 1. Input

| Field | Default |
|-------|---------|
| Topic | required |
| Duration | 45s |
| Skill level | beginner |
| Voice preference | optional (name vibe, gender, accent) |
| Music | off (optional: video-to-music after picture lock) |

### 2. Ensure Kenney packs + read inventory

```bash
node kenney_downloader/downloadPacks.mjs
```

Skim inventory `files` before storyboarding so options are written against sprites that actually exist.

### 3. Select voice (ElevenLabs)

```bash
curl -sS -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices
```

Pick **one** `voice_id` + name; record in plan with a one-line "why it fits". Authoritative for "Boss" energy; calm/clear for technical; user override wins. If the API fails, document it and use the last-known good id from plan history or ask.

### 4. Brainstorm 3 options → director pass → write plan

Each option: hook + title, full narration script, provisional beat table, palette/stage strategy, why it works.

After presenting 3 options and locking one (user picks, or says "generate"), do the **director pass** on the locked option only: fill the full shot list + asset cast tables (template below). Mark `Status: LOCKED`.

### 5. Generate narration audio + timings

**Primary:** `POST /v1/text-to-speech/{voice_id}/with-timestamps` → save `outputs/audio/{topic}_vo.mp3` + `{topic}_tts_alignment.json`.

**Refine:** `POST /v1/forced-alignment` (multipart: mp3 + transcript) → `{topic}_forced_alignment.json`. Prefer word times when clean; high `loss` → re-TTS or fix transcript.

**Map words → beats:** set each beat's `t0`/`t1` from narration-cue word timestamps (filter empty/whitespace word entries first; match cues in order, each search starting after the previous cue's time). Write the **audio-locked beat table** into the plan. Scene `DURATION` = last word end + ~0.4s.

### 6. Assets + code

```bash
cd mentorscroll-reel-2d && npm run sync-assets
```

Implement `src/scene.js` **from the shot list**, not from memory:

- Each beat renders its focal point in the hero zone; hierarchy 1→2→3 respected
- Motion per the shot list (focal moves meaningfully; support idles; deterministic from `frameAt(t)`)
- Beat boundaries produce a visible change (diagram swap at minimum)
- Captions switch on audio-locked `t0`/`t1`
- API contract:

```js
window.__MS_READY = true
window.__MS = { duration, fps, frameAt(t), visualOk() }
```

### 7. Smoke → render → mux

```bash
cd mentorscroll-reel-2d && npm run smoke && npm run render
```

Mux VO (render script does this automatically when `outputs/audio/{topic}_vo.mp3` exists):

```bash
ffmpeg -y -i outputs/mentorscroll2d_{topic}_{ts}.mp4 -i outputs/audio/{topic}_vo.mp3 \
  -c:v copy -c:a aac -shortest outputs/mentorscroll2d_{topic}_with_vo_{ts}.mp4
```

Optional music after picture+VO lock: `POST /v1/music/video-to-music`, mixed well under narration.

Delete `outputs/frames_*` after encode.

### 8. Director's review (required before delivering)

Read the smoke screenshots at ~10% / 40% / 70% **against the shot list** and check:

1. **Focal point test:** in each screenshot, can you name the single element the eye lands on, and is it the one the shot list says? Competing focal points = fix before render.
2. **Hierarchy test:** reading order matches 1→2→3; no orphan decorations.
3. **Negative space test:** frame has quiet areas; caption zone uncluttered.
4. **Continuity test:** stage/character consistent across beats; diagram clearly changed.
5. Caption matches spoken beat (word timings); `visualOk()` true; VO present and synced.

If any test fails, fix scene.js and re-smoke before the full render.

---

## Plan document (required template)

```markdown
# MentorScroll 2D Plan — {Topic}

- **Status:** DRAFT | LOCKED
- **Duration target:** 45s
- **Skill level:** beginner
- **Voice:** {voice_name} (`{voice_id}`) — {why}
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none | video-to-music after picture lock
- **Palette:** {bg family} + {accent} accent

## Narration script (full)

{spoken script with beat breaks}

## Options

### OPTION 1 — "{title}" ✅/pending
- Hook: …
- Beats (provisional):

| # | t0–t1 | Caption | Diagram (SVG) | Narration cue |
|---|-------|---------|---------------|---------------|
| 1 | 0–4 | … | … | Wait. |

- Why this option: …

### OPTION 2 — …
### OPTION 3 — …

## Locked choice
Option {N} — {one-line reason}

## Director shot list (locked option — every cell filled)

| # | Shot | Focal point | Hierarchy (1→2→3) | Motion | Cut/hold | Negative space |
|---|------|-------------|--------------------|--------|----------|----------------|
| 1 | Hook | "WAIT" badge pulse | badge → character point → caption | badge pulse ×2, character lean-in | fast cut ≤4s | top third quiet |
| 2 | Law 1 | puck sliding on track | puck → force arrow appears → caption | puck slides L→R, arrow slams in at cue word | hold, 1 event | sides of track clear |

## Asset cast (verified against inventory — real paths only)

| # | Role | Sprite path (relative to kenney/assets/) | Meaning in beat |
|---|------|-------------------------------------------|-----------------|
| 1 | UI accent | shape-characters/PNG/Default/tile_exclamation.png | urgency badge |
| all | Character | shape-characters/PNG/Default/blue_body_squircle.png (+face, +hand) | teacher |
| 2 | Support | game-icons/PNG/White/2x/arrowRight.png | applied force |

Verified: `node -e …` (paste check output or "cast ok: N")

## Audio artifacts
- VO: outputs/audio/{topic}_vo.mp3
- TTS alignment: outputs/audio/{topic}_tts_alignment.json
- Forced alignment: outputs/audio/{topic}_forced_alignment.json

## Audio-locked beat table
(filled after TTS/alignment — this drives scene.js)
```

---

## Asset policy

1. **Kenney only** for sprites — cast from `kenney/assets/**/inventory.json`, verified paths
2. **SVG** for formulas, arrows-with-meaning, graphs, force diagrams (drawn in diagram layer)
3. **Freepik** — optional manual drop-ins in `assets/freepik/` only; never required

## Project layout

```
.env                              # ELEVENLABS_API_KEY
kenney/assets/                    # packs + inventory.json (source of truth for casting)
kenney_downloader/
mentorscroll-reel-2d/
  plans/                          # plan + shot list + asset cast (required)
  public/ src/ scripts/
outputs/
  audio/                          # vo + alignment json
  mentorscroll2d_*.mp4
```

## Hard requirements

- Plan with **complete shot list + verified asset cast** written before scene code / render
- Voice chosen via `GET /v1/voices` (or explicit user `voice_id`)
- Narration via ElevenLabs TTS; timings via `with-timestamps` and/or forced alignment
- One focal point per beat; visible change at every beat boundary
- Every sprite on screen has a stated meaning in the cast table
- Portrait 1080×1920; captions in lower safe area; deterministic `frameAt(t)`

## Pitfalls

| Problem | Fix |
|---------|-----|
| Icon soup (sprites as filler) | Delete anything not in the cast table's hierarchy |
| Two things fighting for attention | Demote one to support (smaller, muted, less motion) |
| Invented Kenney paths | Recast from inventory.json; verify with the node check |
| Beat boundary invisible | Swap diagram + shift layout accent at `t0` |
| Captions drift | Rebuild beat table from word timestamps |
| VO shorter than video | Set DURATION to audio length |
| Frozen motion | Drive transforms from `frameAt(t)` |
| Missing API key | Fail voice step loudly; do not silent-skip VO |

## Example

**Input:** Newton's laws, beginner, 45s, 2D  

**Plan:** 3 hooks → lock Option 1 → director pass (shot list: puck = focal of Law 1, arrow slams at "force"; trophy = focal of closer) → cast from inventory + verify → Adam voice via `/v1/voices` → TTS+timestamps → forced-alignment → audio-locked beats → scene per shot list → smoke vs shot list → MP4 + muxed VO
