#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const KENNEY = path.join(ROOT, '..', 'kenney', 'assets')
const DST = path.join(ROOT, 'assets', 'kenney')

// Asset cast from plans/cap_theorem_marvel_20260718.md (verified against inventory)
const NEEDED = [
  // Host narrator
  'shape-characters/PNG/Default/blue_body_squircle.png',
  'shape-characters/PNG/Default/face_a.png',
  'shape-characters/PNG/Default/blue_hand_point.png',
  'shape-characters/PNG/Default/blue_hand_open.png',
  'shape-characters/PNG/Default/tile_exclamation.png',
  // Vision / Consistency (gold/yellow)
  'shape-characters/PNG/Default/yellow_body_circle.png',
  'shape-characters/PNG/Default/hand_yellow_point.png',
  'shape-characters/PNG/Default/face_b.png',
  // Spider-Man / Availability (red)
  'shape-characters/PNG/Default/red_body_squircle.png',
  'shape-characters/PNG/Default/red_hand_open.png',
  'shape-characters/PNG/Default/face_c.png',
  // Doctor Strange / Partition (green+gold)
  'shape-characters/PNG/Default/green_body_square.png',
  'shape-characters/PNG/Default/green_hand_point.png',
  'shape-characters/PNG/Default/face_d.png',
  // Icons
  'game-icons/PNG/White/2x/locked.png',
  'game-icons/PNG/White/2x/checkmark.png',
  'game-icons/PNG/White/2x/signal3.png',
  'game-icons/PNG/White/2x/unlocked.png',
  'game-icons/PNG/White/2x/warning.png',
  'game-icons/PNG/White/2x/cross.png',
  'game-icons/PNG/White/2x/star.png',
  'game-icons/PNG/White/2x/trophy.png',
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
