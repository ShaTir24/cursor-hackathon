# MentorScroll 2D Plan — Newton's Laws of Motion (Ranked Gaming edition)

- **Status:** LOCKED
- **Audience theme:** `ages_15_18` · `theme_gaming_ranked` — "Elo climbs, loadouts, clutch moments = mastery" (from `age-themes.json`)
- **Duration target:** ~42s (audio-locked)
- **Skill level:** beginner (GenZ framing)
- **Voice:** Liam - Energetic, Social Media Creator (`TX3LPaxmHKxFdv7VOQHJ`) — confident social-media energy matches ranked-gaming hype
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none
- **Palette:** dark arena navy/charcoal + **neon green** accent (ranked UI)

## Narration script (full)

Ranked lobby. Physics edition.
Three laws decide every match in the universe.

Law one. Inertia.
Your character keeps drifting… until a force cancels the move.
No input… no change.

Law two. F equals m a.
That's your damage output. More force… more acceleration.
Heavier build… slower move speed.

Law three. Action and reaction.
Every hit has recoil. Push the world… and the world pushes back.

Learn the meta. Newton wrote the patch notes.
Rank up.

## Options

### OPTION 1 — "Newton Wrote the Patch Notes" ✅ LOCKED
- Hook: ranked-lobby splash, gamepad hero, "PHYSICS RANKED" badge
- Beats (provisional):

| # | t0–t1 | Caption | Diagram (SVG) | Narration cue |
|---|-------|---------|---------------|---------------|
| 1 | 0–5 | PHYSICS RANKED — 3 laws decide every match | Ranked splash ring | Ranked |
| 2 | 5–15 | LAW 1 · INERTIA — no input, no change | Player dot drifts until force cancels | Law one |
| 3 | 15–26 | LAW 2 · F = ma — damage output | Light vs heavy build acceleration bars | Law two |
| 4 | 26–36 | LAW 3 · ACTION / REACTION — every hit has recoil | Hit + equal knockback arrows | Law three |
| 5 | 36–42 | GG — Newton wrote the patch notes. RANK UP | Trophy + medals rank-up | Learn |

- Why: Kenney game-icons pack is literally ranked-UI (gamepad, medals, trophy) — perfect asset fit; gaming metaphors map 1:1 onto the three laws

### OPTION 2 — "Clutch Moments Are Just Physics"
- Hook: highlight-reel replay framing; each law = a clutch play breakdown
- Weaker: replay/kill-feed visuals need sprites inventory doesn't have

### OPTION 3 — "Your Loadout Obeys Newton"
- Hook: loadout screen; mass = gear weight, force = stats
- Weaker: item/gear icons (weapons, armor) not in CC0 packs on disk

## Locked choice
Option 1 — best 1:1 mapping between available Kenney sprites and the metaphor

## Director shot list (locked option — every cell filled)

| # | Shot | Focal point | Hierarchy (1→2→3) | Motion | Cut/hold | Negative space |
|---|------|-------------|--------------------|--------|----------|----------------|
| 1 | Hook splash | Gamepad in neon ring + "RANKED" badge | gamepad ring → character lean-in w/ point hand → caption | ring pulses ×2, gamepad pops in with slight rotation | fast cut ≤5s | top quarter quiet; ring centered in hero zone |
| 2 | Law 1 drift | Player dot drifting on lane | dot → joystick "no input" tag + force arrow slam at cue → caption | dot slides L→R constant speed; red force arrow slams in ~70% through beat and dot stops | hold, 1 event | lane sides clear; board quiet |
| 3 | Law 2 damage | Two acceleration bars (light vs heavy) | bars growing → F=ma formula chip + target icon → caption | light bar fills fast, heavy bar fills slow (same push); formula chip pulses once | hold, continuous compare | gap between bars; no icons near caption |
| 4 | Law 3 recoil | Center block hit by opposing arrows | arrows stretch in/out → "recoil" tags → caption | green action arrow and magenta reaction arrow stretch symmetrically, breathing loop | hold, symmetric loop | corners empty; symmetry reads instantly |
| 5 | Rank up | Trophy scaling up in ring | trophy → medals slide in + "RANK UP" badge → caption | trophy scales 1→1.1 pulse, medals slide from sides, ring brightens | hold to end, celebratory | ring isolated in hero zone |

**Continuity:** same arena stage (dark bg + scoreboard header + lane floor), same green squircle character bottom-anchored all beats; only hero-zone diagram + accent event changes per beat.

## Asset cast (verified against inventory — real paths only)

| # | Role | Sprite path (relative to kenney/assets/) | Meaning in beat |
|---|------|-------------------------------------------|-----------------|
| all | Character body | shape-characters/PNG/Default/green_body_squircle.png | gamer-green teacher |
| all | Character face | shape-characters/PNG/Default/face_a.png | friendly guide |
| 1,3,5 | Character hand | shape-characters/PNG/Default/green_hand_point.png | pointing at focal |
| 2,4 | Character hand | shape-characters/PNG/Default/green_hand_open.png | explaining |
| 5 | Character hand (swap) | shape-characters/PNG/Default/green_hand_rock.png | GG celebration |
| 1 | Hero | game-icons/PNG/White/2x/gamepad.png | ranked lobby |
| 1 | UI accent | game-icons/PNG/White/2x/exclamation.png | hook urgency |
| 2 | Support | game-icons/PNG/White/2x/joystick.png | "no input" |
| 2 | Support | game-icons/PNG/White/2x/arrowRight.png | cancelling force |
| 3 | Support | game-icons/PNG/White/2x/target.png | damage output |
| 4 | Support | game-icons/PNG/White/2x/arrowLeft.png | reaction force |
| 4 | Support | game-icons/PNG/White/2x/arrowRight.png | action force |
| 5 | Hero | game-icons/PNG/White/2x/trophy.png | rank up |
| 5 | Support | game-icons/PNG/White/2x/medal1.png | climb reward |
| 5 | Support | game-icons/PNG/White/2x/medal2.png | climb reward |

Verified: `cast ok: 14` (node existsSync check, 2026-07-18)

## Audio artifacts
- VO: outputs/audio/newtons_laws_ranked_vo.mp3
- Script: outputs/audio/newtons_laws_ranked_script.txt
- TTS alignment: outputs/audio/newtons_laws_ranked_tts_alignment.json
- Forced alignment: outputs/audio/newtons_laws_ranked_forced_alignment.json

## Audio-locked beat table

Source: forced alignment on Liam VO (loss 1.17). **Duration 41.909s.** Force-arrow slam event at **10.099s** ("force" word, beat 2).

| # | t0–t1 | Caption | Diagram | Narration cue |
|---|-------|---------|---------|---------------|
| 1 | 0.079–6.019 | PHYSICS RANKED — 3 laws decide every match | hook splash | Ranked |
| 2 | 6.019–14.359 | LAW 1 · INERTIA — no input, no change | drift + force slam @10.099 | Law one |
| 3 | 14.359–25.760 | LAW 2 · F = ma — damage output | light vs heavy bars | Law two |
| 4 | 25.760–37.139 | LAW 3 · ACTION / REACTION — every hit has recoil | symmetric recoil arrows | Law three |
| 5 | 37.139–41.909 | GG — Newton wrote the patch notes. RANK UP | trophy rank-up | Learn the meta |
