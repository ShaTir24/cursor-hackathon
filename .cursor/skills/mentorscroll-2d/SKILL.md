---
name: mentorscroll-2d
description: >-
  Builds MentorScroll 2D educational reels (Kenney sprites + SVG diagrams) with
  a director-grade shot list per beat, a varied UI-kit recipe (so reels don't
  reuse the same chrome), Kenney-only asset casting verified against inventory,
  Exa web research + real-world imagery sourcing, ElevenLabs voice selection,
  TTS with timestamps, forced alignment, and Playwright+FFmpeg MP4. Use for 2D
  reels, flat illustrations, Kenney/SVG overlays, web-sourced imagery via
  EXA_API_KEY, or synced narration/captions via ELEVENLABS_API_KEY.
---

# MentorScroll 2D Video Skill

## What This Skill Does

Produces a 30–60s portrait (1080×1920) educational reel:

1. **Research** — Exa web search to fact-check the topic and source real-world imagery the reel needs
2. **Plan** (required) — storyboard + **UI recipe** + **director shot list** + **asset cast** + voice + narration
3. **Audio** — ElevenLabs voices → TTS (+ timestamps) → forced alignment
4. **Visuals** — Kenney CC0 sprites + SVG diagrams/callouts + Exa-sourced web imagery, staged per shot list **and** the locked UI recipe
5. **Render** — Playwright frames + FFmpeg → MP4/WebM, mux VO (+ optional music)

**Auth:**
- `ELEVENLABS_API_KEY` from project root `.env` (header `xi-api-key`) — voice/TTS. API details: [elevenlabs-audio.md](elevenlabs-audio.md)
- `EXA_API_KEY` from project root `.env` (header `x-api-key`) — web research + imagery. API details: [exa-search.md](exa-search.md)

Both keys are provided to the spawned agent via its environment; read them with `process.env`.

## When to Trigger

- "2D reel", "flat illustration", "Kenney", "SVG overlays", "diagrams/callouts"
- Synced captions / narration / forced alignment for MentorScroll 2D
- Router sends a 2D request here

## Hard gates (all four, in order)

1. **Plan before code** — no edits to `mentorscroll-reel-2d/src/scene.js` (or `public/styles.css` / `public/index.html` chrome) and no render until a plan file exists and is LOCKED.
2. **UI recipe before shot list** — every locked plan picks one complete **UI recipe** from the director menu below (stage + header + callout + caption + character seat + progress + palette). No "reuse last reel's chrome by default."
3. **Shot list before audio** — every beat has a complete director shot list row (focal point, hierarchy, motion, cut/hold, negative space, **UI beat note**). No "TBD" cells.
4. **Asset cast verified on disk** — every sprite in the cast table is a real path from `kenney/assets/**/inventory.json`, verified to exist before coding. **Never invent filenames.** If a wanted sprite doesn't exist, recast from inventory or draw it as SVG — do not guess a path.

Save plan to: `mentorscroll-reel-2d/plans/{topic_slug}_{YYYYMMDD}.md`

**Anti-sameness gate:** before locking, skim the 2–3 most recent files in `mentorscroll-reel-2d/plans/`. If the new recipe shares the same **header + callout + caption** combo as a recent plan, **recast the UI recipe** (change at least two of those three chrome pieces, or swap the stage family). Diagram topics can repeat; chrome must not.

---

## Think like a director

The reel is a sequence of **shots**, not a slideshow of icons. For every beat, decide before coding:

| Director question | Field | Rule of thumb |
|---|---|---|
| Where does the eye land first? | **Focal point** | Exactly ONE per beat (hero diagram, hero sprite, or big number/formula). Everything else supports it. |
| What's the reading order? | **Hierarchy** | 1 focal → 2 support → 3 caption. Max 3 layers. If an element isn't in the hierarchy, cut it. |
| What moves, and why? | **Motion** | Focal point gets the meaningful motion (slide, grow, pulse). Support gets subtle idle motion. Never everything moving at once. |
| Cut or hold? | **Cut/hold** | Hook cuts fast (≤4s). Concept beats hold long enough to read diagram + hear the line. Change something visible at every beat boundary (diagram swap, layout shift, palette accent). |
| Where does the frame breathe? | **Negative space** | Keep ~25–35% of the frame quiet. Don't stack icons into corners to fill space. Quiet zones follow the locked UI recipe (not always "top third empty"). |
| Which chrome am I using? | **UI recipe** | Stage + header + callout + caption + character seat + progress — picked once per reel, varied vs recent plans. |

