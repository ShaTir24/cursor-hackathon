const WIDTH = 1080
const HEIGHT = 1920
/** Audio-locked to Alice VO + forced alignment (plans/special_relativity_20260718.md) */
const DURATION = 36.74
const FPS = 30

const K = (rel) => `../assets/kenney/${rel}`
const W = (rel) => `../assets/web/${rel}`

const BEATS = [
  {
    t0: 0.099,
    t1: 4.92,
    html: `<span class="law">WAIT</span>In 1905, Einstein rewrote space and time.`,
    callout: 'WAIT',
    diagram: 'hook',
    hand: 'point',
    tick: 0,
  },
  {
    t0: 4.92,
    t1: 16.94,
    html: `<span class="law">TWO RULES</span>Same physics in every steady frame. Light always travels at C.`,
    callout: '2 RULES',
    diagram: 'postulates',
    hand: 'point',
    tick: 1,
  },
  {
    t0: 16.94,
    t1: 22.379,
    html: `<span class="law">TIME DILATION</span>A moving clock ticks slower.`,
    callout: 'TIME',
    diagram: 'dilation',
    hand: 'point',
    tick: 2,
  },
  {
    t0: 22.379,
    t1: 27.819,
    html: `<span class="law">LENGTH</span>Moving rulers shrink along the direction of motion.`,
    callout: 'LENGTH',
    diagram: 'length',
    hand: 'open',
    tick: 3,
  },
  {
    t0: 27.819,
    t1: 32.2,
    html: `<span class="law">E = mc²</span>Mass holds energy.`,
    callout: 'E=mc²',
    diagram: 'emc2',
    hand: 'point',
    tick: 4,
  },
  {
    t0: 32.2,
    t1: 36.74,
    html: `<span class="law">RELATIVITY</span>Space and time are not absolute.`,
    callout: 'DONE',
    diagram: 'closer',
    hand: 'open',
    tick: 5,
  },
]

const HAND_SRC = {
  open: K('shape-characters/PNG/Default/blue_hand_open.png'),
  point: K('shape-characters/PNG/Default/blue_hand_point.png'),
}

const CREAM = '#f3efe3'
const INK = '#1a3d2e'
const CORAL = '#e07a5f'
const MUTE = '#a8c4b4'
const FONT = 'American Typewriter, Courier New, monospace'

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

function clamp01(x) {
  return Math.max(0, Math.min(1, x))
}

function easeOut(t) {
  return 1 - (1 - clamp01(t)) ** 3
}

function svgWrap(inner) {
  return `<svg viewBox="0 0 952 900" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${inner}</svg>`
}

function diagramHook(localT) {
  const fade = easeOut(localT / 0.6)
  const dateY = 720 - easeOut(clamp01((localT - 0.4) / 0.5)) * 40
  const bangPulse = 1 + 0.08 * Math.sin(localT * 8)
  return svgWrap(`
    <defs>
      <clipPath id="pclip"><rect x="286" y="80" width="380" height="480" rx="12"/></clipPath>
      <filter id="chalk"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2"/></filter>
    </defs>
    <rect x="270" y="64" width="412" height="512" rx="16" fill="${INK}" opacity="0.35"/>
    <rect x="286" y="80" width="380" height="480" rx="12" fill="${CREAM}" opacity="${0.15 * fade}"/>
    <image href="${W('einstein_1905.jpg')}" x="286" y="80" width="380" height="480"
      clip-path="url(#pclip)" opacity="${fade}" preserveAspectRatio="xMidYMid slice"/>
    <rect x="286" y="80" width="380" height="480" rx="12" fill="none" stroke="${CREAM}" stroke-width="4" opacity="${0.85 * fade}"/>
    <image href="${K('shape-characters/PNG/Default/tile_exclamation.png')}"
      x="${120}" y="${100}" width="${72 * bangPulse}" height="${72 * bangPulse}" opacity="${fade}"/>
    <text x="476" y="${dateY}" text-anchor="middle" fill="${CREAM}" font-family="${FONT}"
      font-size="64" font-weight="700" opacity="${fade}" filter="url(#chalk)">1905</text>
    <text x="476" y="820" text-anchor="middle" fill="${CORAL}" font-family="${FONT}"
      font-size="36" letter-spacing="4" opacity="${fade * easeOut(clamp01((localT - 0.8) / 0.4))}">SPACE · TIME</text>
  `)
}

