#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const KENNEY = path.join(ROOT, '..', 'kenney', 'assets')
const DST = path.join(ROOT, 'assets', 'kenney')

// Asset cast from plans/special_relativity_20260718.md (verified against inventory)
const NEEDED = [
  'shape-characters/PNG/Default/blue_body_squircle.png',
  'shape-characters/PNG/Default/face_a.png',
  'shape-characters/PNG/Default/blue_hand_point.png',
  'shape-characters/PNG/Default/blue_hand_open.png',
  'shape-characters/PNG/Default/tile_exclamation.png',
  'game-icons/PNG/White/2x/star.png',
  'game-icons/PNG/White/2x/checkmark.png',
  'game-icons/PNG/White/2x/arrowRight.png',
  'game-icons/PNG/White/2x/warning.png',
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
