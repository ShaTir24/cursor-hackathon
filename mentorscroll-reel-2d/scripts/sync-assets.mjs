#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const KENNEY = path.join(ROOT, '..', 'kenney', 'assets')
const DST = path.join(ROOT, 'assets', 'kenney')

// Asset cast from plans/birthday_paradox_20260718.md (verified against inventory)
const NEEDED = [
  'shape-characters/PNG/Default/yellow_body_squircle.png',
  'shape-characters/PNG/Default/face_c.png',
  'shape-characters/PNG/Default/hand_yellow_point.png',
  'shape-characters/PNG/Default/hand_yellow_open.png',
  'shape-characters/PNG/Default/tile_exclamation.png',
  'game-icons/PNG/Black/2x/question.png',
  'game-icons/PNG/Black/2x/cross.png',
  'game-icons/PNG/Black/2x/checkmark.png',
  'game-icons/PNG/Black/2x/arrowRight.png',
  'game-icons/PNG/Black/2x/exclamation.png',
  'game-icons/PNG/Black/2x/star.png',
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
