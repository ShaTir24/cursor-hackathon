# MentorScroll 2D Plan — CAP Theorem

- **Status:** LOCKED
- **Duration target:** 45s
- **Skill level:** beginner
- **Audience / theme:** STEM / systems (whiteboard lab explainer)
- **Voice:** Alice - Clear, Engaging Educator (`Xb7hH8MSUJpSbSDYk0k2`) — calm British educator energy for a crisp systems tradeoff
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none
- **UI recipe:** whiteboard-lab / tape-label / stamp / diagram-footer / bottom-left-wing / tick-rail / lab-cyan
- **Anti-sameness:** vs `indian_freedom_fighters_marvel_20260718.md` (indigo night + gold badge card) and `newtons_laws_ranked_20260718.md` (dark-arena + scoreboard-hud + neon-pill + bottom-card) — changed stage, header, callout, caption, seat, progress, and palette

## Narration script (full)

Wait.
Distributed systems have a hard rule called CAP.

C is Consistency.
Every read gets the latest write. Same answer everywhere.

A is Availability.
The system keeps responding. Even when something's wrong.

P is Partition tolerance.
The network can split — and the system must survive that.

Here's the catch.
When a partition hits, you cannot keep both C and A.
You pick two. Never all three.

CAP theorem. Design with the tradeoff. Not against it.

## Options

### OPTION 1 — "Pick Two" ✅ LOCKED
- Hook: WAIT + stamped "PICK TWO" — CAP as a hard systems rule
- **UI recipe:** whiteboard-lab / tape-label / stamp / diagram-footer / bottom-left-wing / tick-rail / lab-cyan
- Beats (provisional):

| # | t0–t1 | Caption | Diagram (SVG) | Narration cue |
|---|-------|---------|---------------|---------------|
| 1 | 0–4 | WAIT — Distributed systems have a hard rule | Stamp + CAP letters assemble | Wait |
| 2 | 4–12 | C · Consistency — same answer everywhere | Node cluster synced to one value | C is Consistency |
| 3 | 12–20 | A · Availability — keeps responding | Heartbeat / online nodes pulsing | A is Availability |
| 4 | 20–28 | P · Partition — network can split | Split link + warning | P is Partition |
| 5 | 28–38 | CATCH — when partition hits, pick C or A | Triangle: drop A or drop C | Here's the catch |
| 6 | 38–45 | CAP — design with the tradeoff | Triangle settle + check | CAP theorem |

- Why this option: classic triangle payoff; whiteboard lab chrome fits systems teaching; stamp callouts feel like lab notes, not gaming HUD

### OPTION 2 — "Network Split Emergency"
- Hook: breaking-news desk, partition alert
- **UI recipe:** broadcast-desk / none / chapter-chip / lower-third-bar / bottom-right-wing / thin-bar / lab-cyan
- Why not locked: news framing is flashy but weaker for learning the three letters as concepts

### OPTION 3 — "Sticky CAP Cheat Sheet"
- Hook: three sticky notes C / A / P, peel one away on partition
- **UI recipe:** cork-sticky / minimal-eyebrow / corner-tab / speech-bubble / mid-side-peek / none / warm-paper
- Why not locked: mnemonic-friendly but triangle tradeoff reads less clearly than a whiteboard diagram

## Locked choice
Option 1 — strongest diagram arc (letters → meanings → triangle catch) + UI recipe farthest from recent arena/Marvel reels; user said generate

## Voice shortlist (from GET /v1/voices)
1. **Alice** `Xb7hH8MSUJpSbSDYk0k2` — Clear, Engaging Educator ✅
2. Daniel `onwK4e9ZLuTAKqWW03F9` — Steady Broadcaster
3. River `SAz9YHcvj6GT2YYXdXww` — Relaxed, Neutral, Informative

## UI recipe (locked)

| Slot | Choice | Implementation note |
|------|--------|---------------------|
| Stage | whiteboard-lab | Cool white/blue board wash, faint grid, cyan accent glow |
| Header | tape-label | Masking-tape strip title "CAP THEOREM" + sub "PICK TWO" |
| Callout | stamp | Squircle stamp badge (ink outline, slight rotate) for beat labels |
| Caption | diagram-footer | Flat footer strip under hero diagram (not floating card) |
| Character seat | bottom-left-wing | Mascot anchored lower-left; diagram owns center-right |
| Progress | tick-rail | Vertical tick marks on right edge, advance per beat |
| Palette | lab-cyan | Board `#e8f2f8` → `#d5e6f0`, ink `#123047`, accent `#0aa3c2` |

## Director shot list (locked option — every cell filled)

