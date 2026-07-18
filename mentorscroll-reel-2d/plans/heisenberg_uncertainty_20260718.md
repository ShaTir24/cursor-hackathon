# MentorScroll 2D Plan — Heisenberg's Uncertainty Principle

- **Status:** LOCKED
- **Duration target:** 45s
- **Skill level:** beginner
- **Audience / theme:** STEM / study notes (lab notebook explainer)
- **Voice:** River - Relaxed, Neutral, Informative (`SAz9YHcvj6GT2YYXdXww`) — calm, clear for quantum limits without hype
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none
- **UI recipe:** notebook-paper / minimal-eyebrow / chapter-chip / typewriter-strip / absent-on-diagram-beats / tick-rail / warm-paper
- **Anti-sameness:** vs `cap_theorem_marvel_20260718.md` (poster-wall / corner-tab / speech-bubble), `special_relativity_20260718.md` (chalkboard / chalk-banner / chalk-underline / lower-third-bar), `newtons_laws_ranked_20260718.md` (dark-arena / scoreboard-hud / neon-pill) — changed stage, header, callout, caption, seat, progress, and palette

## Narration script (full)

Wait.
You cannot know everything about a quantum particle at once.

Heisenberg's uncertainty principle.
The better you know where it is, the worse you know how fast it's moving — and vice versa.

Here's the rule.
Delta x times delta p is always at least h-bar over two.

Pin the position? Momentum smears.
Pin the momentum? Position blurs.

It's not a bad microscope.
It's nature's hard limit — baked into the wave.

Heisenberg's principle. Know one. Unknow the other.

## Options

### OPTION 1 — "Know One, Unknow the Other" ✅ LOCKED
- Hook: WAIT + notebook stamp — you cannot know everything at once
- **UI recipe:** notebook-paper / minimal-eyebrow / chapter-chip / typewriter-strip / absent-on-diagram-beats / tick-rail / warm-paper
- Beats (provisional):

| # | t0–t1 | Caption | Diagram (SVG) | Narration cue |
|---|-------|---------|---------------|---------------|
| 1 | 0–4 | WAIT — cannot know everything at once | Portrait card + "?" blur | Wait |
| 2 | 4–14 | PRINCIPLE — position vs speed tradeoff | Seesaw: sharp X ↔ smeared P | Heisenberg's uncertainty |
| 3 | 14–24 | RULE — Δx · Δp ≥ ℏ/2 | Big formula card | Here's the rule |
| 4 | 24–34 | PIN — position sharp → momentum smear | Particle pin then smear | Pin the position |
| 5 | 34–42 | NOT ERROR — nature's hard limit | Cross on microscope myth | It's not a bad |
| 6 | 42–45 | DONE — know one, unknow the other | Check + ℏ badge | Heisenberg's principle |

- Why this option: clearest beginner arc (tradeoff → formula → myth-bust); notebook chrome fits study-notes STEM; farthest from recent chalk/Marvel/arena

### OPTION 2 — "Broadcast: Quantum Limit"
- Hook: news-desk explainer
- **UI recipe:** broadcast-desk / none / chapter-chip / bottom-card / bottom-left-wing / thin-bar / lab-cyan
- Why not locked: broadcast energy fights formula reading; chapter-chip overlaps Option 1 callout family less distinctly than notebook restyle

### OPTION 3 — "Arena Ranked: Uncertainty Lobby"
- Hook: competitive gaming HUD for Δx vs Δp
- **UI recipe:** dark-arena / scoreboard-hud / neon-pill / bottom-card / bottom-center / thin-bar / arena-neon
- Why not locked: anti-sameness fail vs recent Newton's ranked reel

## Locked choice
Option 1 — strongest concept → formula → myth-bust arc + UI recipe farthest from chalk/Marvel/arena; user asked to create finished reel

## Voice shortlist (from GET /v1/voices)
1. **River** `SAz9YHcvj6GT2YYXdXww` — Relaxed, Neutral, Informative ✅ quantum calm clarity
2. Matilda `XrExE9yKIg1WjnnlVkGX` — Knowledgable, Professional
3. Bella `hpp4J3VqNfWAUOO0d1Us` — Professional, Bright, Warm

## UI recipe (locked)

| Slot | Choice | Implementation note |
|------|--------|---------------------|
| Stage | notebook-paper | Kraft/cream lined paper + margin rule + paper grain |
| Header | minimal-eyebrow | Small ink label "HEISENBERG · UNCERTAINTY" top-left |
| Callout | chapter-chip | Rounded ink chip for beat labels (WAIT / LAW / ΔxΔp / PIN / MYTH / DONE) |
| Caption | typewriter-strip | Monospace strip along lower safe area, perforated edge |
| Character seat | absent-on-diagram-beats | Hide mascot on formula/tradeoff beats; peek only on hook + closer |
| Progress | tick-rail | Vertical tick marks along left margin |
| Palette | warm-paper | Kraft `#e8dcc8` / ink `#1c1917` / coral accent `#c45c3e` / muted rule `#a89880` |

