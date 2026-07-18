const WIDTH = 1080
const HEIGHT = 1920
/** Audio-locked to ElevenLabs Liam VO + forced alignment (plans/newtons_laws_ranked_20260718.md) */
const DURATION = 41.909
const FPS = 30
/** "force" word timestamp — Law 1 arrow-slam event */
const FORCE_T = 10.099

const K = (rel) => `../assets/kenney/${rel}`

const BEATS = [
  {
    t0: 0.079,
    t1: 6.019,
    html: `<span class="law">PHYSICS RANKED</span>3 laws decide every match in the universe`,
    callout: 'RANKED',
    diagram: 'hook',
    hand: 'point',
  },
  {
    t0: 6.019,
    t1: 14.359,
    html: `<span class="law">LAW 1 · INERTIA</span>No input… no change. Motion holds until a force cancels it`,
    callout: 'LAW 1',
    diagram: 'inertia',
    hand: 'open',
  },
  {
    t0: 14.359,
    t1: 25.76,
    html: `<span class="law">LAW 2 · F = ma</span>Your damage output: more force → more acceleration. Heavier build → slower`,
    callout: 'LAW 2',
    diagram: 'fma',
    hand: 'point',
  },
  {
    t0: 25.76,
    t1: 37.139,
    html: `<span class="law">LAW 3 · ACTION / REACTION</span>Every hit has recoil — the world pushes back, equally`,
    callout: 'RECOIL',
    diagram: 'reaction',
    hand: 'open',
  },
  {
    t0: 37.139,
    t1: 41.909,
    html: `<span class="law">GG</span>Newton wrote the patch notes. Rank up.`,
    callout: 'RANK UP',
    diagram: 'rankup',
    hand: 'rock',
  },
]

const HAND_SRC = {
  open: K('shape-characters/PNG/Default/green_hand_open.png'),
  point: K('shape-characters/PNG/Default/green_hand_point.png'),
  rock: K('shape-characters/PNG/Default/green_hand_rock.png'),
}

const NEON = '#3dff9d'
const MUTE = '#8fa3c7'
const DANGER = '#ff5d5d'
const MAGENTA = '#ff5dc8'
const FONT = 'Avenir Next, sans-serif'

const diagramEl = document.getElementById('diagram')
const captionInner = document.getElementById('caption-inner')
const callout = document.getElementById('callout')
const calloutText = document.getElementById('callout-text')
const progress = document.querySelector('#progress > i')
const body = document.getElementById('body')
const face = document.getElementById('face')
const hand = document.getElementById('hand')
const actor = document.getElementById('actor')

body.src = K('shape-characters/PNG/Default/green_body_squircle.png')
face.src = K('shape-characters/PNG/Default/face_a.png')

function beatAt(t) {
  return BEATS.find((b) => t >= b.t0 && t < b.t1) || BEATS[BEATS.length - 1]
}

// Kenney sprite embedded in the diagram SVG (white PNGs tinted via opacity groups)
const img = (rel, x, y, size, extra = '') =>
  `<image href="${K(rel)}" x="${x}" y="${y}" width="${size}" height="${size}" ${extra}/>`

