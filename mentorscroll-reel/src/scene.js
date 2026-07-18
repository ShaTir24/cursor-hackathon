import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

const WIDTH = 1080
const HEIGHT = 1920
const DURATION = 45
const FPS = 30

/**
 * OPTION 1 — "The Universe Has Rules"
 * Motion-first: every beat switches a full-body Mixamo clip and scrubs it
 * deterministically during offline render (no crossFade).
 *
 * Catalog → local: Standing Greeting→wave, Agreeing→talking,
 * Pointing Gesture→pointing, Nervously Looking Around…→lookAround,
 * Victory Idle→celebrate
 */
const BEATS = [
  {
    t0: 0,
    t1: 4,
    anim: 'wave',
    html: `<span class="law">WAIT</span>Newton's 3 laws run YOUR life`,
  },
  {
    t0: 4,
    t1: 14,
    anim: 'talking',
    html: `<span class="law">LAW 1 · INERTIA</span>Stuff keeps doing what it's doing — unless a force interferes`,
  },
  {
    t0: 14,
    t1: 25,
    anim: 'pointing',
    html: `<span class="law">LAW 2 · F = ma</span>Push harder → accelerate more. Heavier mass → less speed`,
  },
  {
    t0: 25,
    t1: 36,
    anim: 'lookAround',
    html: `<span class="law">LAW 3 · ACTION / REACTION</span>Every push creates an equal push back — look around`,
  },
  {
    t0: 36,
    t1: 45,
    anim: 'celebrate',
    html: `<span class="law">BOSS MOVE</span>Master these three. Master motion.`,
  },
]

const canvas = document.getElementById('c')
const captionEl = document.getElementById('caption')
const progressEl = document.querySelector('#progress > i')

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
  alpha: false,
})
renderer.setSize(WIDTH, HEIGHT, false)
renderer.setPixelRatio(1)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a2338)
scene.fog = new THREE.Fog(0x1a2338, 10, 28)

const camera = new THREE.PerspectiveCamera(34, WIDTH / HEIGHT, 0.1, 80)
camera.position.set(0, 1.45, 3.6)
camera.lookAt(0, 1.05, 0)

// ─── Physics-classroom set ───────────────────────────────────────────
function buildEnvironment() {
  const room = new THREE.Group()

  // Back wall
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x243352,
    roughness: 0.92,
    metalness: 0.05,
  })
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), wallMat)
  backWall.position.set(0, 3.2, -4.2)
  room.add(backWall)

  // Side walls (angled for portrait depth)
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), wallMat)
  leftWall.position.set(-5.5, 3.2, -1.5)
  leftWall.rotation.y = Math.PI / 2.6
  room.add(leftWall)
  const rightWall = leftWall.clone()
  rightWall.position.x = 5.5
  rightWall.rotation.y = -Math.PI / 2.6
  room.add(rightWall)

  // Chalkboard
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x1b3d2f, roughness: 0.85 }),
  )
  board.position.set(0, 2.85, -4.05)
  room.add(board)
  const boardFrame = new THREE.Mesh(
    new THREE.PlaneGeometry(5.45, 2.85),
    new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.7 }),
  )
  boardFrame.position.set(0, 2.85, -4.1)
  room.add(boardFrame)

  // Chalk formulas as simple planes with canvas textures
  const formulas = ['F = ma', 'ΣF = 0', 'a = −a′']
  formulas.forEach((text, i) => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 128
    const ctx = c.getContext('2d')
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.clearRect(0, 0, 512, 128)
    ctx.fillStyle = '#e8f5e9'
    ctx.font = 'bold 72px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalAlpha = 0.85
    ctx.fillText(text, 256, 64)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.4),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
    )
    mesh.position.set(-1.5 + i * 1.55, 3.15 - (i % 2) * 0.55, -4.0)
    room.add(mesh)
  })

  // Floor with checker / lab tiles
  const floorCanvas = document.createElement('canvas')
  floorCanvas.width = 256
  floorCanvas.height = 256
  const fctx = floorCanvas.getContext('2d')
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      fctx.fillStyle = (x + y) % 2 === 0 ? '#2a3348' : '#222a3c'
      fctx.fillRect(x * 32, y * 32, 32, 32)
    }
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas)
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
  floorTex.repeat.set(6, 6)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.75,
      metalness: 0.1,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  room.add(floor)

  // Stage platform
  const stage = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.45, 0.12, 48),
    new THREE.MeshStandardMaterial({
      color: 0x3d2a18,
      roughness: 0.55,
      metalness: 0.25,
    }),
  )
  stage.position.y = 0.06
  stage.receiveShadow = true
  stage.castShadow = true
  room.add(stage)

  const stageRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.035, 12, 64),
    new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffb703,
      emissiveIntensity: 0.55,
      metalness: 0.6,
      roughness: 0.3,
    }),
  )
  stageRing.rotation.x = Math.PI / 2
  stageRing.position.y = 0.13
  room.add(stageRing)

  // Accent pillars
  for (const x of [-3.2, 3.2]) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 5.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.65 }),
    )
    pillar.position.set(x, 2.75, -3.4)
    pillar.castShadow = true
    room.add(pillar)
  }

  // Floating orbiting "force" orbs (motion in background)
  const orbs = []
  const orbColors = [0xef476f, 0xffd166, 0x06d6a0, 0x118ab2]
  for (let i = 0; i < 8; i++) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09 + (i % 3) * 0.03, 16, 16),
      new THREE.MeshStandardMaterial({
        color: orbColors[i % orbColors.length],
        emissive: orbColors[i % orbColors.length],
        emissiveIntensity: 0.45,
        roughness: 0.3,
      }),
    )
    orb.userData = {
      radius: 1.8 + (i % 4) * 0.25,
      speed: 0.55 + i * 0.08,
      phase: (i / 8) * Math.PI * 2,
      yBase: 1.1 + (i % 5) * 0.22,
    }
    orbs.push(orb)
    room.add(orb)
  }

  // Soft ceiling light fixture
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.75, 0.15, 24),
    new THREE.MeshStandardMaterial({
      color: 0xf8f4e8,
      emissive: 0xfff2cc,
      emissiveIntensity: 0.8,
    }),
  )
  lamp.position.set(0, 5.4, -1)
  room.add(lamp)

  scene.add(room)
  return { stageRing, orbs }
}

