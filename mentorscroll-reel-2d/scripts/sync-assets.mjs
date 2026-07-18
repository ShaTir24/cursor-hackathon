#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const KENNEY = path.join(ROOT, '..', 'kenney', 'assets')
const DST = path.join(ROOT, 'assets', 'kenney')

// Asset cast from plans/newtons_laws_ranked_20260718.md (verified against inventory)
const NEEDED = [
  // Character (persistent)
  'shape-characters/PNG/Default/green_body_squircle.png',
  'shape-characters/PNG/Default/face_a.png',
  'shape-characters/PNG/Default/green_hand_point.png',
  'shape-characters/PNG/Default/green_hand_open.png',
  'shape-characters/PNG/Default/green_hand_rock.png',
  // Beat 1 — hook
  'game-icons/PNG/White/2x/gamepad.png',
  'game-icons/PNG/White/2x/exclamation.png',
  // Beat 2 — inertia
  'game-icons/PNG/White/2x/joystick.png',
  'game-icons/PNG/White/2x/arrowRight.png',
  // Beat 3 — F=ma
  'game-icons/PNG/White/2x/target.png',
  // Beat 4 — action/reaction
  'game-icons/PNG/White/2x/arrowLeft.png',
  // Beat 5 — rank up
  'game-icons/PNG/White/2x/trophy.png',
  'game-icons/PNG/White/2x/medal1.png',
  'game-icons/PNG/White/2x/medal2.png',
]

function copyOne(rel) {
  const from = path.join(KENNEY, rel)
  const to = path.join(DST, rel)
  if (!fs.existsSync(from)) {
    console.warn('missing:', rel)
    return false
  }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  return true
}

fs.mkdirSync(DST, { recursive: true })

let ok = 0
for (const rel of NEEDED) if (copyOne(rel)) ok++
console.log(`Synced ${ok}/${NEEDED.length} Kenney sprites → assets/kenney/`)
if (ok !== NEEDED.length) process.exit(1)