| # | Shot | Focal point | Hierarchy (1→2→3) | Motion | Cut/hold | Negative space | UI beat note |
|---|------|-------------|--------------------|--------|----------|----------------|--------------|
| 1 | Hook | "PICK TWO" stamp pulse | stamp → character point → caption | stamp scale pulse ×2; CAP letters fade in | fast cut ≤4s | top board quiet; right rail clear | callout "WAIT" |
| 2 | Consistency | Three nodes sharing one value "42" | synced nodes → checkmark support → caption | values snap equal; check pops at cue | hold | sides of cluster clear | callout → "C" |
| 3 | Availability | Online node heartbeat rings | pulsing node → unlocked support → caption | ring pulse idle; unlock fades in | hold; diagram swap | leave board margins empty | callout → "A" |
| 4 | Partition | Broken link between two node groups | split gap → warning icon → caption | link cracks then gap widens | hold; visible split | quiet above split | callout → "P" |
| 5 | Catch | CAP triangle with A or C dimming | triangle → dimmed letter → caption | on cue, alternate dim A then C (can't keep both) | hold longest; 1 event | triangle owns hero zone | callout → "CATCH" |
| 6 | Closer | Settled CAP triangle + check | triangle → checkmark → caption | triangle locks; check slam; star idle | short hold to audio end | footer caption only | callout → "CAP" |

## Asset cast (verified against inventory — real paths only)

| # | Role | Sprite path (relative to kenney/assets/) | Meaning in beat |
|---|------|-------------------------------------------|-----------------|
| all | Character | shape-characters/PNG/Default/blue_body_squircle.png (+face_a, +hand) | teacher / lab host |
| all | Character hand | shape-characters/PNG/Default/blue_hand_point.png | points at diagram |
| all | Character hand | shape-characters/PNG/Default/blue_hand_open.png | open gesture on closer |
| 1 | UI accent | shape-characters/PNG/Default/tile_exclamation.png | urgency on hook |
| 2 | Support | game-icons/PNG/White/2x/checkmark.png | consistent / correct design |
| 3 | Support | game-icons/PNG/White/2x/unlocked.png | stays available / accepting |
| 4 | Support | game-icons/PNG/White/2x/warning.png | partition danger |
| 5 | Support | game-icons/PNG/White/2x/cross.png | cannot keep both C and A |
| 6 | Support | game-icons/PNG/White/2x/locked.png | consistency locks stale side |
| 6 | UI accent | game-icons/PNG/White/2x/star.png | design-with-tradeoff win |
| — | Support | game-icons/PNG/White/2x/information.png | lab tip accent on C beat |

Verified: `cast ok: 12`

## Audio artifacts
- VO: outputs/audio/cap_theorem_vo.mp3
- TTS alignment: outputs/audio/cap_theorem_tts_alignment.json
- Forced alignment: outputs/audio/cap_theorem_forced_alignment.json

## Audio-locked beat table
(forced-alignment words; loss ≈ 0.41 — cues clean; DURATION = last word end + 0.4s = **36.779s**)

| # | t0–t1 | Caption | Diagram | Narration cue | Event cue |
|---|-------|---------|---------|---------------|-----------|
| 1 | 0.099–4.500 | WAIT — Distributed systems have a hard rule: CAP | Stamp + CAP letters | Wait. | — |
| 2 | 4.500–11.019 | C · Consistency — same answer everywhere | Synced nodes = 42 | C | Same @ 9.300 |
| 3 | 11.019–17.279 | A · Availability — keeps responding | Heartbeat nodes | A | responding @ 14.179 |
| 4 | 17.279–24.079 | P · Partition — network can split | Split link + warning | P | split @ 20.699 |
| 5 | 24.079–32.399 | CATCH — when partition hits, pick C or A | Triangle dims A/C | Here's | cannot @ 26.879 |
| 6 | 32.399–36.779 | CAP — design with the tradeoff | Triangle + check | CAP | tradeoff @ 34.380 |

## Director's review notes
Smoke frames `smoke_2d_cap_theorem_{3_7,14_7,25_7}.png` + `visualOk: true`
1. Focal: hook→PICK TWO stamp; mid→OK heartbeat nodes; late→CAP triangle — pass
2. Hierarchy: diagram → stamp/support → footer caption — pass
3. Negative space: board margins + left wing quiet — pass
4. Continuity: tape header + left mascot + tick-rail consistent; diagrams swap — pass
5. UI recipe: whiteboard grid, tape-label, stamp callout, diagram-footer, left-wing seat — pass (not leftover Marvel/arena chrome)
6. Sameness: clearly different from indigo-night and dark-arena reels — pass
7. Captions match audio-locked beats; VO mux on render
