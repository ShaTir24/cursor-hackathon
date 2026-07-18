# MentorScroll 2D Plan — Birthday Paradox

- **Status:** LOCKED
- **Duration target:** 40s
- **Skill level:** beginner (high-school / first-year college)
- **Audience / theme:** STEM study-reel / whiteboard kinetic
- **Voice:** Laura - Enthusiast, Quirky Attitude (`FGY2WhTYpPnrIDTdsKH5`) — punchy social-media energy for a surprise-hook math reel
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none
- **UI recipe:** whiteboard-lab / none / chalk-underline / bottom-card / bottom-center / thin-bar / lab-cyan
- **Anti-sameness:** vs `heisenberg_uncertainty_20260718.md` (notebook-paper / minimal-eyebrow / chapter-chip / typewriter-strip), `cap_theorem_marvel_20260718.md` (poster-wall / corner-tab / speech-bubble), `cap_theorem_20260718.md` (whiteboard-lab / tape-label / stamp / diagram-footer / bottom-left-wing / tick-rail) — same whiteboard family as CAP but changed header (none), callout (chalk-underline), caption (bottom-card), seat (bottom-center), and progress (thin-bar)

## Narration script (full)

Wait.
In a room of only twenty-three people, there's about a fifty percent chance two share a birthday. Surprising? Good.

Your gut says you need one hundred eighty-three — half of three sixty-five. That would be matching your birthday. Wrong question.

You're not matching one fixed birthday.
You're checking every pair. Twenty-three people make two hundred fifty-three pairs — and each pair is a tiny chance to collide.

Watch the odds climb.
Ten people — about twelve percent.
Twenty-three — fifty percent.
Fifty people — nearly certain. About ninety-seven percent.

So remember this.
Pairs explode faster than you think.

## Options

### OPTION 1 — "23 People. 50%." ✅ LOCKED
- Hook: WAIT + giant **23** / **50%** — room of 23, coin-flip chance of a shared birthday
- **UI recipe:** whiteboard-lab / none / chalk-underline / bottom-card / bottom-center / thin-bar / lab-cyan
- Beats (provisional):

| # | t0–t1 | Caption | Diagram (SVG) | Narration cue |
|---|-------|---------|---------------|---------------|
| 1 | 0–5 | WAIT · 23 people → ~50% | Giant 23 + 50% badge + crowd dots | Wait. |
| 2 | 5–14 | GUT · ~183 is the wrong question | Half-year timeline → ❌ 183 | Your gut |
| 3 | 14–24 | PAIRS · 253 comparisons | Fixed birthday vs pair web | You're not matching |
| 4 | 24–34 | CLIMB · 10 → 23 → 50 | Probability bar growing | Watch the odds |
| 5 | 34–40 | DONE · Pairs explode | Big takeaway stamp | Pairs explode |

- Why this option: Matches the user's locked hook + whiteboard kinetic brief; big numbers; anti-sameness vs recent notebook/poster/chalkboard chrome.

### OPTION 2 — "Wrong Question" (alternate look)
- Hook: gut instinct X'd out before revealing 23
- **UI recipe:** cork-sticky / minimal-eyebrow / corner-tab / speech-bubble / mid-side-peek / chapter-dots / warm-paper
- Why not locked: cork is casual; user asked whiteboard / notebook kinetic energy.

### OPTION 3 — "Pairs Explode" (alternate look)
- Hook: pair-count ticker racing upward
- **UI recipe:** broadcast-desk / tape-label / neon-pill / lower-third-bar / bottom-right-wing / none / mono-poster
- Why not locked: news-desk energy; less study-reel whiteboard feel.

## Locked choice
Option 1 — surprise-number hook + whiteboard kinetic chrome that still differs from CAP's whiteboard recipe.

## UI recipe (locked)

| Slot | Choice | Implementation note |
|------|--------|---------------------|
| Stage | whiteboard-lab | Cool white board + faint grid / marker smudge; cyan accent |
| Header | none | Title lives in diagram / caption only — no persistent HUD title |
| Callout | chalk-underline | Short beat label with cyan underline stroke |
| Caption | bottom-card | Rounded white card, ink text, cyan left accent bar |
| Character seat | bottom-center | Yellow squircle teacher; visible on hook + closer |
| Progress | thin-bar | Top edge cyan progress fill |
| Palette | lab-cyan | `#0b1f2a` ink on `#e8f4f8` board; accent `#00a3c4` |

