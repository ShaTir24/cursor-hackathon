const WIDTH = 1080
const HEIGHT = 1920
/** Audio-locked to Charlie VO + forced alignment (plans/indian_freedom_fighters_marvel_20260718.md) */
const DURATION = 48.999
const FPS = 30
const SATYAGRAHA_T = 10.779
const SPARK_T = 21.76
const FORCE_T = 32.18
const COURAGE_T = 41.219

const K = (rel) => `../assets/kenney/${rel}`

const BEATS = [
  {
    t0: 0.079,
    t1: 4.679,
    html: `<span class="law">ORIGIN CARDS</span>WAIT — Freedom fighters. Marvel cards?`,
    callout: 'WAIT',
    diagram: 'hook',
    hand: 'point',
  },
  {
    t0: 4.679,
    t1: 15.24,
    html: `<span class="law">GANDHI</span>Professor X energy — satyagraha: truth-force, no punch`,
    callout: 'GANDHI',
    diagram: 'gandhi',
    hand: 'peace',
  },
  {
    t0: 15.24,
    t1: 24.92,
    html: `<span class="law">BHAGAT SINGH</span>Young rebel energy — one spark, whole country on fire`,
    callout: 'BHAGAT',
    diagram: 'bhagat',
    hand: 'point',
  },
  {
    t0: 24.92,
    t1: 34.099,
    html: `<span class="law">SUBHAS BOSE</span>Captain of an army — he built force when force was needed`,
    callout: 'BOSE',
    diagram: 'bose',
    hand: 'point',
  },
  {
    t0: 34.099,
    t1: 43.399,
    html: `<span class="law">RANI LAKSHMIBAI</span>Battlefield queen — courage was her armor`,
    callout: 'RANI',
    diagram: 'rani',
    hand: 'point',
  },
  {
    t0: 43.399,
    t1: 48.999,
    html: `<span class="law">ENDGAME</span>Not comic characters. Real. Freedom was their endgame.`,
    callout: 'FREEDOM',
    diagram: 'closer',
    hand: 'open',
  },
]

const HAND_SRC = {
  open: K('shape-characters/PNG/Default/blue_hand_open.png'),
  point: K('shape-characters/PNG/Default/blue_hand_point.png'),
  peace: K('shape-characters/PNG/Default/blue_hand_peace.png'),
}

const GOLD = '#f0b429'
const SAFFRON = '#ff8c42'
const MUTE = '#9aa8c2'
const INK = '#0c1220'
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

body.src = K('shape-characters/PNG/Default/blue_body_squircle.png')
face.src = K('shape-characters/PNG/Default/face_a.png')

function beatAt(t) {
  return BEATS.find((b) => t >= b.t0 && t < b.t1) || BEATS[BEATS.length - 1]
}

const img = (rel, x, y, size, extra = '') =>
  `<image href="${K(rel)}" x="${x}" y="${y}" width="${size}" height="${size}" ${extra}/>`

/* Beat 1 — Hook: ORIGIN? badge pulse ×2 + question mark */
function svgHook(u) {
  const pulse = 1 + 0.1 * Math.sin(u * Math.PI * 4)
  const pop = Math.min(1, u * 4)
  const badge = 200 * pulse
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <rect x="${480 - 220 * pop}" y="${280 - 140 * pop}" width="${440 * pop}" height="${280 * pop}" rx="28"
      fill="rgba(12,18,32,0.9)" stroke="${GOLD}" stroke-width="6" opacity="${0.5 + 0.5 * pop}"/>
    <g transform="translate(480 300) scale(${pulse})">
      ${img('shape-characters/PNG/Default/tile_exclamation.png', -badge / 2, -badge / 2 - 20, badge)}
    </g>
    ${img('game-icons/PNG/White/2x/question.png', 700, 80, 96, `opacity="${0.45 + 0.55 * Math.abs(Math.sin(u * Math.PI * 4))}"`)}
    <text x="480" y="560" text-anchor="middle" fill="#ffe9c2" font-size="48" font-weight="800" font-family="${FONT}" letter-spacing="4">ORIGIN CARD?</text>
  </svg>`
}

/* Beat 2 — Gandhi: soft truth-force ring expands at satyagraha */
function svgGandhi(u, t) {
  const hit = t >= SATYAGRAHA_T
  const grow = hit ? Math.min(1, (t - SATYAGRAHA_T) / 0.55) : 0.35 + u * 0.15
  const r = 90 + grow * 130
  const bob = Math.sin(t * 2.2) * 6
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <circle cx="480" cy="300" r="${r}" fill="none" stroke="${GOLD}" stroke-width="8" opacity="${0.35 + grow * 0.55}"/>
    <circle cx="480" cy="300" r="${r * 0.62}" fill="${GOLD}" opacity="${0.06 + grow * 0.1}"/>
    ${img('shape-characters/PNG/Default/yellow_body_squircle.png', 390, 200 + bob, 180)}
    ${img('shape-characters/PNG/Default/hand_yellow_peace.png', 560, 310 + bob, 100, 'opacity="0.95"')}
    ${img('game-icons/PNG/White/2x/information.png', 120, 90, 84, `opacity="${0.4 + grow * 0.5}"`)}
    <text x="480" y="520" text-anchor="middle" fill="${hit ? GOLD : MUTE}" font-size="36" font-weight="800" font-family="${FONT}">
      ${hit ? 'SATYAGRAHA · TRUTH-FORCE' : 'MIND OVER FISTS'}
    </text>
    <text x="480" y="580" text-anchor="middle" fill="${MUTE}" font-size="28" font-family="${FONT}">Professor X energy</text>
  </svg>`
}