### Composition rules for 1080×1920

- One **hero zone** per beat (~35–45% of frame height). The focal element lives there and nothing overlaps it.
- Sprites are **cast for meaning**, not decoration: an arrow shows a force, a trophy rewards mastery. If you can't say what a sprite *means* in the beat, cut it.
- Palette: one background family + ONE accent color for focal/callouts. Support elements stay muted.
- Beat-to-beat continuity: keep the **locked stage + character seat** anchored; change the focal diagram (and callout label). The viewer should feel "same room, next idea" — unless a planned mid-reel layout beat deliberately shifts seats for emphasis (at most one such beat).
- **Do not default every reel to** dark-arena scoreboard HUD + neon pill callout + bottom caption card + bottom-center character. That combo is one recipe among many — use it only when it fits *and* recent plans didn't.

---

## UI kit (director menu)

Treat chrome like a kit of interchangeable parts. **Before** writing the shot list, lock one **UI recipe** by picking exactly one option from each row:

| Slot | Pick one | Notes |
|------|----------|-------|
| **Stage / world** | `chalkboard` · `whiteboard-lab` · `dark-arena` · `notebook-paper` · `cork-sticky` · `broadcast-desk` · `poster-wall` | Sets bg, texture, and atmosphere. Must feel like a place, not a flat void. |
| **Header chrome** | `scoreboard-hud` · `chalk-banner` · `minimal-eyebrow` · `tape-label` · `none` | Persistent top anchor. `none` = title lives in the diagram or caption only. |
| **Callout / beat badge** | `neon-pill` · `stamp` · `chalk-underline` · `chapter-chip` · `corner-tab` · `none` | Short beat label ("LAW 1", "WAIT"). If `none`, the caption law-line carries the label. |
| **Caption treatment** | `bottom-card` · `lower-third-bar` · `speech-bubble` · `typewriter-strip` · `diagram-footer` | Lower safe area still required for readability; treatment changes shape/placement. |
| **Character seat** | `bottom-center` · `bottom-left-wing` · `bottom-right-wing` · `mid-side-peek` · `absent-on-diagram-beats` | Same seat across the reel (except optional one layout-shift beat). `absent-on-diagram-beats` hides the mascot when the diagram needs the full hero zone. |
| **Progress** | `thin-bar` · `chapter-dots` · `tick-rail` · `none` | Always non-competing; never steals focal attention. |
| **Palette family** | `ink-chalk` (deep green/cream) · `lab-cyan` (cool blue/white) · `arena-neon` (navy + one neon) · `warm-paper` (kraft + coral/ink) · `mono-poster` (near-black + single spot) | One family per reel. Avoid purple-gradient defaults. |

### Recipe rules

1. **Three brainstorm options = three different recipes.** Options may share a topic hook idea, but each option's stage/header/callout/caption combo must differ so the user (or auto-pick) is choosing a *look*, not just a script.
2. **Name the recipe** in the plan (e.g. `notebook-paper / tape-label / stamp / speech-bubble / bottom-left-wing / chapter-dots / warm-paper`).
3. **Implement the recipe in HTML/CSS**, not only in SVG diagrams. `public/index.html` + `public/styles.css` must reflect the locked chrome (header markup, caption shape, callout style, stage background). Do not leave the previous reel's arena HUD in place and only swap diagram SVGs.
4. **Within-reel variety** still comes from diagram swaps + callout text + one meaningful motion event per beat — not from random chrome thrashing every cut.
5. **Audience / theme fit:** if the user (or profile) implies an age/interest theme (gaming, classroom, lab, etc.), bias the recipe toward that world — but still pass the anti-sameness gate vs recent plans.
6. **Forbidden lazy default:** copying the last plan's CSS/HTML shell with a new topic. If you start from the previous scene files, you must restyle chrome to match the new recipe before smoke.

### Example recipes (non-exhaustive — invent combinations from the menu)