function diagramPostulates(localT) {
  const a = easeOut(clamp01(localT / 0.55))
  const b = easeOut(clamp01((localT - 1.2) / 0.55))
  const beam = 0.45 + 0.55 * Math.abs(Math.sin(localT * 2.2))
  const twoCue = localT >= 7.5 // ~"Two: light" relative to beat start ~12.559-4.92
  return svgWrap(`
    <defs>
      <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${CORAL}" stop-opacity="0"/>
        <stop offset="50%" stop-color="${CREAM}" stop-opacity="${beam}"/>
        <stop offset="100%" stop-color="${CORAL}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g opacity="${a}" transform="translate(${-40 * (1 - a)},0)">
      <rect x="60" y="180" width="380" height="320" rx="10" fill="rgba(243,239,227,0.08)" stroke="${CREAM}" stroke-width="3"/>
      <text x="250" y="250" text-anchor="middle" fill="${CORAL}" font-family="${FONT}" font-size="28" letter-spacing="3">POSTULATE 1</text>
      <text x="250" y="330" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="40" font-weight="700">PHYSICS</text>
      <text x="250" y="390" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="40" font-weight="700">SAME</text>
      <text x="250" y="450" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="26">every steady frame</text>
      <image href="${K('game-icons/PNG/White/2x/star.png')}" x="214" y="480" width="72" height="72" opacity="0.9"/>
    </g>
    <g opacity="${b}" transform="translate(${40 * (1 - b)},0)">
      <rect x="512" y="180" width="380" height="320" rx="10" fill="rgba(243,239,227,0.08)" stroke="${CREAM}" stroke-width="3"/>
      <text x="702" y="250" text-anchor="middle" fill="${CORAL}" font-family="${FONT}" font-size="28" letter-spacing="3">POSTULATE 2</text>
      <text x="702" y="330" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="40" font-weight="700">LIGHT = C</text>
      <text x="702" y="390" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="32" font-weight="700">ALWAYS</text>
      <text x="702" y="450" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="26">for every observer</text>
    </g>
    <rect x="80" y="620" width="792" height="14" rx="7" fill="url(#beam)" opacity="${b * (twoCue ? 1 : 0.65)}"/>
    <circle cx="${80 + ((localT * 180) % 792)}" cy="627" r="10" fill="${CREAM}" opacity="${b}"/>
    <text x="476" y="720" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="32"
      opacity="${easeOut(clamp01((localT - 2.5) / 0.4))}">c is the same for everyone</text>
  `)
}

function diagramDilation(localT) {
  const fade = easeOut(clamp01(localT / 0.45))
  const bounce = (localT * 1.6) % 2
  const photonY = bounce < 1 ? 220 + bounce * 280 : 500 - (bounce - 1) * 280
  const shipX = 520 + Math.min(localT * 28, 180)
  return svgWrap(`
    <g opacity="${fade}">
      <!-- light clock -->
      <rect x="120" y="160" width="200" height="400" rx="8" fill="none" stroke="${CREAM}" stroke-width="3"/>
      <line x1="140" y1="200" x2="300" y2="200" stroke="${MUTE}" stroke-width="4"/>
      <line x1="140" y1="480" x2="300" y2="480" stroke="${MUTE}" stroke-width="4"/>
      <circle cx="220" cy="${photonY}" r="14" fill="${CORAL}"/>
      <text x="220" y="140" text-anchor="middle" fill="${CORAL}" font-family="${FONT}" font-size="28">LIGHT CLOCK</text>

      <!-- moving ship -->
      <g transform="translate(${shipX},280)">
        <path d="M0 40 L160 0 L160 120 L0 80 Z" fill="rgba(243,239,227,0.12)" stroke="${CREAM}" stroke-width="3"/>
        <circle cx="40" cy="60" r="18" fill="${MUTE}"/>
        <text x="80" y="160" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="26">SHIP</text>
      </g>

      <image href="${K('game-icons/PNG/White/2x/warning.png')}" x="400" y="80" width="64" height="64" opacity="0.85"/>
      <text x="476" y="700" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="48" font-weight="700"
        opacity="${easeOut(clamp01((localT - 1.5) / 0.5))}">Δt = γ Δt₀</text>
      <text x="476" y="770" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="28"
        opacity="${easeOut(clamp01((localT - 2.2) / 0.4))}">moving clocks tick slower</text>
    </g>
  `)
}

function diagramLength(localT) {
  const fade = easeOut(clamp01(localT / 0.4))
  const shrink = 1 - 0.35 * easeOut(clamp01((localT - 0.8) / 1.2))
  const w = 520 * shrink
  return svgWrap(`
    <g opacity="${fade}">
      <text x="476" y="140" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="28">PROPER LENGTH L₀</text>
      <rect x="216" y="180" width="520" height="70" rx="8" fill="rgba(243,239,227,0.1)" stroke="${MUTE}" stroke-width="2" stroke-dasharray="10 8"/>
      <text x="476" y="225" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="32">L₀</text>

      <image href="${K('game-icons/PNG/White/2x/arrowRight.png')}" x="476" y="345" width="90" height="90" opacity="0.7"
        transform="rotate(90 476 345)"/>

      <text x="476" y="440" text-anchor="middle" fill="${CORAL}" font-family="${FONT}" font-size="28">CONTRACTED L</text>
      <g transform="translate(${476 - w / 2}, 480)">
        <path d="M0 50 L${w * 0.12} 10 L${w * 0.88} 10 L${w} 50 L${w * 0.88} 90 L${w * 0.12} 90 Z"
          fill="rgba(224,122,95,0.25)" stroke="${CREAM}" stroke-width="3"/>
        <circle cx="${w * 0.22}" cy="50" r="16" fill="${CREAM}" opacity="0.5"/>
        <circle cx="${w * 0.78}" cy="50" r="16" fill="${CREAM}" opacity="0.5"/>
      </g>
      <text x="476" y="640" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="48" font-weight="700"
        opacity="${easeOut(clamp01((localT - 1.5) / 0.4))}">L = L₀ / γ</text>
      <text x="476" y="720" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="28"
        opacity="${easeOut(clamp01((localT - 2.2) / 0.4))}">shrink along the motion</text>
    </g>
  `)
}

