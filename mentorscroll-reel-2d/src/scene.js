const WIDTH = 1080
const HEIGHT = 1920
/** Audio-locked to Laura VO + forced alignment (plans/birthday_paradox_20260718.md) */
const DURATION = 43.319
const FPS = 30

const K = (rel) => `../assets/kenney/${rel}`

const BEATS = [
  {
    t0: 0.099,
    t1: 9.0,
    html: `<span class="law">WAIT</span>23 people. ~50% chance two share a birthday.`,
    callout: 'WAIT',
    diagram: 'hook',
    hand: 'point',
    progress: 0.12,
    showActor: true,
  },
  {
    t0: 9.0,
    t1: 17.279,
    html: `<span class="law">GUT</span>~183 is the wrong question — that's matching YOUR day.`,
    callout: 'GUT',
    diagram: 'gut',
    hand: 'point',
    progress: 0.35,
    showActor: false,
  },
  {
    t0: 17.279,
    t1: 28.299,
    html: `<span class="law">PAIRS</span>Not one birthday — every pair. 23 → 253 pairs.`,
    callout: 'PAIRS',
    diagram: 'pairs',
    hand: 'open',
    progress: 0.58,
    showActor: false,
  },
  {
    t0: 28.299,
    t1: 39.52,
    html: `<span class="law">CLIMB</span>10 → ~12%. 23 → ~50%. 50 → ~97%.`,
    callout: 'CLIMB',
    diagram: 'climb',
    hand: 'point',
    progress: 0.82,
    showActor: false,
  },
  {
    t0: 39.52,
    t1: 43.319,
    html: `<span class="law">DONE</span>Pairs explode faster than you think.`,
    callout: 'DONE',
    diagram: 'closer',
    hand: 'open',
    progress: 1,
    showActor: true,
  },
]

const HAND_SRC = {
  open: K('shape-characters/PNG/Default/hand_yellow_open.png'),
  point: K('shape-characters/PNG/Default/hand_yellow_point.png'),
}

const INK = '#0b1f2a'
const CYAN = '#00a3c4'
const MUTE = '#5a7a88'
const BOARD = '#f4fbfd'
const WHITE = '#ffffff'
const FONT = 'DM Sans, system-ui, sans-serif'
const FONT_DISP = 'Space Grotesk, system-ui, sans-serif'
const FONT_MONO = 'IBM Plex Mono, ui-monospace, monospace'

const diagramEl = document.getElementById('diagram')
const captionInner = document.getElementById('caption-inner')
const callout = document.getElementById('callout')
const calloutText = document.getElementById('callout-text')
const progressEl = document.getElementById('progress')
const body = document.getElementById('body')
const face = document.getElementById('face')
const hand = document.getElementById('hand')
const actor = document.getElementById('actor')

body.src = K('shape-characters/PNG/Default/yellow_body_squircle.png')
face.src = K('shape-characters/PNG/Default/face_c.png')

function beatAt(t) {
  return BEATS.find((b) => t >= b.t0 && t < b.t1) || BEATS[BEATS.length - 1]
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x))
}

function easeOut(t) {
  return 1 - (1 - clamp01(t)) ** 3
}

function easeInOut(t) {
  const x = clamp01(t)
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2
}

function svgWrap(inner) {
  return `<div class="page"><svg viewBox="0 0 860 1100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${inner}</svg></div>`
}

function defs() {
  return `
    <defs>
      <filter id="pop"><feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="${INK}" flood-opacity="0.18"/></filter>
      <filter id="soft"><feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.12"/></filter>
    </defs>
  `
}