## Director shot list (locked option — every cell filled)

| # | Shot | Focal point | Hierarchy (1→2→3) | Motion | Cut/hold | Negative space | UI beat note |
|---|------|-------------|--------------------|--------|----------|----------------|--------------|
| 1 | Hook | Heisenberg portrait in taped photo frame | portrait → "?" chip → caption | photo slides up; ? pulses | fast cut ≤4s | right margin quiet | chapter-chip "WAIT"; character peek |
| 2 | Tradeoff | Seesaw: sharp position ↔ smeared momentum | seesaw → labels X/P → caption | seesaw tips L then R on cue | hold | paper margins clear | chapter-chip "LAW"; character absent |
| 3 | Formula | Giant Δx · Δp ≥ ℏ/2 | formula → ℏ note → caption | formula ink-draws in | hold | sides of card quiet | chapter-chip "ΔxΔp"; character absent |
| 4 | Pin | Particle pinned sharp then momentum cloud | pin particle → smear cloud → caption | pin slam then blur expand | hold | top third quiet | chapter-chip "PIN"; character absent |
| 5 | Myth | Crossed-out microscope myth card | myth card → hard-limit stamp → caption | cross slams on "microscope" | hold | sides quiet | chapter-chip "MYTH"; character absent |
| 6 | Closer | Check + "KNOW ONE / UNKNOW OTHER" | badge → character thumb → caption | badge stamp + character lean-in | short hold | corners quiet | chapter-chip "DONE"; character peek |

## Research sources (Exa)

- https://openstax.org/books/university-physics-volume-3/pages/7-2-the-heisenberg-uncertainty-principle — Δx Δp ≥ ℏ/2; not apparatus error; wave nature / wave packet
- https://mathsisfun.com/physics/heisenberg-uncertainty.html — beginner form σx σp ≥ h/4π (= ℏ/2); better position → worse momentum
- https://brilliant.org/wiki/heisenberg-uncertainty-principle/ — σx σp ≥ ℏ/2 conjugate variables overview

## Asset cast (verified against inventory — real paths only)

| # | Role | Path | Meaning in beat | Source |
|---|------|------|-----------------|--------|
| 1 | UI accent | shape-characters/PNG/Default/tile_exclamation.png | urgency on WAIT | Kenney |
| all | Character | shape-characters/PNG/Default/blue_body_squircle.png (+face_a, +blue_hand_point/open) | teacher (hook/closer only) | Kenney |
| 2 | Support | game-icons/PNG/Black/2x/question.png | unknown / uncertainty | Kenney |
| 3 | Support | game-icons/PNG/Black/2x/target.png | pin position | Kenney |
| 4 | Support | game-icons/PNG/Black/2x/cross.png | myth bust (not microscope) | Kenney |
| 5 | Support | game-icons/PNG/Black/2x/checkmark.png | closer confirmation | Kenney |
| 6 | Support | game-icons/PNG/Black/2x/arrowLeft.png | seesaw / tradeoff | Kenney |
| 7 | Support | game-icons/PNG/Black/2x/arrowRight.png | seesaw / tradeoff | Kenney |
| 8 | Web (Exa) | assets/web/heisenberg_1933.jpg | Werner Heisenberg portrait (hook) | https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild183-R57262,_Werner_Heisenberg.jpg (Bundesarchiv Bild 183-R57262 / CC-BY-SA 3.0 DE) |

Verified: `cast ok: 11`

## Audio artifacts
- VO: outputs/audio/heisenberg_uncertainty_vo.mp3
- TTS alignment: outputs/audio/heisenberg_uncertainty_tts_alignment.json
- Forced alignment: outputs/audio/heisenberg_uncertainty_forced_alignment.json (loss ≈ 1.10 — word timings inspected and remapped manually from cues)

## Audio-locked beat table
| # | t0–t1 | Caption | Diagram | Narration cue |
|---|-------|---------|---------|---------------|
| 1 | 0.099–4.219 | WAIT — cannot know everything at once | hook | Wait |
| 2 | 4.219–12.500 | LAW — position vs momentum tradeoff | tradeoff | Heisenberg's |
| 3 | 12.500–19.020 | ΔxΔp — Δx · Δp ≥ ℏ/2 | formula | Here's |
| 4 | 19.020–25.119 | PIN — pin one, smear the other | pin | Pin |
| 5 | 25.119–30.299 | MYTH — not a bad microscope | myth | It's |
| 6 | 30.299–34.299 | DONE — know one, unknow the other | closer | Heisenberg's |

DURATION = 34.299 (last word end 33.899 + 0.4s)
