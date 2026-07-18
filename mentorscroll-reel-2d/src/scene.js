const WIDTH = 1080
const HEIGHT = 1920
/** Audio-locked to Charlie VO + forced alignment (plans/cap_theorem_marvel_20260718.md) */
const DURATION = 49.979
const FPS = 30
const TRUTH_T = 6.659
const ALWAYS_T = 14.239
const SPLITS_T = 23.439
const BANK_T = 35.139
const SOCIAL_T = 38.879
const ASSEMBLE_T = 47.36

const K = (rel) => `../assets/kenney/${rel}`

const BEATS = [
  {
    t0: 0.099,
    t1: 3.559,
    html: `<span class="law">WAIT</span>What if CAP theorem had an Avengers team?`,
    callout: 'WAIT',
    diagram: 'hook',
    hand: 'point',
    tick: 0,
  },
  {
    t0: 3.559,
    t1: 10.239,
    html: `<span class="law">VISION · C</span>Consistency — one source of truth. Same latest write everywhere.`,
    callout: 'C',
    diagram: 'vision',
    hand: 'point',
    tick: 1,
  },
  {
    t0: 10.239,
    t1: 19.779,
    html: `<span class="law">SPIDER-MAN · A</span>Availability — friendly neighborhood always-on. Keeps answering.`,
    callout: 'A',
    diagram: 'spider',
    hand: 'point',
    tick: 2,
  },
  {
    t0: 19.779,
    t1: 28.559,
    html: `<span class="law">STRANGE · P</span>Partition tolerance — holds the system together. P is non-negotiable.`,
    callout: 'P',
    diagram: 'strange',
    hand: 'point',
    tick: 3,
  },
  {
    t0: 28.559,
    t1: 46.039,
    html: `<span class="law">CATCH</span>Partition hits: bank → Vision (CP). Likes → Spider-Man (AP). Pick two.`,
    callout: 'CATCH',
    diagram: 'catch',
    hand: 'point',
    tick: 4,
  },
  {
    t0: 46.039,
    t1: 49.979,
    html: `<span class="law">CAP</span>Assemble the tradeoff. Not against it.`,
    callout: 'CAP',
    diagram: 'closer',
    hand: 'open',
    tick: 5,
  },
]

const HAND_SRC = {
  open: K('shape-characters/PNG/Default/blue_hand_open.png'),
  point: K('shape-characters/PNG/Default/blue_hand_point.png'),
}

const GOLD = '#e8a317'
const CREAM = '#f2efe6'
const INK = '#14141a'
const MUTE = '#6a6870'
const RED = '#c43c3c'
const GREEN = '#2f8f5b'
const FONT = 'Avenir Next Condensed, Trebuchet MS, sans-serif'

const diagramEl = document.getElementById('diagram')
const captionInner = document.getElementById('caption-inner')
const callout = document.getElementById('callout')
const calloutText = document.getElementById('callout-text')
const ticks = [...document.querySelectorAll('#progress > span')]
const body = document.getElementById('body')
const face = document.getElementById('face')
const hand = document.getElementById('hand')
const actor = document.getElementById('actor')

body.src = K('shape-characters/PNG/Default/blue_body_squircle.png')
face.src = K('shape-characters/PNG/Default/face_a.png')

function beatAt(t) {
  return BEATS.find((b) => t >= b.t0 && t < b.t1) || BEATS[BEATS.length - 1]
}

const img = (rel, x, y, size, extra = '') =>
  `<image href="${K(rel)}" x="${x}" y="${y}" width="${size}" height="${size}" ${extra}/>`

function posterFrame(op = 1) {
  return `
    <rect x="40" y="20" width="880" height="620" rx="8" fill="rgba(242,239,230,0.06)"
      stroke="${GOLD}" stroke-width="4" opacity="${op}"/>
    <rect x="56" y="36" width="848" height="588" rx="4" fill="none"
      stroke="${CREAM}" stroke-width="1.5" opacity="${0.25 * op}"/>
  `
}

function heroStack(bodyRel, faceRel, handRel, x, y, scale = 1) {
  const s = 160 * scale
  const fx = x + s * 0.22
  const fy = y + s * 0.14
  const hx = x + s * 0.72
  const hy = y + s * 0.42
  return `
    ${img(bodyRel, x, y, s)}
    ${img(faceRel, fx, fy, s * 0.55)}
    ${img(handRel, hx, hy, s * 0.42)}
  `
}