| Recipe name | Combo | Feels like |
|-------------|-------|------------|
| Ranked lobby | `dark-arena` + `scoreboard-hud` + `neon-pill` + `bottom-card` + `bottom-center` + `thin-bar` + `arena-neon` | Competitive / gaming |
| Chalk talk | `chalkboard` + `chalk-banner` + `chalk-underline` + `lower-third-bar` + `bottom-left-wing` + `chapter-dots` + `ink-chalk` | Classic classroom |
| Lab notebook | `notebook-paper` + `tape-label` + `stamp` + `diagram-footer` + `absent-on-diagram-beats` + `tick-rail` + `warm-paper` | Study notes / STEM |
| Sticky sprint | `cork-sticky` + `minimal-eyebrow` + `corner-tab` + `speech-bubble` + `mid-side-peek` + `none` + `warm-paper` | Casual / mnemonic |
| Broadcast explainer | `broadcast-desk` + `none` + `chapter-chip` + `lower-third-bar` + `bottom-right-wing` + `thin-bar` + `lab-cyan` | News / explainer |

---

### Asset cast (Kenney-only role casting)

Cast sprites like actors. Roles per beat:

| Role | Count | Purpose | Example |
|------|-------|---------|---------|
| **Hero** | 0–1 | The focal sprite (if the focal isn't pure SVG) | puck circle, trophy |
| **Support** | 0–2 | Reinforces the idea (direction, result) | arrowRight for force, checkmark for "holds true" |
| **Character** | persistent* | Teacher/mascot (*unless recipe seat is `absent-on-diagram-beats`) | blue/green squircle body + face + hand |
| **UI accent** | 0–1 | Callout/badge flourish that matches the recipe | exclamation tile on the hook |

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
| Audience / theme | optional (age band, gaming/classroom/lab, etc.) — biases UI recipe |
| Music | off (optional: video-to-music after picture lock) |

### 2. Ensure Kenney packs + read inventory

```bash
node kenney_downloader/downloadPacks.mjs
```

Skim inventory `files` before storyboarding so options are written against sprites that actually exist.

Also skim recent `mentorscroll-reel-2d/plans/*.md` **UI recipe** lines so brainstorm options don't repeat chrome.

### 2.5. Research topic + source web imagery (Exa)

Use `EXA_API_KEY` (header `x-api-key`) to ground the reel before writing narration. See [exa-search.md](exa-search.md).

1. **Fact-check:** `POST https://api.exa.ai/search` with the topic → read result `text` to confirm facts, dates, and diagram labels. Record 2–3 `url`s in the plan under **Research sources**.
2. **Find imagery:** for any real-world subject the topic needs that Kenney/SVG can't provide (a person, place, product, event), query Exa for images, read the `image` field, and pick clean, on-topic, usably-licensed images.
3. **Download:** save chosen images to `mentorscroll-reel-2d/assets/web/` and record each one's source URL in the plan.
4. Web images are **hero/background** elements (still one focal per beat), framed by the locked UI recipe — they support the Kenney cast, never replace it.

If `EXA_API_KEY` is unset or Exa fails: note it in the plan, skip web imagery, and build from Kenney + SVG. Never invent facts to cover a failed search.

### 3. Select voice (ElevenLabs)

```bash
curl -sS -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices
```

Pick **one** `voice_id` + name; record in plan with a one-line "why it fits". Authoritative for "Boss" energy; calm/clear for technical; user override wins. If the API fails, document it and use the last-known good id from plan history or ask.

### 4. Brainstorm 3 options → director pass → write plan

Each option must include:

- Hook + title
- Full narration script
- Provisional beat table
- **UI recipe** (named combo from the director menu — unique per option)
- Why this option works (script *and* look)

After presenting 3 options and locking one (user picks, or says "generate"), do the **director pass** on the locked option only:

1. Confirm / finalize the **UI recipe** (pass anti-sameness vs recent plans)
2. Fill the full shot list + asset cast tables (template below)
3. Mark `Status: LOCKED`

### 5. Generate narration audio + timings

**Primary:** `POST /v1/text-to-speech/{voice_id}/with-timestamps` → save `outputs/audio/{topic}_vo.mp3` + `{topic}_tts_alignment.json`.

**Refine:** `POST /v1/forced-alignment` (multipart: mp3 + transcript) → `{topic}_forced_alignment.json`. Prefer word times when clean; high `loss` → re-TTS or fix transcript.

**Map words → beats:** set each beat's `t0`/`t1` from narration-cue word timestamps (filter empty/whitespace word entries first; match cues in order, each search starting after the previous cue's time). Write the **audio-locked beat table** into the plan. Scene `DURATION` = last word end + ~0.4s.