function personDot(cx, cy, r, fill, opacity = 1) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`
}

/** Scatter of crowd dots for room visual */
function crowdDots(n, cx, cy, spread, localT, accentEvery = 7) {
  const parts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + localT * 0.15
    const ring = 0.35 + (i % 5) * 0.12
    const x = cx + Math.cos(a) * spread * ring
    const y = cy + Math.sin(a) * spread * ring * 0.72
    const appear = easeOut(clamp01((localT - i * 0.04) / 0.25))
    const fill = i % accentEvery === 0 ? CYAN : INK
    parts.push(personDot(x, y, 10 + (i % 3) * 2, fill, 0.35 + 0.65 * appear))
  }
  return parts.join('')
}

function diagramHook(localT) {
  const fade = easeOut(localT / 0.35)
  const numScale = 0.55 + 0.45 * easeOut(clamp01(localT / 0.45))
  const pctIn = easeOut(clamp01((localT - 1.2) / 0.45))
  const pulse = 1 + 0.05 * Math.sin(localT * 7) * pctIn
  const crowd = easeOut(clamp01((localT - 0.4) / 0.6))
  return svgWrap(`
    ${defs()}
    <g opacity="${fade}">
      <text x="430" y="90" text-anchor="middle" fill="${MUTE}" font-family="${FONT_MONO}" font-size="26" letter-spacing="4">BIRTHDAY PARADOX</text>
      <g transform="translate(430,340) scale(${numScale}) translate(-430,-340)">
        <text x="430" y="380" text-anchor="middle" fill="${INK}" font-family="${FONT_DISP}" font-size="280" font-weight="700" filter="url(#pop)">23</text>
      </g>
      <g opacity="${crowd}">
        ${crowdDots(23, 430, 620, 280, localT)}
      </g>
      <g opacity="${pctIn}" transform="translate(430,820) scale(${pulse}) translate(-430,-820)">
        <rect x="200" y="760" width="460" height="140" rx="24" fill="${CYAN}" filter="url(#pop)"/>
        <text x="430" y="855" text-anchor="middle" fill="${WHITE}" font-family="${FONT_DISP}" font-size="72" font-weight="700">~50%</text>
        <image href="${K('game-icons/PNG/Black/2x/star.png')}" x="250" y="790" width="48" height="48" opacity="0.85"/>
        <image href="${K('game-icons/PNG/Black/2x/star.png')}" x="562" y="790" width="48" height="48" opacity="0.85"/>
      </g>
      <image href="${K('shape-characters/PNG/Default/tile_exclamation.png')}"
        x="70" y="160" width="100" height="100" opacity="${easeOut(clamp01((localT - 0.15) / 0.3))}"/>
    </g>
  `)
}

function diagramGut(localT) {
  const fade = easeOut(clamp01(localT / 0.35))
  const slide = easeOut(clamp01((localT - 0.2) / 0.5))
  const cross = easeOut(clamp01((localT - 2.2) / 0.4))
  const note = easeOut(clamp01((localT - 3.5) / 0.45))
  return svgWrap(`
    ${defs()}
    <g opacity="${fade}">
      <text x="430" y="100" text-anchor="middle" fill="${MUTE}" font-family="${FONT_MONO}" font-size="26" letter-spacing="3">YOUR INTUITION</text>
      <g transform="translate(0, ${(1 - slide) * 40})">
        <rect x="120" y="180" width="620" height="320" rx="28" fill="${WHITE}" stroke="${INK}" stroke-width="4" filter="url(#soft)"/>
        <text x="430" y="290" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="32">½ of 365 days ≈</text>
        <text x="430" y="420" text-anchor="middle" fill="${INK}" font-family="${FONT_DISP}" font-size="160" font-weight="700">183</text>
      </g>
      <g opacity="${cross}" transform="translate(430,340) scale(${0.7 + 0.3 * cross}) translate(-430,-340)">
        <image href="${K('game-icons/PNG/Black/2x/cross.png')}" x="310" y="220" width="240" height="240"/>
      </g>
      <g opacity="${note}">
        <image href="${K('game-icons/PNG/Black/2x/question.png')}" x="120" y="560" width="72" height="72"/>
        <rect x="210" y="560" width="520" height="200" rx="20" fill="${INK}"/>
        <text x="470" y="640" text-anchor="middle" fill="${WHITE}" font-family="${FONT}" font-size="34" font-weight="700">Matching YOUR birthday</text>
        <text x="470" y="700" text-anchor="middle" fill="${CYAN}" font-family="${FONT_MONO}" font-size="30">≠ any two people matching</text>
      </g>
    </g>
  `)
}

function diagramPairs(localT) {
  const fade = easeOut(clamp01(localT / 0.35))
  const phase2 = localT > 2.4
  const webGrow = easeInOut(clamp01((localT - 2.6) / 1.4))
  const count = Math.floor(253 * easeOut(clamp01((localT - 3.2) / 2.2)))
  const hubPulse = 1 + 0.04 * Math.sin(localT * 5)

  // fixed birthday (wrong model)
  const fixed = `
    <g opacity="${phase2 ? 0.25 : 1}">
      <text x="430" y="100" text-anchor="middle" fill="${MUTE}" font-family="${FONT_MONO}" font-size="24" letter-spacing="2">ONE FIXED BIRTHDAY</text>
      <circle cx="430" cy="320" r="54" fill="${CYAN}"/>
      <text x="430" y="332" text-anchor="middle" fill="${WHITE}" font-family="${FONT_DISP}" font-size="28" font-weight="700">YOU</text>
      ${[0, 1, 2, 3, 4, 5, 6, 7]
        .map((i) => {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2
          const x = 430 + Math.cos(a) * 180
          const y = 320 + Math.sin(a) * 140
          const on = easeOut(clamp01((localT - 0.3 - i * 0.08) / 0.25))
          return `<line x1="430" y1="320" x2="${x}" y2="${y}" stroke="${MUTE}" stroke-width="3" opacity="${0.35 * on}"/>
            <circle cx="${x}" cy="${y}" r="22" fill="${INK}" opacity="${on}"/>`
        })
        .join('')}
      <text x="430" y="560" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="28">compares against one date</text>
    </g>
  `

  // pair web
  const nodes = []
  const N = 12
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2
    nodes.push({ x: 430 + Math.cos(a) * 220, y: 380 + Math.sin(a) * 200 })
  }
  const edges = []
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      edges.push([i, j])
    }
  }
  const edgeCount = Math.floor(edges.length * webGrow)
  const lines = edges
    .slice(0, edgeCount)
    .map(([i, j]) => {
      const a = nodes[i]
      const b = nodes[j]
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${CYAN}" stroke-width="2.5" opacity="0.55"/>`
    })
    .join('')

  const pairWeb = `
    <g opacity="${phase2 ? 1 : 0}">
      <text x="430" y="100" text-anchor="middle" fill="${MUTE}" font-family="${FONT_MONO}" font-size="24" letter-spacing="2">EVERY PAIR</text>
      ${lines}
      ${nodes
        .map((n, i) => {
          const on = easeOut(clamp01((localT - 2.5 - i * 0.05) / 0.25))
          return `<circle cx="${n.x}" cy="${n.y}" r="20" fill="${INK}" opacity="${on}"/>`
        })
        .join('')}
      <g transform="translate(430,380) scale(${hubPulse}) translate(-430,-380)">
        <circle cx="430" cy="380" r="8" fill="${CYAN}"/>
      </g>
      <g opacity="${easeOut(clamp01((localT - 3.0) / 0.4))}">
        <rect x="180" y="720" width="500" height="160" rx="24" fill="${INK}" filter="url(#pop)"/>
        <text x="430" y="790" text-anchor="middle" fill="${CYAN}" font-family="${FONT_MONO}" font-size="28">23 PEOPLE →</text>
        <text x="430" y="860" text-anchor="middle" fill="${WHITE}" font-family="${FONT_DISP}" font-size="64" font-weight="700">${count} pairs</text>
      </g>
    </g>
  `

  return svgWrap(`${defs()}${fixed}${pairWeb}`)
}