function node(cx, cy, label, fill = GOLD) {
  return `
    <circle cx="${cx}" cy="${cy}" r="44" fill="${fill}" opacity="0.95"/>
    <circle cx="${cx}" cy="${cy}" r="32" fill="${INK}"/>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${CREAM}" font-size="26" font-weight="800" font-family="${FONT}">${label}</text>
  `
}

/* Beat 1 — Hook: team assemble poster slots */
function svgHook(u) {
  const pulse = 1 + 0.07 * Math.sin(u * Math.PI * 4)
  const slotOp = Math.min(1, Math.max(0, (u - 0.2) / 0.45))
  const size = 150 * pulse
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    ${posterFrame()}
    <g transform="translate(480 170) scale(${pulse})">
      ${img('shape-characters/PNG/Default/tile_exclamation.png', -size / 2, -size / 2, size)}
    </g>
    <text x="480" y="290" text-anchor="middle" fill="${GOLD}" font-size="42" font-weight="900"
      font-family="${FONT}" letter-spacing="6" opacity="${Math.min(1, u * 2.5)}">AVENGERS OF CAP</text>
    <g opacity="${slotOp}">
      <rect x="120" y="340" width="200" height="220" rx="12" fill="none" stroke="${CREAM}" stroke-width="3" stroke-dasharray="10 8" opacity="0.55"/>
      <rect x="380" y="340" width="200" height="220" rx="12" fill="none" stroke="${CREAM}" stroke-width="3" stroke-dasharray="10 8" opacity="0.55"/>
      <rect x="640" y="340" width="200" height="220" rx="12" fill="none" stroke="${CREAM}" stroke-width="3" stroke-dasharray="10 8" opacity="0.55"/>
      <text x="220" y="460" text-anchor="middle" fill="${CREAM}" font-size="64" font-weight="900" font-family="${FONT}" opacity="0.45">C</text>
      <text x="480" y="460" text-anchor="middle" fill="${CREAM}" font-size="64" font-weight="900" font-family="${FONT}" opacity="0.45">A</text>
      <text x="740" y="460" text-anchor="middle" fill="${CREAM}" font-size="64" font-weight="900" font-family="${FONT}" opacity="0.45">P</text>
    </g>
  </svg>`
}

/* Beat 2 — Vision = Consistency */
function svgVision(u, t) {
  const slide = Math.min(1, u * 2.8)
  const synced = t >= TRUTH_T
  const snap = synced ? Math.min(1, (t - TRUTH_T) / 0.45) : 0
  const v1 = synced ? '42' : '7'
  const v2 = synced ? '42' : '19'
  const v3 = synced ? '42' : '3'
  const heroX = 60 + (1 - slide) * -120
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    ${posterFrame()}
    <g transform="translate(${heroX} 80)">
      ${heroStack(
        'shape-characters/PNG/Default/yellow_body_circle.png',
        'shape-characters/PNG/Default/face_b.png',
        'shape-characters/PNG/Default/hand_yellow_point.png',
        0,
        0,
        1.15,
      )}
      <text x="95" y="230" text-anchor="middle" fill="${GOLD}" font-size="28" font-weight="900" font-family="${FONT}">VISION</text>
      <text x="95" y="262" text-anchor="middle" fill="${CREAM}" font-size="22" font-weight="700" font-family="${FONT}">= Consistency</text>
    </g>
    <line x1="360" y1="220" x2="520" y2="160" stroke="${GOLD}" stroke-width="${3 + snap * 4}" opacity="0.55"/>
    <line x1="520" y1="160" x2="700" y2="220" stroke="${GOLD}" stroke-width="${3 + snap * 4}" opacity="0.55"/>
    <line x1="360" y1="220" x2="700" y2="220" stroke="${GOLD}" stroke-width="${2 + snap * 3}" opacity="0.3"/>
    ${node(360, 220, v1, synced ? GOLD : MUTE)}
    ${node(520, 160, v2, GOLD)}
    ${node(700, 220, v3, synced ? GOLD : MUTE)}
    ${img('game-icons/PNG/White/2x/locked.png', 460, 300, 90, `opacity="${0.25 + snap * 0.75}"`)}
    ${img('game-icons/PNG/White/2x/checkmark.png', 780, 380, 100, `opacity="${0.2 + snap * 0.8}"`)}
    <text x="560" y="520" text-anchor="middle" fill="${synced ? GOLD : MUTE}" font-size="32" font-weight="800" font-family="${FONT}">
      ${synced ? 'ONE SOURCE OF TRUTH' : 'SYNCING…'}
    </text>
  </svg>`
}