const { stageRing, orbs } = buildEnvironment()

const hemi = new THREE.HemisphereLight(0xdde7ff, 0x3a2818, 0.85)
scene.add(hemi)
const key = new THREE.DirectionalLight(0xfff4e0, 2.4)
key.position.set(2.8, 6.5, 3.2)
key.castShadow = true
key.shadow.mapSize.set(1024, 1024)
key.shadow.camera.near = 0.5
key.shadow.camera.far = 20
scene.add(key)
const rim = new THREE.DirectionalLight(0x7eb6ff, 1.35)
rim.position.set(-3.5, 2.5, -2)
scene.add(rim)
const fill = new THREE.PointLight(0xff9f6b, 1.1, 14)
fill.position.set(-1.8, 1.4, 2.2)
scene.add(fill)
const boardLight = new THREE.PointLight(0xa8ffce, 0.55, 10)
boardLight.position.set(0, 3.2, -2.5)
scene.add(boardLight)

const clock = new THREE.Clock(false)
let mixer = null
const actions = {}
let clips = {}
let activeName = null
let ready = false
let currentBeatIdx = -1
let renderMode = false
let lastScrubT = 0
let characterRoot = null

function setCaption(html) {
  captionEl.innerHTML = html
  captionEl.classList.remove('show')
  void captionEl.offsetWidth
  captionEl.classList.add('show')
}

/** Hard-switch clip for deterministic offline scrubbing (no crossFade). */
function switchAnim(name) {
  const next = actions[name] || actions.idle || actions.talking
  if (!next) return
  if (activeName === name && next.isRunning()) return

  for (const action of Object.values(actions)) {
    if (!action) continue
    action.stop()
    action.enabled = false
    action.setEffectiveWeight(0)
    action.paused = true
  }

  next.enabled = true
  next.paused = true // we scrub time manually in render mode
  next.setEffectiveWeight(1)
  next.setEffectiveTimeScale(1)
  next.setLoop(THREE.LoopRepeat, Infinity)
  next.reset()
  next.play()
  activeName = name
}

function beatAt(t) {
  return BEATS.find((b) => t >= b.t0 && t < b.t1) || BEATS[BEATS.length - 1]
}

function updateBeat(t) {
  const idx = BEATS.findIndex((b) => t >= b.t0 && t < b.t1)
  if (idx === -1) return
  if (idx !== currentBeatIdx) {
    currentBeatIdx = idx
    const beat = BEATS[idx]
    switchAnim(beat.anim)
    setCaption(beat.html)
  }
  progressEl.style.width = `${Math.min(100, (t / DURATION) * 100)}%`
}