function diagramClimb(localT) {
  const fade = easeOut(clamp01(localT / 0.3))
  const rows = [
    { n: 10, p: 0.117, label: '~12%', t: 1.2 },
    { n: 23, p: 0.507, label: '~50%', t: 3.4 },
    { n: 50, p: 0.97, label: '~97%', t: 5.6 },
  ]
  const maxW = 520
  const arrowOn = easeOut(clamp01((localT - 0.4) / 0.35))

  const bars = rows
    .map((row, i) => {
      const y = 220 + i * 220
      const grow = easeOut(clamp01((localT - row.t) / 0.7))
      const w = maxW * row.p * grow
      const highlight = row.n === 23
      return `
        <text x="90" y="${y + 48}" fill="${INK}" font-family="${FONT_DISP}" font-size="48" font-weight="700">${row.n}</text>
        <text x="90" y="${y + 88}" fill="${MUTE}" font-family="${FONT_MONO}" font-size="22">people</text>
        <rect x="220" y="${y + 20}" width="${maxW}" height="64" rx="16" fill="rgba(11,31,42,0.08)"/>
        <rect x="220" y="${y + 20}" width="${w}" height="64" rx="16" fill="${highlight ? CYAN : INK}" filter="url(#soft)"/>
        <text x="${Math.min(220 + w + 16, 760)}" y="${y + 64}" fill="${highlight ? CYAN : INK}" font-family="${FONT_DISP}" font-size="40" font-weight="700" opacity="${grow}">${row.label}</text>
      `
    })
    .join('')

  return svgWrap(`
    ${defs()}
    <g opacity="${fade}">
      <text x="430" y="100" text-anchor="middle" fill="${MUTE}" font-family="${FONT_MONO}" font-size="26" letter-spacing="3">ODDS CLIMB</text>
      <g opacity="${arrowOn}">
        <image href="${K('game-icons/PNG/Black/2x/arrowRight.png')}" x="720" y="80" width="56" height="56"/>
      </g>
      ${bars}
      <text x="430" y="980" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="28" opacity="${easeOut(clamp01((localT - 6.5) / 0.4))}">
        more people → pairs explode → collisions soar
      </text>
    </g>
  `)
}