/* Beat 3 — Spider-Man = Availability */
function svgSpider(u, t) {
  const pop = Math.min(1, u * 3)
  const hit = t >= ALWAYS_T
  const pulse = 0.5 + 0.5 * Math.abs(Math.sin(t * 4.2))
  const unlock = hit ? Math.min(1, (t - ALWAYS_T) / 0.5) : 0.2
  const r1 = 64 + pulse * 36
  const r2 = 80 + (1 - pulse) * 30
  const heroX = 40 + (1 - pop) * -100
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    ${posterFrame()}
    <g transform="translate(${heroX} 70) scale(${0.92 + pop * 0.08})">
      ${heroStack(
        'shape-characters/PNG/Default/red_body_squircle.png',
        'shape-characters/PNG/Default/face_c.png',
        'shape-characters/PNG/Default/red_hand_open.png',
        0,
        0,
        1.15,
      )}
      <text x="95" y="230" text-anchor="middle" fill="${RED}" font-size="26" font-weight="900" font-family="${FONT}">SPIDER-MAN</text>
      <text x="95" y="262" text-anchor="middle" fill="${CREAM}" font-size="22" font-weight="700" font-family="${FONT}">= Availability</text>
    </g>
    <circle cx="420" cy="240" r="${r1}" fill="none" stroke="${RED}" stroke-width="4" opacity="${0.25 + pulse * 0.45}"/>
    <circle cx="660" cy="280" r="${r2}" fill="none" stroke="${GOLD}" stroke-width="4" opacity="${0.2 + (1 - pulse) * 0.4}"/>
    ${node(420, 240, 'OK', RED)}
    ${node(660, 280, 'OK', GOLD)}
    ${img('game-icons/PNG/White/2x/signal3.png', 780, 120, 90, `opacity="${0.35 + pulse * 0.5}"`)}
    ${img('game-icons/PNG/White/2x/unlocked.png', 780, 380, 100, `opacity="${unlock}"`)}
    <text x="560" y="520" text-anchor="middle" fill="${hit ? GOLD : MUTE}" font-size="32" font-weight="800" font-family="${FONT}">
      ${hit ? 'ALWAYS ANSWERING' : 'FRIENDLY NEIGHBORHOOD'}
    </text>
  </svg>`
}

/* Beat 4 — Doctor Strange = Partition */
function svgStrange(u, t) {
  const slide = Math.min(1, u * 2.5)
  const split = t >= SPLITS_T
  const gap = split ? Math.min(1, (t - SPLITS_T) / 0.55) : 0.12
  const leftX = 380 - gap * 50
  const rightX = 700 + gap * 50
  const heroX = 40 + (1 - slide) * -100
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    ${posterFrame()}
    <g transform="translate(${heroX} 70)">
      ${heroStack(
        'shape-characters/PNG/Default/green_body_square.png',
        'shape-characters/PNG/Default/face_d.png',
        'shape-characters/PNG/Default/green_hand_point.png',
        0,
        0,
        1.15,
      )}
      <text x="95" y="230" text-anchor="middle" fill="${GREEN}" font-size="24" font-weight="900" font-family="${FONT}">DR STRANGE</text>
      <text x="95" y="262" text-anchor="middle" fill="${CREAM}" font-size="22" font-weight="700" font-family="${FONT}">= Partition</text>
    </g>
    <ellipse cx="540" cy="240" rx="${140 + gap * 30}" ry="${90 + gap * 10}"
      fill="none" stroke="${GOLD}" stroke-width="5" opacity="0.55" stroke-dasharray="14 10"/>
    <line x1="${leftX + 44}" y1="240" x2="${540 - 28 * gap}" y2="240"
      stroke="${MUTE}" stroke-width="6" stroke-dasharray="${gap > 0.4 ? '12 10' : '0'}" opacity="0.85"/>
    <line x1="${540 + 28 * gap}" y1="240" x2="${rightX - 44}" y2="240"
      stroke="${MUTE}" stroke-width="6" stroke-dasharray="${gap > 0.4 ? '12 10' : '0'}" opacity="0.85"/>
    ${gap > 0.35 ? `<text x="540" y="230" text-anchor="middle" fill="${RED}" font-size="36" font-weight="900" font-family="${FONT}">✕</text>` : ''}
    ${node(leftX, 240, 'N1', GREEN)}
    ${node(rightX, 240, 'N2', GREEN)}
    ${img('game-icons/PNG/White/2x/warning.png', 490, 360, 100, `opacity="${0.3 + gap * 0.7}"`)}
    <text x="560" y="540" text-anchor="middle" fill="${split ? GOLD : MUTE}" font-size="30" font-weight="800" font-family="${FONT}">
      ${split ? 'HOLDS THE SPLIT — P REQUIRED' : 'NETWORK UNDER STRESS'}
    </text>
  </svg>`
}