function diagramEmc2(localT) {
  const fade = easeOut(clamp01(localT / 0.5))
  const scale = 0.7 + 0.3 * easeOut(clamp01(localT / 0.8))
  const arrow = easeOut(clamp01((localT - 0.9) / 0.5))
  return svgWrap(`
    <g opacity="${fade}" transform="translate(476,380) scale(${scale}) translate(-476,-380)">
      <text x="476" y="300" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="120" font-weight="700">E = mc²</text>
      <g opacity="${arrow}">
        <text x="220" y="480" text-anchor="middle" fill="${CORAL}" font-family="${FONT}" font-size="36">MASS</text>
        <image href="${K('game-icons/PNG/White/2x/arrowRight.png')}" x="310" y="440" width="80" height="80"/>
        <text x="520" y="480" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="36">ENERGY</text>
        <image href="${K('game-icons/PNG/White/2x/arrowRight.png')}" x="620" y="440" width="80" height="80"/>
        <text x="780" y="480" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="36">c²</text>
      </g>
      <text x="476" y="620" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="32"
        opacity="${easeOut(clamp01((localT - 1.5) / 0.4))}">rest energy E₀ = mc²</text>
    </g>
  `)
}

function diagramCloser(localT) {
  const fade = easeOut(clamp01(localT / 0.4))
  const stamp = easeOut(clamp01((localT - 0.3) / 0.45))
  const bounce = 1 + 0.04 * Math.sin(localT * 6)
  return svgWrap(`
    <g opacity="${fade}">
      <g transform="translate(476,340) scale(${0.85 + 0.15 * stamp}) translate(-476,-340)">
        <rect x="196" y="200" width="560" height="280" rx="16" fill="rgba(243,239,227,0.1)" stroke="${CREAM}" stroke-width="4"/>
        <text x="476" y="300" text-anchor="middle" fill="${CORAL}" font-family="${FONT}" font-size="36" letter-spacing="4">NOT ABSOLUTE</text>
        <text x="476" y="390" text-anchor="middle" fill="${CREAM}" font-family="${FONT}" font-size="48" font-weight="700">SPACE &amp; TIME</text>
        <image href="${K('game-icons/PNG/White/2x/checkmark.png')}" x="420" y="420" width="${90 * bounce}" height="${90 * bounce}"/>
      </g>
      <text x="476" y="620" text-anchor="middle" fill="${MUTE}" font-family="${FONT}" font-size="32"
        opacity="${stamp}">special relativity</text>
    </g>
  `)
}

const DIAGRAMS = {
  hook: diagramHook,
  postulates: diagramPostulates,
  dilation: diagramDilation,
  length: diagramLength,
  emc2: diagramEmc2,
  closer: diagramCloser,
}

let lastDiagram = ''
let lastCaption = ''
let lastCallout = ''
let lastHand = ''
let lastTick = -1

function applyChrome(beat, t) {
  if (beat.html !== lastCaption) {
    captionInner.innerHTML = beat.html
    lastCaption = beat.html
  }
  if (beat.callout !== lastCallout) {
    calloutText.textContent = beat.callout
    lastCallout = beat.callout
  }
  callout.style.opacity = '1'
  if (beat.hand !== lastHand) {
    hand.src = HAND_SRC[beat.hand] || HAND_SRC.point
    lastHand = beat.hand
  }
  if (beat.tick !== lastTick) {
    ticks.forEach((el, i) => el.classList.toggle('on', i === beat.tick))
    lastTick = beat.tick
  }
  const lean = 1 + 0.015 * Math.sin(t * 2.2)
  const bob = Math.sin(t * 1.8) * 4
  actor.style.transform = `scale(${lean}) translateY(${bob}px)`
  hand.style.transform = `rotate(${Math.sin(t * 3) * 6}deg)`
}

function frameAt(t) {
  const beat = beatAt(t)
  const localT = t - beat.t0
  applyChrome(beat, t)
  const key = `${beat.diagram}:${beat.t0}`
  if (key !== lastDiagram || beat.diagram === 'dilation' || beat.diagram === 'postulates' || beat.diagram === 'length') {
    const draw = DIAGRAMS[beat.diagram]
    if (draw) diagramEl.innerHTML = draw(localT)
    lastDiagram = key
  } else if (DIAGRAMS[beat.diagram]) {
    diagramEl.innerHTML = DIAGRAMS[beat.diagram](localT)
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