## Director shot list (locked option — every cell filled)

| # | Shot | Focal point | Hierarchy (1→2→3) | Motion | Cut/hold | Negative space | UI beat note |
|---|------|-------------|--------------------|--------|----------|----------------|--------------|
| 1 | Hook | Giant **23** slamming in, then **~50%** | 23 → 50% badge → crowd dots | 23 scales in; 50% pulses; dots sprinkle | fast ≤5s | sides of board quiet | callout "WAIT" chalk-underline |
| 2 | Intuition | Big **183** with ❌ | 183 → "½ of 365" label → caption | 183 slides up then cross stamps | hold ~8s | left third clear | callout → "GUT" |
| 3 | Pairs | Pair web: one hub vs 253 edges | pair count **253** → web diagram → caption | hub→spokes grow; 253 ticks up | hold ~10s | top of board clear | callout → "PAIRS" |
| 4 | Climb | Probability bars 10 / 23 / 50 | bars → % labels → caption | bars grow left→right in sequence | hold ~10s | margins clear | callout → "CLIMB" |
| 5 | Closer | Stamp: "Pairs explode faster than you think." | stamp → checkmark → caption | stamp slam + slight settle | hold to end | quiet board around stamp | callout → "DONE" |

## Research sources (Exa)

- https://betterexplained.com/articles/understanding-the-birthday-paradox/ — 23 people ≈ 50%; 253 pairs; intuition vs pairs
- https://en.wikipedia.org/wiki/Birthday_problem — P≈50.73% at n=23; table: n=10 ≈11.7%, n=50 ≈97%
- https://statisticsbyjim.com/fun/birthday-problem/ — gut guess ~183 (half of 365) is the wrong question (matching *your* birthday)

No real-world person/place imagery required — pure probability diagrams (Kenney + SVG only).

## Asset cast (verified against inventory — real paths only)

| # | Role | Path | Meaning in beat | Source |
|---|------|------|-----------------|--------|
| 1 | UI accent | shape-characters/PNG/Default/tile_exclamation.png | hook urgency | Kenney |
| all | Character | shape-characters/PNG/Default/yellow_body_squircle.png (+face_c, +hand_yellow_point/open) | kinetic study teacher | Kenney |
| 2 | Support | game-icons/PNG/Black/2x/question.png | gut / wrong intuition | Kenney |
| 3 | Support | game-icons/PNG/Black/2x/cross.png | 183 is wrong | Kenney |
| 4 | Support | game-icons/PNG/Black/2x/checkmark.png | takeaway locked | Kenney |
| 5 | Support | game-icons/PNG/Black/2x/arrowRight.png | odds climb direction | Kenney |
| 6 | Support | game-icons/PNG/Black/2x/exclamation.png | closer emphasis | Kenney |
| 7 | Support | game-icons/PNG/Black/2x/star.png | 50% hit spark | Kenney |

Verified: `cast ok: 11`

## Audio artifacts
- VO: outputs/audio/birthday_paradox_vo.mp3
- TTS alignment: outputs/audio/birthday_paradox_tts_alignment.json
- Forced alignment: outputs/audio/birthday_paradox_forced_alignment.json

## Audio-locked beat table
(from forced alignment; DURATION = 42.919 + 0.4 = 43.319)

| # | t0–t1 | Caption | Diagram | Narration cue | Callout |
|---|-------|---------|---------|---------------|---------|
| 1 | 0.099–9.000 | WAIT · 23 people → ~50% | hook | Wait. | WAIT |
| 2 | 9.000–17.279 | GUT · ~183 wrong question | gut | Your gut | GUT |
| 3 | 17.279–28.299 | PAIRS · 253 comparisons | pairs | You're not matching | PAIRS |
| 4 | 28.299–39.520 | CLIMB · 10 → 23 → 50 | climb | Watch the odds | CLIMB |
| 5 | 39.520–43.319 | DONE · Pairs explode | closer | So remember | DONE |