/* Beat 5 — Catch: CP bank vs AP likes */
function svgCatch(u, t) {
  const draw = Math.min(1, u * 2.2)
  const bank = t >= BANK_T
  const social = t >= SOCIAL_T
  const bankOp = bank ? Math.min(1, (t - BANK_T) / 0.4) : 0
  const socialOp = social ? Math.min(1, (t - SOCIAL_T) / 0.4) : 0
  const crossOp = Math.min(1, Math.max(0, (u - 0.15) / 0.3))
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    ${posterFrame()}
    <polygon points="480,70 780,360 180,360" fill="rgba(232,163,23,0.08)" stroke="${GOLD}" stroke-width="5" opacity="${0.4 + draw * 0.6}"/>
    <text x="480" y="140" text-anchor="middle" fill="${GREEN}" font-size="48" font-weight="900" font-family="${FONT}">P</text>
    <text x="260" y="330" text-anchor="middle" fill="${GOLD}" font-size="48" font-weight="900" font-family="${FONT}">C</text>
    <text x="700" y="330" text-anchor="middle" fill="${RED}" font-size="48" font-weight="900" font-family="${FONT}">A</text>
    ${img('game-icons/PNG/White/2x/cross.png', 420, 200, 100, `opacity="${crossOp * 0.9}"`)}
    <g opacity="${bankOp}">
      <rect x="80" y="420" width="360" height="150" rx="14" fill="rgba(232,163,23,0.18)" stroke="${GOLD}" stroke-width="3"/>
      ${img('shape-characters/PNG/Default/yellow_body_circle.png', 100, 440, 90)}
      ${img('game-icons/PNG/White/2x/star.png', 360, 450, 70)}
      <text x="280" y="490" text-anchor="middle" fill="${CREAM}" font-size="28" font-weight="900" font-family="${FONT}">BANK → CP</text>
      <text x="280" y="530" text-anchor="middle" fill="${GOLD}" font-size="22" font-weight="700" font-family="${FONT}">Pick Vision</text>
    </g>
    <g opacity="${socialOp}">
      <rect x="520" y="420" width="360" height="150" rx="14" fill="rgba(196,60,60,0.18)" stroke="${RED}" stroke-width="3"/>
      ${img('shape-characters/PNG/Default/red_body_squircle.png', 540, 440, 90)}
      ${img('game-icons/PNG/White/2x/star.png', 800, 450, 70)}
      <text x="720" y="490" text-anchor="middle" fill="${CREAM}" font-size="28" font-weight="900" font-family="${FONT}">LIKES → AP</text>
      <text x="720" y="530" text-anchor="middle" fill="${RED}" font-size="22" font-weight="700" font-family="${FONT}">Pick Spider-Man</text>
    </g>
    ${!bank && !social ? `<text x="480" y="520" text-anchor="middle" fill="${MUTE}" font-size="30" font-weight="800" font-family="${FONT}">CANNOT KEEP BOTH C AND A</text>` : ''}
  </svg>`
}

/* Beat 6 — Closer */
function svgCloser(u, t) {
  const slam = Math.min(1, u * 3.5)
  const assemble = t >= ASSEMBLE_T
  const check = assemble ? Math.min(1, (t - ASSEMBLE_T) / 0.4) : slam * 0.35
  const bob = Math.sin(t * 3) * 6
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    ${posterFrame(0.5 + slam * 0.5)}
    <polygon points="480,90 740,400 220,400" fill="rgba(232,163,23,0.12)" stroke="${GOLD}" stroke-width="6" opacity="${0.5 + slam * 0.5}"/>
    <text x="480" y="170" text-anchor="middle" fill="${GREEN}" font-size="52" font-weight="900" font-family="${FONT}">P</text>
    <text x="280" y="360" text-anchor="middle" fill="${GOLD}" font-size="52" font-weight="900" font-family="${FONT}">C</text>
    <text x="680" y="360" text-anchor="middle" fill="${RED}" font-size="52" font-weight="900" font-family="${FONT}">A</text>
    ${img('game-icons/PNG/White/2x/checkmark.png', 420, 220, 110, `opacity="${check}"`)}
    ${img('game-icons/PNG/White/2x/trophy.png', 780, 100 + bob, 90, `opacity="${0.4 + check * 0.5}"`)}
    <circle cx="300" cy="500" r="18" fill="${GOLD}" opacity="${0.4 + check * 0.5}"/>
    <circle cx="480" cy="500" r="18" fill="${RED}" opacity="${0.4 + check * 0.5}"/>
    <circle cx="660" cy="500" r="18" fill="${GREEN}" opacity="${0.4 + check * 0.5}"/>
    <text x="480" y="580" text-anchor="middle" fill="${GOLD}" font-size="34" font-weight="900" font-family="${FONT}" letter-spacing="3">
      ASSEMBLE THE TRADEOFF
    </text>
  </svg>`
}

