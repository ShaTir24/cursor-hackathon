# MentorScroll 2D Plan — CAP Theorem (Marvel Heroes Edition)

- **Status:** LOCKED
- **Duration target:** 45s
- **Skill level:** beginner
- **Audience / theme:** gaming / pop-culture (Marvel-inspired personas; Kenney shapes only — no Marvel IP art)
- **Voice:** Charlie - Deep, Confident, Energetic (`IKne3meq5aSn9XLyUdCD`) — comic-trailer narrator energy; clear enough for systems teaching
- **TTS model:** eleven_multilingual_v2
- **Timing source:** tts-with-timestamps → forced-alignment refine
- **Music:** none
- **UI recipe:** poster-wall / none / corner-tab / speech-bubble / mid-side-peek / chapter-dots / mono-poster
- **Anti-sameness:** vs `cap_theorem_20260718.md` (whiteboard-lab / tape-label / stamp / diagram-footer / bottom-left-wing / tick-rail / lab-cyan), `indian_freedom_fighters_marvel_20260718.md` (indigo night + gold badge card), `newtons_laws_ranked_20260718.md` (dark-arena / scoreboard-hud / neon-pill / bottom-card) — changed stage, header (none), callout, caption, seat, progress, and palette. Topic may echo CAP facts; chrome must not.

## Narration script (full)

Wait.
What if CAP theorem had an Avengers team?

Vision is Consistency.
One source of truth. Every read gets the same latest write.

Spider-Man is Availability.
Friendly neighborhood always-on. The system keeps answering — even when something's wrong.

Doctor Strange is Partition tolerance.
When the network splits, he holds the system together. P is non-negotiable.

Here's the catch.
When a partition hits, you cannot keep both Vision and Spider-Man.
Bank ledger? Pick Vision — that's CP.
Social likes? Pick Spider-Man — that's AP.
You pick two. Never all three.

CAP theorem. Assemble the tradeoff. Not against it.

## Options

### OPTION 1 — "Avengers of CAP" ✅ LOCKED
- Hook: WAIT + team assemble — CAP as three heroes with a hard rule
- **UI recipe:** poster-wall / none / corner-tab / speech-bubble / mid-side-peek / chapter-dots / mono-poster
- Beats (provisional):

| # | t0–t1 | Caption | Diagram (SVG) | Narration cue |
|---|-------|---------|---------------|---------------|
| 1 | 0–4 | WAIT — CAP theorem… Avengers team? | Poster frame + C/A/P silhouette slots | Wait |
| 2 | 4–12 | VISION · Consistency — one source of truth | Yellow circle hero + synced node values | Vision |
| 3 | 12–20 | SPIDER-MAN · Availability — always answering | Red squircle hero + heartbeat nodes | Spider-Man |
| 4 | 20–28 | DOCTOR STRANGE · Partition — holds the split | Green square hero + split link portal | Doctor Strange |
| 5 | 28–40 | CATCH — bank = CP · likes = AP | Triangle: Vision vs Spider-Man under Strange | Here's the catch |
| 6 | 40–45 | CAP — assemble the tradeoff | Triangle settle + check | CAP theorem |

- Why this option: clearest hero↔property mapping; poster-wall + speech-bubble reads comic without Marvel IP art; examples land the CP/AP tradeoff

### OPTION 2 — "Ranked Lobby: Pick Two"
- Hook: competitive lobby, pick CP or AP loadout
- **UI recipe:** dark-arena / scoreboard-hud / neon-pill / bottom-card / bottom-center / thin-bar / arena-neon
- Why not locked: same chrome family as recent Newton's ranked reel (anti-sameness fail)

### OPTION 3 — "Lab Briefing: Marvel Personas"
- Hook: whiteboard lab with hero stickers
- **UI recipe:** whiteboard-lab / tape-label / stamp / diagram-footer / bottom-left-wing / tick-rail / lab-cyan
- Why not locked: identical chrome to plain CAP reel from today

## Locked choice
Option 1 — strongest Marvel mnemonic + UI recipe farthest from today's CAP lab and Newton's arena; user asked to generate finished reel

## Voice shortlist (from GET /v1/voices)
1. **Charlie** `IKne3meq5aSn9XLyUdCD` — Deep, Confident, Energetic ✅ comic-trailer vibe
2. Liam `TX3LPaxmHKxFdv7VOQHJ` — Energetic social-media creator
3. Adam `pNInz6obpgDQGcFmaJgB` — Dominant, Firm (Boss explainer)

## UI recipe (locked)

| Slot | Choice | Implementation note |
|------|--------|---------------------|
| Stage | poster-wall | Near-black wall with faint comic-panel grid + soft spot glow; poster-ish hero zone |
| Header | none | Title lives in diagram/callout only (no top HUD strip) |
| Callout | corner-tab | Dog-eared corner tab top-right for beat labels (WAIT / C / A / P / CATCH / CAP) |
| Caption | speech-bubble | Comic speech bubble lower-third (tail toward mid-side character) |
| Character seat | mid-side-peek | Host mascot peeks from mid-right; diagram owns center-left |
| Progress | chapter-dots | Horizontal dots under bubble; advance per beat |
| Palette | mono-poster | Near-black `#0e0e12` → `#1a1a22`, cream ink `#f2efe6`, single spot accent `#e8a317` (comic gold) |

## Director shot list (locked option — every cell filled)