/* Beat 3 — Bhagat: large center spark pops then radial fire at SPARK_T */
function svgBhagat(u, t) {
  const sparked = t >= SPARK_T
  const burst = sparked ? Math.min(1, (t - SPARK_T) / 0.4) : 0
  const pulse = 0.92 + 0.12 * Math.sin(u * Math.PI * 6)
  const sparkS = sparked ? 1.15 + burst * 0.85 : pulse
  const rays = sparked
    ? Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2
        const x2 = 480 + Math.cos(a) * (100 + burst * 200)
        const y2 = 280 + Math.sin(a) * (100 + burst * 200)
        return `<line x1="480" y1="280" x2="${x2}" y2="${y2}" stroke="${SAFFRON}" stroke-width="${8 + burst * 6}" stroke-linecap="round" opacity="${0.4 + burst * 0.55}"/>`
      }).join('')
    : ''
  const star = 200 * sparkS
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    ${rays}
    <circle cx="480" cy="280" r="${70 + burst * 110}" fill="${SAFFRON}" opacity="${0.14 + burst * 0.22}"/>
    ${img('game-icons/PNG/White/2x/star.png', 480 - star / 2, 280 - star / 2, star)}
    ${img('shape-characters/PNG/Default/red_body_squircle.png', 70, 420, 110, 'opacity="0.75"')}
    ${img('shape-characters/PNG/Default/red_hand_rock.png', 170, 470, 72, 'opacity="0.8"')}
    <text x="480" y="560" text-anchor="middle" fill="${sparked ? SAFFRON : MUTE}" font-size="36" font-weight="800" font-family="${FONT}">
      ${sparked ? 'ONE SPARK → NATION ON FIRE' : 'YOUNG REBEL'}
    </text>
  </svg>`
}

/* Beat 4 — Bose: marching chevrons + power accent at FORCE_T */
function svgBose(u, t) {
  const march = (t * 1.8) % 1
  const forced = t >= FORCE_T
  const slam = forced ? Math.min(1, (t - FORCE_T) / 0.3) : 0
  const chevrons = [0, 1, 2, 3]
    .map((i) => {
      const x = 80 + ((i * 180 + march * 180) % 720)
      return `<polygon points="${x},300 ${x + 70},260 ${x + 70},340" fill="${GOLD}" opacity="${0.45 + (i % 2) * 0.25}"/>`
    })
    .join('')
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="250" width="840" height="100" rx="16" fill="rgba(240,180,41,0.08)" stroke="rgba(240,180,41,0.25)" stroke-width="3"/>
    ${chevrons}
    ${img('shape-characters/PNG/Default/purple_body_squircle.png', 400, 90, 160)}
    ${img('game-icons/PNG/White/2x/arrowRight.png', 700, 270, 90, `opacity="${0.7 + slam * 0.3}"`)}
    ${img('game-icons/PNG/White/2x/power.png', 120, 90, 100, `opacity="${0.4 + slam * 0.55}"`)}
    <text x="480" y="520" text-anchor="middle" fill="${forced ? GOLD : MUTE}" font-size="34" font-weight="800" font-family="${FONT}">
      ${forced ? 'BUILT FORCE WHEN NEEDED' : 'CAPTAIN OF AN ARMY'}
    </text>
    <text x="480" y="580" text-anchor="middle" fill="${MUTE}" font-size="26" font-family="${FONT}">march cadence</text>
  </svg>`
}

