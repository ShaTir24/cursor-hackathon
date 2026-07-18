# MentorScroll 2D Plan — Special Theory of Relativity

- **Status:** LOCKED
- **Duration target:** 45s
- **Skill level:** beginner
- **Audience / theme:** STEM / physics classroom (chalkboard explainer)
- **Voice:** Alice - Clear, Engaging Educator (`Xb7hH8MSUJpSbSDYk0k2`) — calm British educator for crisp physics concepts
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none
- **UI recipe:** chalkboard / chalk-banner / chalk-underline / lower-third-bar / bottom-right-wing / chapter-dots / ink-chalk
- **Anti-sameness:** vs `cap_theorem_20260718.md` (whiteboard-lab / tape-label / stamp / diagram-footer) and `cap_theorem_marvel_20260718.md` (poster-wall / corner-tab / speech-bubble) — changed stage, header, callout, caption, seat, and palette

## Narration script (full)

Wait.
In nineteen oh five, Einstein rewrote space and time.

Two rules. Special relativity.
One: the laws of physics are the same in every steady frame.
Two: light always travels at C — for every observer.

So clocks disagree.
A moving clock ticks slower. That's time dilation.

And moving rulers shrink along the direction of motion. Length contraction.

Mass holds energy.
E equals m c squared.

Special relativity. Space and time are not absolute.

## Options

### OPTION 1 — "Two Rules Rewrite Reality" ✅ LOCKED
- Hook: WAIT + chalk underline "C IS CONSTANT" — relativity as a classroom revelation
- **UI recipe:** chalkboard / chalk-banner / chalk-underline / lower-third-bar / bottom-right-wing / chapter-dots / ink-chalk
- Beats (provisional):

| # | t0–t1 | Caption | Diagram (SVG) | Narration cue |
|---|-------|---------|---------------|---------------|
| 1 | 0–4 | WAIT — Einstein rewrote space and time | 1905 portrait + chalk "1905" | Wait |
| 2 | 4–16 | TWO RULES — same physics · light = C | Dual postulate cards | Two rules |
| 3 | 16–26 | TIME DILATION — moving clocks tick slower | Light-clock vs ship clock | So clocks |
| 4 | 26–36 | LENGTH — rulers shrink along motion | Ship foreshortens | And moving |
| 5 | 36–42 | E = mc² — mass holds energy | Big formula reveal | Mass holds |
| 6 | 42–45 | RELATIVITY — space & time not absolute | Badge + check | Special relativity |

- Why this option: classic chalkboard physics classroom; light-clock + ship diagrams teach the core; ink-chalk palette fits Einstein lore

### OPTION 2 — "Light Always Wins"
- Hook: race metaphor — car vs light beam (weaker formula payoff)
- **UI recipe:** broadcast-desk / none / chapter-chip / lower-third-bar / bottom-left-wing / thin-bar / lab-cyan
- Why not: news-desk energy fights dense diagram reading

### OPTION 3 — "GPS Needs This"
- Hook: GPS fails without relativity (application-first, less concept clarity)
- **UI recipe:** notebook-paper / minimal-eyebrow / chapter-chip / typewriter-strip / absent-on-diagram-beats / none / warm-paper
- Why not: application hook crowds out postulates → dilation → E=mc² arc

## Locked choice
Option 1 — strongest beginner arc (postulates → dilation → contraction → E=mc²) + chalk-talk UI farthest from recent whiteboard/Marvel/arena chrome; user asked to create finished reel

## UI recipe (locked)

| Slot | Choice | Implementation note |
|------|--------|---------------------|
| Stage | chalkboard | Deep green board + chalk dust grain + faint grid |
| Header | chalk-banner | Cream chalk title bar "SPECIAL RELATIVITY" |
| Callout | chalk-underline | Hand-drawn underline accent under beat label |
| Caption | lower-third-bar | Full-width cream bar, chalk ink text |
| Character seat | bottom-right-wing | Blue squircle teacher, right wing |
| Progress | chapter-dots | 6 chalk dots along left edge |
| Palette | ink-chalk | Deep green `#1a3d2e` / cream `#f3efe3` / chalk white / coral accent `#e07a5f` |