/* Beat 1 — Hook splash: gamepad hero inside pulsing neon ring (ring pulses ×2) */
function svgHook(u) {
  const pulse = 1 + 0.08 * Math.sin(u * Math.PI * 4)
  const pop = Math.min(1, u * 5)
  const size = 260 * (0.6 + 0.4 * pop)
  const rot = (1 - pop) * -14
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <circle cx="480" cy="310" r="${210 * pulse}" fill="none" stroke="${NEON}" stroke-width="8" opacity="0.75"/>
    <circle cx="480" cy="310" r="${150 * pulse}" fill="${NEON}" opacity="0.08"/>
    <g transform="rotate(${rot} 480 310)">
      ${img('game-icons/PNG/White/2x/gamepad.png', 480 - size / 2, 310 - size / 2, size)}
    </g>
    ${img('game-icons/PNG/White/2x/exclamation.png', 720, 90, 84, `opacity="${0.5 + 0.5 * Math.abs(Math.sin(u * Math.PI * 4))}"`)}
    <text x="480" y="600" text-anchor="middle" fill="#d9ffe9" font-size="52" font-weight="800" font-family="${FONT}" letter-spacing="6">3 LAWS · 1 LOBBY</text>
  </svg>`
}

/* Beat 2 — Inertia: player dot drifts until the force arrow slams in at FORCE_T */
function svgInertia(u, t) {
  const beat = BEATS[1]
  const drift = Math.min(1, Math.max(0, (t - beat.t0) / (FORCE_T - beat.t0)))
  const x = 150 + drift * 470
  const hit = t >= FORCE_T
  const slam = hit ? Math.min(1, (t - FORCE_T) / 0.25) : 0
  const arrowTip = x + 52
  const arrowTail = arrowTip + 260 * (1 - slam) + 130
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="368" width="840" height="22" rx="8" fill="#1d2740"/>
    <rect x="60" y="368" width="840" height="4" fill="rgba(61,255,157,0.25)"/>
    <circle cx="${x}" cy="330" r="48" fill="${NEON}" opacity="0.92"/>
    <circle cx="${x}" cy="330" r="48" fill="none" stroke="#d9ffe9" stroke-width="4"/>
    ${img('game-icons/PNG/White/2x/joystick.png', 90, 90, 92, 'opacity="0.85"')}
    <text x="200" y="150" fill="${hit ? DANGER : MUTE}" font-size="32" font-weight="700" font-family="${FONT}">${hit ? 'FORCE INPUT!' : 'NO INPUT'}</text>
    ${
      hit
        ? `<g opacity="${slam}">
      <line x1="${arrowTail}" y1="330" x2="${arrowTip + 34}" y2="330" stroke="${DANGER}" stroke-width="14" stroke-linecap="round"/>
      <polygon points="${arrowTip},330 ${arrowTip + 42},306 ${arrowTip + 42},354" fill="${DANGER}"/>
    </g>`
        : `<text x="${x}" y="250" text-anchor="middle" fill="${MUTE}" font-size="26" font-family="${FONT}">still drifting…</text>`
    }
  </svg>`
}

/* Beat 3 — F = ma: light build accelerates fast, heavy build slow (same push) */
function svgFma(u) {
  const light = 560 * Math.min(1, u * 1.5)
  const heavy = 560 * Math.min(1, u * 0.55)
  const chipS = u < 0.2 ? 1 + 0.14 * Math.sin((u / 0.2) * Math.PI) : 1
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(480 90) scale(${chipS})">
      <rect x="-150" y="-52" width="300" height="86" rx="14" fill="rgba(61,255,157,0.12)" stroke="${NEON}" stroke-width="3"/>
      <text y="12" text-anchor="middle" fill="${NEON}" font-size="52" font-weight="800" font-family="Georgia, serif">F = ma</text>
    </g>
    <text x="120" y="250" fill="#d9ffe9" font-size="30" font-weight="700" font-family="${FONT}">LIGHT BUILD</text>
    <rect x="120" y="272" width="600" height="42" rx="10" fill="#1d2740"/>
    <rect x="120" y="272" width="${light}" height="42" rx="10" fill="${NEON}"/>
    ${img('game-icons/PNG/White/2x/target.png', 740, 250, 84, 'opacity="0.9"')}
    <text x="120" y="440" fill="${MUTE}" font-size="30" font-weight="700" font-family="${FONT}">HEAVY BUILD</text>
    <rect x="120" y="462" width="600" height="42" rx="10" fill="#1d2740"/>
    <rect x="120" y="462" width="${heavy}" height="42" rx="10" fill="${MUTE}"/>
    <text x="120" y="580" fill="#6f8aa8" font-size="26" font-family="${FONT}">same push · different acceleration</text>
  </svg>`
}

/* Beat 4 — Action/Reaction: symmetric recoil arrows breathing around a hit block */
function svgReaction(u, t) {
  const stretch = 46 + Math.sin(t * 2.4) * 22
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <text x="480" y="90" text-anchor="middle" fill="${NEON}" font-size="38" font-weight="800" font-family="${FONT}">ACTION = − REACTION</text>
    <rect x="420" y="240" width="120" height="160" rx="16" fill="#233252" stroke="rgba(217,255,233,0.4)" stroke-width="3"/>
    <g>
      ${img('game-icons/PNG/White/2x/arrowRight.png', 560 + stretch, 282, 76, 'opacity="0.95"')}
      <line x1="548" y1="320" x2="${560 + stretch}" y2="320" stroke="${NEON}" stroke-width="12" stroke-linecap="round"/>
      <text x="${640 + stretch}" y="250" fill="${NEON}" font-size="30" font-weight="700" font-family="${FONT}">HIT</text>
    </g>
    <g>
      ${img('game-icons/PNG/White/2x/arrowLeft.png', 324 - stretch, 282, 76, 'opacity="0.95"')}
      <line x1="412" y1="320" x2="${400 - stretch}" y2="320" stroke="${MAGENTA}" stroke-width="12" stroke-linecap="round"/>
      <text x="${230 - stretch}" y="250" fill="${MAGENTA}" font-size="30" font-weight="700" font-family="${FONT}">RECOIL</text>
    </g>
    <text x="480" y="520" text-anchor="middle" fill="${MUTE}" font-size="28" font-family="${FONT}">equal size · opposite direction · always</text>
  </svg>`
}