const DIAGRAMS = {
  hook: svgHook,
  vision: svgVision,
  spider: svgSpider,
  strange: svgStrange,
  catch: svgCatch,
  closer: svgCloser,
}

function frameAt(t) {
  const clamped = Math.max(0, Math.min(DURATION - 1e-6, t))
  const beat = beatAt(clamped)
  const u = Math.min(1, Math.max(0, (clamped - beat.t0) / Math.max(0.001, beat.t1 - beat.t0)))

  captionInner.innerHTML = beat.html
  calloutText.textContent = beat.callout
  callout.style.opacity = u < 0.12 ? String(u / 0.12) : u > 0.92 ? String((1 - u) / 0.08) : '1'
  callout.style.transform = `scale(${0.96 + u * 0.06})`

  hand.src = HAND_SRC[beat.hand]
  const wave = Math.sin(clamped * 5) * 12
  hand.style.transform = `rotate(${beat.hand === 'point' ? -16 + wave : wave}deg)`

  const lean = beat.diagram === 'hook' ? Math.min(1, u * 3) * 4 : 0
  actor.style.transform = `translateY(${Math.sin(clamped * 3) * 6}px) rotate(${lean}deg)`

  diagramEl.innerHTML = DIAGRAMS[beat.diagram](u, clamped)

  ticks.forEach((el, i) => {
    el.classList.toggle('on', i <= beat.tick)
  })
}

function visualOk() {
  // Vision nodes snap to same value after TRUTH cue
  frameAt(TRUTH_T - 0.4)
  const before = [...diagramEl.querySelectorAll('text')]
    .map((n) => n.textContent.trim())
    .filter((x) => /^\d+$/.test(x))
  frameAt(TRUTH_T + 0.6)
  const after = [...diagramEl.querySelectorAll('text')]
    .map((n) => n.textContent.trim())
    .filter((x) => /^\d+$/.test(x))
  const synced = after.length >= 3 && after.every((v) => v === '42') && before.some((v) => v !== '42')

  // Partition gap widens after SPLITS cue
  frameAt(SPLITS_T - 0.3)
  const nodesBefore = [...diagramEl.querySelectorAll('circle[r="44"]')].map((c) => Number(c.getAttribute('cx')))
  frameAt(SPLITS_T + 0.7)
  const nodesAfter = [...diagramEl.querySelectorAll('circle[r="44"]')].map((c) => Number(c.getAttribute('cx')))
  const gapGrew =
    nodesBefore.length >= 2 &&
    nodesAfter.length >= 2 &&
    Math.abs(nodesAfter[1] - nodesAfter[0]) > Math.abs(nodesBefore[1] - nodesBefore[0]) + 20

  // Catch cards appear at bank/social cues
  frameAt(BANK_T + 0.5)
  const bankText = diagramEl.textContent.includes('BANK')
  frameAt(SOCIAL_T + 0.5)
  const likesText = diagramEl.textContent.includes('LIKES')

  frameAt(0)
  return synced && gapGrew && bankText && likesText
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