function diagramCloser(localT) {
  const fade = easeOut(clamp01(localT / 0.3))
  const slam = easeOut(clamp01((localT - 0.35) / 0.4))
  const bounce = 1 + 0.03 * Math.sin(localT * 6) * slam
  return svgWrap(`
    ${defs()}
    <g opacity="${fade}" transform="translate(430,420) scale(${0.88 + 0.12 * slam}) translate(-430,-420)">
      <rect x="70" y="260" width="720" height="360" rx="28" fill="${INK}" filter="url(#pop)"/>
      <text x="430" y="380" text-anchor="middle" fill="${CYAN}" font-family="${FONT_MONO}" font-size="28" letter-spacing="3">TAKEAWAY</text>
      <text x="430" y="470" text-anchor="middle" fill="${WHITE}" font-family="${FONT_DISP}" font-size="52" font-weight="700">Pairs explode</text>
      <text x="430" y="545" text-anchor="middle" fill="${WHITE}" font-family="${FONT_DISP}" font-size="52" font-weight="700">faster than you think.</text>
    </g>
    <g opacity="${slam}" transform="translate(430,780) scale(${bounce}) translate(-430,-780)">
      <image href="${K('game-icons/PNG/Black/2x/checkmark.png')}" x="350" y="720" width="80" height="80"/>
      <image href="${K('game-icons/PNG/Black/2x/exclamation.png')}" x="460" y="720" width="80" height="80"/>
    </g>
  `)
}

const DIAGRAMS = {
  hook: diagramHook,
  gut: diagramGut,
  pairs: diagramPairs,
  climb: diagramClimb,
  closer: diagramCloser,
}

const ANIMATED = new Set(['hook', 'gut', 'pairs', 'climb', 'closer'])

let lastDiagram = ''
let lastCaption = ''
let lastCallout = ''
let lastHand = ''
let lastShowActor = null

function applyChrome(beat, t) {
  if (beat.html !== lastCaption) {
    captionInner.innerHTML = beat.html
    lastCaption = beat.html
  }
  if (beat.callout !== lastCallout) {
    calloutText.textContent = beat.callout
    lastCallout = beat.callout
    callout.style.transform = 'scale(1.08)'
    requestAnimationFrame(() => {
      callout.style.transition = 'transform 0.22s ease-out'
      callout.style.transform = 'scale(1)'
    })
  }
  callout.style.opacity = '1'
  progressEl.style.setProperty('--p', String(beat.progress ?? t / DURATION))
  if (beat.hand !== lastHand) {
    hand.src = HAND_SRC[beat.hand] || HAND_SRC.point
    lastHand = beat.hand
  }
  if (beat.showActor !== lastShowActor) {
    actor.classList.toggle('hidden', !beat.showActor)
    lastShowActor = beat.showActor
  }
  if (beat.showActor) {
    const lean = 1 + 0.015 * Math.sin(t * 2.2)
    const bob = Math.sin(t * 1.8) * 4
    actor.style.transform = `scale(${lean}) translateY(${bob}px)`
    hand.style.transform = `rotate(${Math.sin(t * 3) * 6}deg)`
  }
}

function frameAt(t) {
  const beat = beatAt(t)
  const localT = t - beat.t0
  applyChrome(beat, t)
  const key = `${beat.diagram}:${beat.t0}`
  if (key !== lastDiagram || ANIMATED.has(beat.diagram)) {
    const draw = DIAGRAMS[beat.diagram]
    if (draw) diagramEl.innerHTML = draw(localT)
    lastDiagram = key
  }
  return { t, beat: beat.diagram }
}

function visualOk() {
  const hasDiagram = diagramEl.innerHTML.length > 40
  const hasCaption = captionInner.textContent.trim().length > 0
  const hasCallout = calloutText.textContent.trim().length > 0
  return hasDiagram && hasCaption && hasCallout
}

window.__MS_READY = true
window.__MS = {
  duration: DURATION,
  fps: FPS,
  frameAt,
  visualOk,
  beats: () => BEATS.map((b) => ({ t0: b.t0, t1: b.t1, diagram: b.diagram, callout: b.callout })),
}

frameAt(0)