### 6. Assets + code

```bash
cd mentorscroll-reel-2d && npm run sync-assets
```

Implement **chrome first, then diagrams** — from the locked UI recipe + shot list, not from memory of the previous reel:

- Restyle `public/index.html` + `public/styles.css` to match the recipe (stage bg, header, callout, caption, character seat, progress)
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

Read the smoke screenshots at ~10% / 40% / 70% **against the shot list + UI recipe** and check:

1. **Focal point test:** in each screenshot, can you name the single element the eye lands on, and is it the one the shot list says? Competing focal points = fix before render.
2. **Hierarchy test:** reading order matches 1→2→3; no orphan decorations.
3. **Negative space test:** frame has quiet areas; caption zone uncluttered.
4. **Continuity test:** stage/character seat consistent across beats; diagram clearly changed.
5. **UI recipe test:** screenshots show the locked chrome (header/callout/caption/stage), not leftover chrome from a previous reel.
6. **Sameness test:** if this reel could be mistaken for the previous topic's video after blurring the diagram text, the chrome failed — restyle and re-smoke.
7. Caption matches spoken beat (word timings); `visualOk()` true; VO present and synced.

If any test fails, fix scene/CSS and re-smoke before the full render.

---

## Plan document (required template)

```markdown
# MentorScroll 2D Plan — {Topic}

- **Status:** DRAFT | LOCKED
- **Duration target:** 45s
- **Skill level:** beginner
- **Audience / theme:** {optional age/interest bias}
- **Voice:** {voice_name} (`{voice_id}`) — {why}
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none | video-to-music after picture lock
- **UI recipe:** {stage} / {header} / {callout} / {caption} / {character seat} / {progress} / {palette}
- **Anti-sameness:** vs recent plans {filenames} — changed {what}

## Narration script (full)

{spoken script with beat breaks}

## Options

### OPTION 1 — "{title}" ✅/pending
- Hook: …
- **UI recipe:** …
- Beats (provisional):

| # | t0–t1 | Caption | Diagram (SVG) | Narration cue |
|---|-------|---------|---------------|---------------|
| 1 | 0–4 | … | … | Wait. |

- Why this option: … (script + look)

### OPTION 2 — … (different UI recipe)
### OPTION 3 — … (different UI recipe)

## Locked choice
Option {N} — {one-line reason including look}

## UI recipe (locked)

| Slot | Choice | Implementation note |
|------|--------|---------------------|
| Stage | … | CSS bg / texture |
| Header | … | #hud markup or omit |
| Callout | … | #callout style or omit |
| Caption | … | #caption shape |
| Character seat | … | #actor position / visibility rules |
| Progress | … | #progress variant or omit |
| Palette | … | CSS variables / accent hex |

## Director shot list (locked option — every cell filled)

| # | Shot | Focal point | Hierarchy (1→2→3) | Motion | Cut/hold | Negative space | UI beat note |
|---|------|-------------|--------------------|--------|----------|----------------|--------------|
| 1 | Hook | "WAIT" badge pulse | badge → character point → caption | badge pulse ×2, character lean-in | fast cut ≤4s | quiet zone per recipe | callout label "WAIT" |
| 2 | Law 1 | puck sliding on track | puck → force arrow appears → caption | puck slides L→R, arrow slams in at cue word | hold, 1 event | sides of track clear | callout → "LAW 1" |

## Research sources (Exa)

- {url 1} — {what it confirmed}
- {url 2} — {what it confirmed}
(or "EXA_API_KEY unset / Exa failed — built from base knowledge")

## Asset cast (verified against inventory — real paths only)

| # | Role | Path | Meaning in beat | Source |
|---|------|------|-----------------|--------|
| 1 | UI accent | shape-characters/PNG/Default/tile_exclamation.png | urgency badge | Kenney |
| all | Character | shape-characters/PNG/Default/blue_body_squircle.png (+face, +hand) | teacher | Kenney |
| 2 | Support | game-icons/PNG/White/2x/arrowRight.png | applied force | Kenney |
| 3 | Web (Exa) | assets/web/{file}.jpg | real subject in hero zone | {source URL} |

Verified: `node -e …` (paste check output or "cast ok: N"). Every `Web (Exa)` row must list its source URL.

## Audio artifacts
- VO: outputs/audio/{topic}_vo.mp3
- TTS alignment: outputs/audio/{topic}_tts_alignment.json
- Forced alignment: outputs/audio/{topic}_forced_alignment.json

## Audio-locked beat table
(filled after TTS/alignment — this drives scene.js)
```