## Director shot list (locked option — every cell filled)

| # | Shot | Focal point | Hierarchy (1→2→3) | Motion | Cut/hold | Negative space | UI beat note |
|---|------|-------------|--------------------|--------|----------|----------------|--------------|
| 1 | Hook | Einstein 1905 portrait framed on chalk | portrait → "1905" chalk date → caption | portrait fades up, date chalks in | fast cut ≤4s | left third quiet (dots only) | callout "WAIT" chalk-underline |
| 2 | Postulates | Two chalk cards: PHYSICS SAME / c CONSTANT | dual cards → light beam between → caption | cards slide in L then R; beam pulse | hold ~12s | board margins clear | callout → "2 RULES" |
| 3 | Time dilation | Light-clock diamond path vs ship | light-clock → γ label → caption | photon bounces on clock; ship drifts R | hold ~10s | top board quiet | callout → "TIME" |
| 4 | Length | Foreshortened rocket along motion | rocket shrinks → L vs L₀ labels → caption | rocket compresses on cue | hold ~10s | sky above rocket clear | callout → "LENGTH" |
| 5 | E=mc² | Giant chalk formula E=mc² | formula → mass→energy arrows → caption | formula scales in from chalk dust | hold ~6s | sides of formula quiet | callout → "E=mc²" |
| 6 | Closer | Check + "NOT ABSOLUTE" badge | badge → character point → caption | badge stamp + character lean | short hold | corners quiet | callout → "DONE" |

## Research sources (Exa)

- https://openstax.org/books/college-physics/pages/28-introduction-to-special-relativity — Einstein 1905; special = constant velocity; two postulates; time dilation / length contraction overview
- https://openstax.org/books/physics/pages/10-2-consequences-of-special-relativity — Δt=γΔt₀; L=L₀/γ; E₀=mc² rest energy
- https://www.phys.unsw.edu.au/einsteinlight/jw/module4_time_dilation.htm — light-clock / Pythagoras derivation intuition for time dilation

## Asset cast (verified against inventory — real paths only)

| # | Role | Path | Meaning in beat | Source |
|---|------|------|-----------------|--------|
| 1 | UI accent | shape-characters/PNG/Default/tile_exclamation.png | urgency on WAIT | Kenney |
| all | Character | shape-characters/PNG/Default/blue_body_squircle.png (+face_a, +blue_hand_point/open) | teacher | Kenney |
| 2 | Support | game-icons/PNG/White/2x/star.png | postulate highlight | Kenney |
| 3 | Support | game-icons/PNG/White/2x/checkmark.png | closer confirmation | Kenney |
| 4 | Support | game-icons/PNG/White/2x/arrowRight.png | motion / energy direction | Kenney |
| 5 | Support | game-icons/PNG/White/2x/warning.png | clocks disagree beat accent | Kenney |
| 6 | Web (Exa) | assets/web/einstein_1905.jpg | 1905 Einstein portrait (hook) | https://commons.wikimedia.org/wiki/File:Einstein_patentoffice.jpg (public domain) |

Verified: `cast ok: 9`

## Audio artifacts
- VO: outputs/audio/special_relativity_vo.mp3
- TTS alignment: outputs/audio/special_relativity_tts_alignment.json
- Forced alignment: outputs/audio/special_relativity_forced_alignment.json (loss ≈ 0.108)

## Audio-locked beat table
| # | t0–t1 | Caption | Diagram | Narration cue |
|---|-------|---------|---------|---------------|
| 1 | 0.099–4.920 | WAIT — Einstein rewrote space and time | hook (1905 portrait) | Wait |
| 2 | 4.920–16.940 | TWO RULES — same physics · light = C | postulates | Two rules |
| 3 | 16.940–22.379 | TIME DILATION — moving clocks tick slower | dilation | So clocks |
| 4 | 22.379–27.819 | LENGTH — rulers shrink along motion | length | And moving |
| 5 | 27.819–32.200 | E = mc² — mass holds energy | emc2 | Mass holds |
| 6 | 32.200–36.740 | RELATIVITY — space & time not absolute | closer | Special relativity |

DURATION = 36.74 (last word end 36.340 + 0.4s)