function applyPoseAt(t) {
  if (!mixer || !activeName || !actions[activeName] || !characterRoot) return
  const beat = beatAt(t)
  const action = actions[activeName]
  const clip = clips[activeName] || action.getClip()
  const local = Math.max(0, t - beat.t0)
  // scrub within clip; loop if beat longer than clip
  action.enabled = true
  action.paused = true
  action.setEffectiveWeight(1)
  action.time = clip.duration > 0 ? local % clip.duration : 0
  // Force mixer to evaluate pose at this absolute action.time
  mixer.update(1e-6)
  characterRoot.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton) o.skeleton.update()
  })
}

function updateEnvironment(t) {
  stageRing.rotation.z = t * 0.7
  for (const orb of orbs) {
    const { radius, speed, phase, yBase } = orb.userData
    orb.position.x = Math.cos(t * speed + phase) * radius
    orb.position.z = Math.sin(t * speed + phase) * radius * 0.55 - 1.2
    orb.position.y = yBase + Math.sin(t * speed * 1.4 + phase) * 0.15
  }
  // gentle camera push-in / orbit
  camera.position.x = Math.sin(t * 0.28) * 0.22
  camera.position.y = 1.45 + Math.sin(t * 0.4) * 0.04
  camera.position.z = 3.6 + Math.sin(t * 0.15) * 0.12
  camera.lookAt(0, 1.05, 0)
}

function frameAt(t) {
  renderMode = true
  updateBeat(t)
  applyPoseAt(t)
  updateEnvironment(t)
  lastScrubT = t
  renderer.render(scene, camera)
}

function stripRootMotion(clip) {
  // Keep character planted on stage — zero hips translation tracks
  for (const track of clip.tracks) {
    if (/hips\.position/i.test(track.name)) {
      const vals = track.values
      for (let i = 0; i < vals.length; i += 3) {
        vals[i] = 0 // x
        vals[i + 2] = 0 // z
      }
    }
  }
  return clip
}

/**
 * Mixamo character FBXs often embed many duplicate armatures.
 * PropertyBinding resolves bones by name and hits the WRONG copy first,
 * so animations appear frozen. Keep only bones used by SkinnedMesh skeletons.
 */
function pruneUnusedBones(root) {
  const used = new Set()
  const skinned = []
  root.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton) {
      skinned.push(o)
      for (const b of o.skeleton.bones) used.add(b)
    }
  })
  if (!skinned.length) {
    console.warn('No SkinnedMesh found — cannot prune armatures')
    return { removed: 0, kept: 0, skinned: 0 }
  }

  // Keep ancestors of used bones so hierarchy stays valid
  for (const b of [...used]) {
    let p = b.parent
    while (p && p !== root) {
      used.add(p)
      p = p.parent
    }
  }

  const removeList = []
  root.traverse((o) => {
    if ((o.isBone || o.type === 'Bone') && !used.has(o)) removeList.push(o)
  })
  for (const b of removeList) b.parent?.remove(b)

  // Deduplicate by name: if multiple used bones share a name (shouldn't after prune),
  // rename extras so PropertyBinding is unambiguous.
  const byName = new Map()
  root.traverse((o) => {
    if (!(o.isBone || o.type === 'Bone')) return
    if (!byName.has(o.name)) byName.set(o.name, [])
    byName.get(o.name).push(o)
  })
  let renamed = 0
  for (const [name, list] of byName) {
    if (list.length <= 1) continue
    // Prefer bone that belongs to a skinned skeleton
    const preferred =
      list.find((b) => skinned.some((m) => m.skeleton.bones.includes(b))) || list[0]
    list.forEach((b, i) => {
      if (b === preferred) return
      b.name = `${name}__dup${i}`
      renamed++
    })
  }

  console.log(
    `Armature prune: skinnedMeshes=${skinned.length} keptBones=${[...used].filter((u) => u.isBone).length} removed=${removeList.length} renamed=${renamed}`,
  )
  return { removed: removeList.length, kept: used.size, skinned: skinned.length, renamed }
}

function getSkinnedBone(root, name) {
  let found = null
  root.traverse((o) => {
    if (found) return
    if (o.isSkinnedMesh && o.skeleton) {
      const b = o.skeleton.bones.find((bone) => bone.name === name)
      if (b) found = b
    }
  })
  return found || root.getObjectByName(name)
}