| # | Shot | Focal point | Hierarchy (1→2→3) | Motion | Cut/hold | Negative space | UI beat note |
|---|------|-------------|--------------------|--------|----------|----------------|--------------|
| 1 | Hook | Gold "WAIT" poster badge pulse | badge → empty C/A/P silhouette slots → caption | badge pulse ×2; slots breathe | fast cut ≤4s | wall sides quiet; no icon soup | corner-tab "WAIT" |
| 2 | Vision / C | Yellow circle "Vision" persona + synced value | yellow hero → lock/check sync nodes → caption | hero slides in; nodes snap to same value at "truth" | hold | sides of poster clear | corner-tab "C" |
| 3 | Spider / A | Red squircle "Spider-Man" persona + pulse rings | red hero → online signal nodes → caption | hero pops in; rings pulse at "always-on" | hold; diagram swap | keep corners empty | corner-tab "A" |
| 4 | Strange / P | Green square "Strange" persona + split portal | green hero → broken link + warning → caption | portal split animates at "splits"; hero holds gap | hold; diagram swap | portal owns middle | corner-tab "P" |
| 5 | Catch | CAP triangle: drop C or A under P | triangle → bank CP / likes AP cards → caption | triangle draws; CP/AP cards slam at cues | hold; longest beat | quiet above triangle | corner-tab "CATCH" |
| 6 | Closer | CAP assemble badge + check | badge → muted trio dots → caption | badge slam; check fades in | short hold to audio end | lower bubble only; top quiet | corner-tab "CAP" |

## Research sources (Exa)

- https://www.ibm.com/think/topics/cap-theorem — C/A/P definitions; CP vs AP during partition; P required in real systems
- https://www.cs.cornell.edu/courses/cs6464/2009sp/papers/brewer.pdf — Gilbert/Lynch formalization: cannot have atomic consistency + availability under partitions
- https://www.systemdesignhandbook.com/blog/cap-theorem-in-distributed-systems/ — beginner framing: P non-negotiable; choose C or A when partition hits
- https://www.marvel.com/characters/vision — Vision: synthezoid / Mind Stone / flawless computer brain → Consistency persona (research only; no artwork shipped)
- https://www.marvel.com/characters/spider-man-peter-parker — Spider-Man: friendly neighborhood always-there hero; red+blue costume colors → Availability persona (research only)
- https://www.marvel.com/characters/doctor-strange-stephen-strange/in-comics/profile — Doctor Strange: Sorcerer Supreme holding mystical threats / timelines → Partition tolerance persona (research only)

**Licensing note:** No Marvel posters, logos, or copyrighted character art downloaded or shipped. Heroes are Kenney shape-characters + SVG in Marvel-inspired colors/personas only.

## Asset cast (verified against inventory — real paths only)

| # | Role | Path | Meaning in beat | Source |
|---|------|------|-----------------|--------|
| all | Character (host) | shape-characters/PNG/Default/blue_body_squircle.png (+ face_a + blue_hand_point/open) | narrator mascot mid-side peek | Kenney |
| 1 | UI accent | shape-characters/PNG/Default/tile_exclamation.png | urgency on WAIT | Kenney |
| 2 | Hero (Vision / C) | shape-characters/PNG/Default/yellow_body_circle.png + hand_yellow_point.png + face_b.png | Consistency — gold/yellow Mind-Stone vibe | Kenney |
| 2 | Support | game-icons/PNG/White/2x/locked.png | single source of truth / locked value | Kenney |
| 2 | Support | game-icons/PNG/White/2x/checkmark.png | reads agree | Kenney |
| 3 | Hero (Spider / A) | shape-characters/PNG/Default/red_body_squircle.png + red_hand_open.png + face_c.png | Availability — red web-slinger persona | Kenney |
| 3 | Support | game-icons/PNG/White/2x/signal3.png | always responding / online | Kenney |
| 3 | Support | game-icons/PNG/White/2x/unlocked.png | stays available | Kenney |
| 4 | Hero (Strange / P) | shape-characters/PNG/Default/green_body_square.png + green_hand_point.png + face_d.png | Partition — gold+green sorcerer persona | Kenney |
| 4 | Support | game-icons/PNG/White/2x/warning.png | network split danger | Kenney |
| 5 | Support | game-icons/PNG/White/2x/cross.png | cannot keep both C and A | Kenney |
| 5 | Support | game-icons/PNG/White/2x/star.png | CP/AP pick marker | Kenney |
| 6 | Support | game-icons/PNG/White/2x/trophy.png | assemble / mastery closer | Kenney |

Verified: `cast ok: 22`. No Web (Exa) imagery — Marvel art forbidden; CAP is abstract (SVG diagrams).

## Audio artifacts
- VO: outputs/audio/cap_theorem_marvel_vo.mp3
- TTS alignment: outputs/audio/cap_theorem_marvel_tts_alignment.json
- Forced alignment: outputs/audio/cap_theorem_marvel_forced_alignment.json (loss ≈ 0.29)
- Script: outputs/audio/cap_theorem_marvel_script.txt
- DURATION: 49.979s (last word end + 0.4s)

## Audio-locked beat table

| # | t0–t1 | Caption | Diagram | Cue word @ time | Motion cue |
|---|-------|---------|---------|-----------------|------------|
| 1 | 0.099–3.559 | WAIT — CAP… Avengers team? | hook | Wait @ 0.099 | badge pulse |
| 2 | 3.559–10.239 | VISION · C — one source of truth | vision | Vision @ 3.559 | sync @ truth 6.659 |
| 3 | 10.239–19.779 | SPIDER-MAN · A — always answering | spider | Spider-Man @ 10.239 | pulse @ always-on 14.239 |
| 4 | 19.779–28.559 | STRANGE · P — holds the split | strange | Doctor @ 19.779 | split @ splits 23.439 |
| 5 | 28.559–46.039 | CATCH — bank CP / likes AP | catch | Here's @ 28.559 | Bank @ 35.139 · Social @ 38.879 |
| 6 | 46.039–49.979 | CAP — assemble the tradeoff | closer | CAP @ 46.039 | Assemble @ 47.360 |