/* Beat 5 — Rank up: trophy hero scales in bright ring, medals slide in from sides */
function svgRankup(u, t) {
  const s = 1 + 0.1 * Math.sin(t * 3)
  const slide = Math.min(1, u * 3)
  const medalL = -140 + slide * 290
  const medalR = 1020 - slide * 290
  const size = 230 * s
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <circle cx="480" cy="300" r="200" fill="none" stroke="${NEON}" stroke-width="8" opacity="${0.4 + 0.5 * u}"/>
    <circle cx="480" cy="300" r="150" fill="${NEON}" opacity="${0.05 + 0.08 * u}"/>
    ${img('game-icons/PNG/White/2x/trophy.png', 480 - size / 2, 300 - size / 2, size)}
    ${img('game-icons/PNG/White/2x/medal1.png', medalL, 470, 96, `opacity="${slide}"`)}
    ${img('game-icons/PNG/White/2x/medal2.png', medalR, 470, 96, `opacity="${slide}"`)}
    <text x="480" y="620" text-anchor="middle" fill="#d9ffe9" font-size="54" font-weight="800" font-family="${FONT}" letter-spacing="8">RANK UP</text>
  </svg>`
}

const DIAGRAMS = {
  hook: svgHook,
  inertia: svgInertia,
  fma: svgFma,
  reaction: svgReaction,
  rankup: svgRankup,
}

function frameAt(t) {
  const clamped = Math.max(0, Math.min(DURATION - 1e-6, t))
  const beat = beatAt(clamped)
  const u = Math.min(1, Math.max(0, (clamped - beat.t0) / Math.max(0.001, beat.t1 - beat.t0)))

  captionInner.innerHTML = beat.html
  calloutText.textContent = beat.callout
  callout.style.opacity = u < 0.12 ? String(u / 0.12) : u > 0.92 ? String((1 - u) / 0.08) : '1'
  callout.style.transform = `translateX(-50%) scale(${0.97 + u * 0.05})`

  hand.src = HAND_SRC[beat.hand]
  const wave = Math.sin(clamped * 5) * 14
  hand.style.transform = `rotate(${beat.hand === 'point' ? -18 + wave : wave}deg)`

  // Character: subtle idle only (support layer); slight lean-in on hook
  const lean = beat.diagram === 'hook' ? Math.min(1, u * 3) * -6 : 0
  actor.style.transform = `translateX(-50%) translateY(${Math.sin(clamped * 3) * 8}px) rotate(${lean}deg)`

  diagramEl.innerHTML = DIAGRAMS[beat.diagram](u, clamped)
  progress.style.width = `${(clamped / DURATION) * 100}%`
}

function visualOk() {
  // Beat 2 drift dot must move between two nearby times
  frameAt(7.5)
  const xa = diagramEl.querySelector('circle')?.getAttribute('cx')
  frameAt(8.2)
  const xb = diagramEl.querySelector('circle')?.getAttribute('cx')
  // Force arrow must exist after FORCE_T
  frameAt(11)
  const hasArrow = !!diagramEl.querySelector('polygon')
  frameAt(0)
  return xa != null && xb != null && xa !== xb && hasArrow
}

async function boot() {
  try {
    await Promise.all(
      [body, face, hand].map(
        (el) =>
          new Promise((res) => {
            if (el.complete) res()
            else {
              el.onload = () => res()
              el.onerror = () => res()
            }
          }),
      ),
    )
    frameAt(0)
    window.__MS = {
      duration: DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
      frameAt,
      visualOk,
      beats: () => BEATS.map((b) => b.diagram),
    }
    window.__MS_READY = true
  } catch (e) {
    window.__MS_ERROR = String(e?.message || e)
  }
}

boot()
