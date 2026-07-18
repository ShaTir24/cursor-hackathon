# MentorScroll 2D Plan — Newton's Three Laws

- **Status:** LOCKED
- **Duration target:** 45s
- **Skill level:** beginner
- **Voice:** Adam - Dominant, Firm (`pNInz6obpgDQGcFmaJgB`) — authoritative social-media energy for “Boss” explainer
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none

## Narration script (full)

Wait.
Newton's three laws run your life.

Law one. Inertia.
Stuff keeps doing what it's doing… unless a force interferes.
A puck slides forever… until something stops it.

Law two. F equals m a.
Push harder… and you accelerate more.
Heavier mass… means less speed from the same push.

Law three. Action and reaction.
Every push creates an equal push back.
You push the world… the world pushes you.

Master these three.
Master motion.

## Options

### OPTION 1 — "The Universe Has Rules" ✅ LOCKED
- Hook: WAIT flash + teacher wave / point
- Beats (provisional → audio-locked below):

| # | t0–t1 | Caption | Diagram (SVG) | Kenney sprites | Narration cue |
|---|-------|---------|---------------|----------------|---------------|
| 1 | 0–4 | WAIT — Newton's 3 laws run YOUR life | Pulsing "3 LAWS" ring | `shape-characters/PNG/Default/tile_exclamation.png`, `game-icons/PNG/White/2x/question.png`, `blue_body_squircle.png`, `face_a.png`, `blue_hand_point.png` | Wait |
| 2 | 4–14 | LAW 1 · INERTIA | Puck slides until FORCE | `arrowRight.png`, `checkmark.png`, `blue_hand_open.png` | Law one |
| 3 | 14–25 | LAW 2 · F = ma | Light vs heavy acceleration | `arrowRight.png`, `star.png`, `blue_hand_point.png` | Law two |
| 4 | 25–36 | LAW 3 · ACTION / REACTION | Equal opposite arrows | `arrowLeft.png`, `arrowRight.png`, `blue_hand_open.png` | Law three |
| 5 | 36–45 | BOSS MOVE — Master these three | MASTER MOTION badge | `trophy.png`, `star.png`, `blue_hand_point.png` | Master these |

- Visual strategy: physics classroom board, gold callouts, orbiting orbs, 1080×1920
- Why: clean three-act law breakdown + distinct diagram every beat

### OPTION 2 — "Stop Getting Newton Wrong"
- Hook: everyday fails (seatbelt / walking) — weaker diagram variety

### OPTION 3 — "3 Laws That Quietly Own You"
- Hook: rapid daily-moment montage — harder with limited sprite set

## Locked choice
Option 1 — strongest diagram sequence for Kenney + SVG; user asked to create the reel

## Voice shortlist (from GET /v1/voices)
1. **Adam** `pNInz6obpgDQGcFmaJgB` — Dominant, Firm ✅
2. Daniel `onwK4e9ZLuTAKqWW03F9` — Steady Broadcaster (educational)
3. Chris `iP95p4xoKVk53GoZ742B` — Charming, Down-to-Earth

## Audio artifacts
- VO: `outputs/audio/newtons_laws_vo.mp3`
- Script: `outputs/audio/newtons_laws_script.txt`
- TTS alignment: `outputs/audio/newtons_laws_tts_alignment.json`
- Forced alignment: `outputs/audio/newtons_laws_forced_alignment.json`

## Audio-locked beat table

Source: forced alignment on Adam VO (`newtons_laws_forced_alignment.json`). Duration **40.609s**.

| # | t0–t1 | Caption | Diagram | Narration cue |
|---|-------|---------|---------|---------------|
| 1 | 0.079–3.900 | WAIT — Newton's 3 laws run YOUR life | hook | Wait |
| 2 | 3.900–14.099 | LAW 1 · INERTIA | inertia | Law one |
| 3 | 14.099–25.680 | LAW 2 · F = ma | fma | Law two |
| 4 | 25.680–37.059 | LAW 3 · ACTION / REACTION | reaction | Law three |
| 5 | 37.059–40.609 | BOSS MOVE — Master these three | closer | Master these |

Artifacts: `outputs/audio/newtons_laws_vo.mp3`, `*_tts_alignment.json`, `*_forced_alignment.json`, `*_audio_locked_beats.json`