---

## Asset policy

1. **Kenney only** for sprites/icons/mascot — cast from `kenney/assets/**/inventory.json`, verified paths
2. **SVG** for formulas, arrows-with-meaning, graphs, force diagrams (drawn in diagram layer)
3. **Web imagery via Exa** — real-world subjects only (person/place/product/event) that Kenney/SVG can't provide. Download to `mentorscroll-reel-2d/assets/web/`, reference with `W('{file}')`, record source URL + role `Web (Exa)` in the cast table. Prefer public-domain/CC/official; if licensing is unclear, redraw as SVG. Never use Exa images in place of a Kenney sprite. See [exa-search.md](exa-search.md).
4. **Freepik** — optional manual drop-ins in `assets/freepik/` only; never required

## Project layout

```
.env                              # ELEVENLABS_API_KEY, EXA_API_KEY
kenney/assets/                    # packs + inventory.json (source of truth for casting)
kenney_downloader/
mentorscroll-reel-2d/
  plans/                          # plan + UI recipe + shot list + asset cast (required)
  public/ src/ scripts/           # chrome (html/css) must match locked UI recipe
  assets/kenney/                  # synced Kenney sprites (via sync-assets)
  assets/web/                     # Exa-sourced real-world imagery (source URLs logged in plan)
outputs/
  audio/                          # vo + alignment json
  mentorscroll2d_*.mp4
```

## Hard requirements

- Plan with **complete UI recipe + shot list + verified asset cast** written before scene code / render
- Topic fact-checked via **Exa** (`EXA_API_KEY`) with research sources logged (or the failure noted)
- Real-world subjects sourced as **Exa web imagery** into `assets/web/` with source URLs, framed by the UI recipe (Kenney remains the sprite/icon source)
- Three brainstorm options use **three different UI recipes**
- Locked recipe passes **anti-sameness** vs the 2–3 most recent plans
- Voice chosen via `GET /v1/voices` (or explicit user `voice_id`)
- Narration via ElevenLabs TTS; timings via `with-timestamps` and/or forced alignment
- One focal point per beat; visible change at every beat boundary
- Every sprite on screen has a stated meaning in the cast table
- Portrait 1080×1920; captions readable in lower safe area; deterministic `frameAt(t)`
- HTML/CSS chrome implemented to match the recipe (not diagram-only restyle)

## Pitfalls

| Problem | Fix |
|---------|-----|
| Every reel looks like the last one | Recast UI recipe (stage/header/callout/caption); restyle CSS before coding diagrams |
| Icon soup (sprites as filler) | Delete anything not in the cast table's hierarchy |
| Two things fighting for attention | Demote one to support (smaller, muted, less motion) |
| Invented Kenney paths | Recast from inventory.json; verify with the node check |
| Beat boundary invisible | Swap diagram + shift callout label at `t0` |
| Captions drift | Rebuild beat table from word timestamps |
| VO shorter than video | Set DURATION to audio length |
| Frozen motion | Drive transforms from `frameAt(t)` |
| Missing API key | Fail voice step loudly; do not silent-skip VO |
| Invented facts / wrong dates | Fact-check with Exa first; log research source URLs in the plan |
| Raw web photo dropped on stage | Frame Exa imagery with the UI recipe (card/poster/lower-third); one focal per beat |
| Exa image of unclear license shipped | Redraw as SVG or recast; only ship public-domain/CC/official, with source URL logged |
| Options differ only in hook copy | Force each option onto a different UI recipe from the menu |
| Copied previous `styles.css` shell | Treat leftover arena HUD as a failed UI recipe test |

## Example

**Input:** Newton's laws, beginner, 45s, 2D, gaming-leaning audience  

**Plan:** 3 hooks each with a distinct UI recipe (ranked lobby / chalk talk / lab notebook) → lock Option 1 (arena) → anti-sameness check vs recent plans → director pass (shot list + UI beat notes) → cast from inventory + verify → Liam voice via `/v1/voices` → TTS+timestamps → forced-alignment → audio-locked beats → restyle chrome to recipe → scene per shot list → smoke vs shot list **and** UI recipe → MP4 + muxed VO