/* Beat 5 — Rani: shield crest rises; medal at COURAGE_T */
function svgRani(u, t) {
  const rise = Math.min(1, u * 2.2)
  const y = 340 - rise * 80
  const rock = Math.sin(t * 2.5) * 4
  const brave = t >= COURAGE_T
  const medal = brave ? Math.min(1, (t - COURAGE_T) / 0.35) : 0
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(480 ${y}) rotate(${rock})">
      <path d="M0,-140 L110,-40 L90,110 L0,160 L-90,110 L-110,-40 Z" fill="rgba(255,140,66,0.15)" stroke="${SAFFRON}" stroke-width="8"/>
      <text y="20" text-anchor="middle" fill="${SAFFRON}" font-size="42" font-weight="800" font-family="${FONT}">QUEEN</text>
    </g>
    ${img('shape-characters/PNG/Default/pink_body_squircle.png', 100, 380, 150)}
    ${img('shape-characters/PNG/Default/pink_hand_point.png', 240, 440, 90)}
    ${img('game-icons/PNG/White/2x/medal1.png', 760, 380, 110, `opacity="${0.25 + medal * 0.75}"`)}
    <text x="480" y="580" text-anchor="middle" fill="${brave ? SAFFRON : MUTE}" font-size="34" font-weight="800" font-family="${FONT}">
      ${brave ? 'COURAGE WAS HER ARMOR' : 'BATTLEFIELD QUEEN'}
    </text>
  </svg>`
}

/* Beat 6 — Closer: FREEDOM badge + assemble dots + trophy */
function svgCloser(u, t) {
  const slam = Math.min(1, u * 4)
  const s = 0.85 + slam * 0.2 + 0.04 * Math.sin(t * 3)
  const dots = [
    [200, 420, '#f0b429'],
    [360, 460, '#ff8c42'],
    [600, 460, '#c084fc'],
    [760, 420, '#fb7185'],
  ]
    .map(([x, y, c], i) => {
      const converge = slam
      const cx = 480 + (x - 480) * (1 - converge * 0.35)
      const cy = y - converge * 40
      return `<circle cx="${cx}" cy="${cy}" r="${18 + i}" fill="${c}" opacity="${0.5 + converge * 0.45}"/>`
    })
    .join('')
  const size = 160 * s
  return `
  <svg viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">
    <rect x="${480 - 200 * slam}" y="80" width="${400 * slam}" height="100" rx="18" fill="${GOLD}" opacity="${slam}"/>
    <text x="480" y="148" text-anchor="middle" fill="${INK}" font-size="48" font-weight="900" font-family="${FONT}" opacity="${slam}" letter-spacing="6">FREEDOM</text>
    ${dots}
    ${img('game-icons/PNG/White/2x/trophy.png', 480 - size / 2, 250, size, `opacity="${0.7 + slam * 0.3}"`)}
    ${img('game-icons/PNG/White/2x/checkmark.png', 160, 280, 80, `opacity="${slam}"`)}
    ${img('game-icons/PNG/White/2x/massiveMultiplayer.png', 720, 280, 90, `opacity="${0.5 + slam * 0.4}"`)}
    <text x="480" y="560" text-anchor="middle" fill="#ffe9c2" font-size="36" font-weight="800" font-family="${FONT}">REAL HEROES · REAL ENDGAME</text>
  </svg>`
}

const DIAGRAMS = {
  hook: svgHook,
  gandhi: svgGandhi,
  bhagat: svgBhagat,
  bose: svgBose,
  rani: svgRani,
  closer: svgCloser,
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

  const lean = beat.diagram === 'hook' ? Math.min(1, u * 3) * -6 : 0
  actor.style.transform = `translateX(-50%) translateY(${Math.sin(clamped * 3) * 8}px) rotate(${lean}deg)`

  diagramEl.innerHTML = DIAGRAMS[beat.diagram](u, clamped)
  progress.style.width = `${(clamped / DURATION) * 100}%`
}

function visualOk() {
  // Gandhi ring must grow across satyagraha cue
  frameAt(SATYAGRAHA_T - 0.4)
  const rBefore = Number(diagramEl.querySelector('circle')?.getAttribute('r') || 0)
  frameAt(SATYAGRAHA_T + 0.6)
  const rAfter = Number(diagramEl.querySelector('circle')?.getAttribute('r') || 0)
  // Bhagat must draw fire rays after spark
  frameAt(SPARK_T + 0.5)
  const hasRays = diagramEl.querySelectorAll('line').length >= 4
  frameAt(0)
  return rAfter > rBefore && hasRays
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