function maxBoneMotion(root, names, t0, t1) {
  switchAnim('wave')
  applyPoseAt(t0)
  const before = {}
  for (const n of names) {
    const b = getSkinnedBone(root, n)
    if (b) before[n] = b.quaternion.clone()
  }
  applyPoseAt(t1)
  let maxAng = 0
  let best = null
  for (const n of names) {
    const b = getSkinnedBone(root, n)
    if (!b || !before[n]) continue
    const ang = before[n].angleTo(b.quaternion)
    if (ang > maxAng) {
      maxAng = ang
      best = n
    }
  }
  return { maxAng, best }
}

async function loadAssets() {
  const loader = new FBXLoader()
  const character = await loader.loadAsync('/assets/the-boss.fbx')
  characterRoot = character

  const pruneInfo = pruneUnusedBones(character)
  console.log('Prune result', pruneInfo)

  const box = new THREE.Box3().setFromObject(character)
  const size = new THREE.Vector3()
  box.getSize(size)
  const targetHeight = 1.75
  const scale = targetHeight / (size.y || 1)
  character.scale.setScalar(scale)
  box.setFromObject(character)
  const center = new THREE.Vector3()
  box.getCenter(center)
  character.position.x -= center.x
  character.position.z -= center.z
  character.position.y -= box.min.y
  character.position.y += 0.12 // stand on stage

  character.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const m of mats) {
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace
          m.side = THREE.FrontSide
        }
      }
    }
  })
  scene.add(character)

  // Mixer AFTER prune so PropertyBinding hits the skinned rig
  mixer = new THREE.AnimationMixer(character)

  const animFiles = {
    idle: '/assets/idle.fbx',
    talking: '/assets/talking.fbx',
    pointing: '/assets/pointing.fbx',
    thinking: '/assets/thinking.fbx',
    lookAround: '/assets/nervously-look-around.fbx',
    celebrate: '/assets/celebrate.fbx',
    wave: '/assets/wave.fbx',
  }

  await Promise.all(
    Object.entries(animFiles).map(async ([name, url]) => {
      try {
        const fbx = await loader.loadAsync(url)
        let clip = fbx.animations?.[0]
        if (!clip) return
        clip = clip.clone()
        clip.name = name
        stripRootMotion(clip)
        clips[name] = clip
        const action = mixer.clipAction(clip, character)
        action.clampWhenFinished = false
        actions[name] = action
      } catch (e) {
        console.warn('Missing anim', name, e.message)
      }
    }),
  )

  // fallbacks
  if (!actions.wave) actions.wave = actions.idle
  if (!actions.celebrate) actions.celebrate = actions.talking
  if (!actions.thinking) actions.thinking = actions.idle
  if (!actions.lookAround) actions.lookAround = actions.thinking || actions.idle
  if (!actions.pointing) actions.pointing = actions.talking
  if (!actions.talking) actions.talking = actions.idle

  const probeBones = [
    'mixamorigRightArm',
    'mixamorigRightForeArm',
    'mixamorigRightHand',
    'mixamorigLeftArm',
    'mixamorigSpine',
    'mixamorigHips',
  ]
  const { maxAng, best } = maxBoneMotion(character, probeBones, 0, 0.8)
  // also try pointing clip which should be very obvious
  switchAnim('pointing')
  applyPoseAt(14)
  const qA = {}
  for (const n of probeBones) {
    const b = getSkinnedBone(character, n)
    if (b) qA[n] = b.quaternion.clone()
  }
  applyPoseAt(16)
  let pointAng = 0
  for (const n of probeBones) {
    const b = getSkinnedBone(character, n)
    if (!b || !qA[n]) continue
    pointAng = Math.max(pointAng, qA[n].angleTo(b.quaternion))
  }

  const moved = maxAng > 0.05 || pointAng > 0.05
  console.log(
    `Anim scrub check moved=${moved} waveMax=${maxAng.toFixed(4)}(${best}) pointMax=${pointAng.toFixed(4)} actions=`,
    Object.keys(actions),
  )
  if (!moved) console.warn('WARNING: animation scrub may not be binding to bones')

  switchAnim('wave')
  setCaption(BEATS[0].html)
  ready = true
  window.__MS_READY = true
  window.__MS_ANIM_OK = moved
  clock.start()
}

function animate() {
  requestAnimationFrame(animate)
  if (!ready || renderMode) return
  const t = clock.getElapsedTime() % DURATION
  const dt = clock.getDelta()
  updateBeat(t)
  // live preview: unpause and let mixer advance
  if (actions[activeName]) {
    actions[activeName].paused = false
  }
  if (mixer) mixer.update(dt)
  updateEnvironment(t)
  renderer.render(scene, camera)
}


function debug() {
  const root = characterRoot
  const allBoneNames = []
  const uniqueBones = []
  const seen = new Set()
  if (root) {
    root.traverse((obj) => {
      if (!(obj.isBone || obj.type === 'Bone')) return
      allBoneNames.push(obj.name)
      if (!seen.has(obj.name)) {
        seen.add(obj.name)
        uniqueBones.push(obj.name)
      }
    })
  }
  const bones = uniqueBones.slice(0, 40)

  const clipInfo = {}
  for (const [name, clip] of Object.entries(clips)) {
    if (!clip) continue
    const trackNames = clip.tracks.map((t) => t.name)
    clipInfo[name] = {
      duration: clip.duration,
      trackCount: trackNames.length,
      tracks: trackNames.slice(0, 15),
    }
  }

  const trackBoneMatches = {}
  for (const [name, clip] of Object.entries(clips)) {
    if (!clip) continue
    const trackNames = clip.tracks.map((t) => t.name)
    const hits = {}
    const misses = []
    for (const bn of bones) {
      const matching = trackNames.filter((tn) => tn.includes(bn))
      if (matching.length) hits[bn] = matching.slice(0, 3)
      else misses.push(bn)
    }
    // Also: do track base names (before .) exist as unique bones?
    const trackBases = [...new Set(trackNames.map((tn) => tn.split('.')[0]))]
    const basesMissingFromUniqueBones = trackBases.filter((b) => !seen.has(b))
    trackBoneMatches[name] = {
      matchedBoneCount: Object.keys(hits).length,
      uniqueBoneCount: uniqueBones.length,
      sampleMatches: Object.fromEntries(Object.entries(hits).slice(0, 12)),
      unmatchedBonesSample: misses.slice(0, 15),
      trackBasesMissingFromSkeleton: basesMissingFromUniqueBones,
      trackNameSamples: trackNames.slice(0, 15),
    }
  }

  function quatOf(name) {
    const b = root?.getObjectByName(name)
    if (!b) return null
    return {
      name: b.name,
      type: b.type,
      isBone: !!b.isBone,
      x: b.quaternion.x,
      y: b.quaternion.y,
      z: b.quaternion.z,
      w: b.quaternion.w,
    }
  }

  function sampleArmHand(limit = 5) {
    const out = {}
    if (!root) return out
    let n = 0
    root.traverse((obj) => {
      if (n >= limit) return
      if (!obj.name || !/Arm|Hand/.test(obj.name)) return
      // prefer bones; still capture named nodes if type differs
      if (!(obj.isBone || obj.type === 'Bone' || /Arm|Hand/.test(obj.name))) return
      if (out[obj.name]) return
      out[obj.name] = {
        type: obj.type,
        isBone: !!obj.isBone,
        x: obj.quaternion.x,
        y: obj.quaternion.y,
        z: obj.quaternion.z,
        w: obj.quaternion.w,
      }
      n++
    })
    return out
  }

  const keyBones = [
    'mixamorigRightArm',
    'mixamorigLeftArm',
    'mixamorigHips',
    'mixamorigSpine',
  ]

  switchAnim('wave')
  applyPoseAt(0)
  const at0 = {}
  for (const k of keyBones) at0[k] = quatOf(k)
  Object.assign(at0, sampleArmHand(5))

  applyPoseAt(0.5)
  const at0_5 = {}
  for (const k of keyBones) at0_5[k] = quatOf(k)
  Object.assign(at0_5, sampleArmHand(5))

  return {
    boneCountRaw: allBoneNames.length,
    uniqueBoneCount: uniqueBones.length,
    bones,
    allUniqueBones: uniqueBones,
    clips: clipInfo,
    trackBoneMatches,
    samplePoses: { at0, at0_5 },
  }
}

window.__MS = {
  ready: () => ready,
  duration: DURATION,
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  frameAt,
  canvas,
  actions: () => Object.keys(actions),
  animOk: () => window.__MS_ANIM_OK,
  debug,
}

loadAssets()
  .then(() => {
    console.log('MentorScroll scene ready', Object.keys(actions))
    animate()
  })
  .catch((e) => {
    console.error(e)
    window.__MS_ERROR = String(e)
  })
