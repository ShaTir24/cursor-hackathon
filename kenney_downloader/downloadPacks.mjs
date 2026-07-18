#!/usr/bin/env node
/**
 * Download Kenney CC0 packs into kenney/assets/ and write inventory.json per pack.
 * Usage: node kenney_downloader/downloadPacks.mjs
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import http from 'node:http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'kenney', 'assets')

const PACKS = [
  {
    id: 'game-icons',
    url: 'https://kenney.nl/media/pages/assets/game-icons/1ebf9c14af-1677661579/kenney_game-icons.zip',
  },
  {
    id: 'shape-characters',
    url: 'https://kenney.nl/media/pages/assets/shape-characters/c016420b08-1698339465/kenney_shape-characters.zip',
  },
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const lib = url.startsWith('https') ? https : http
    const req = lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlinkSync(dest)
        return download(res.headers.location, dest).then(resolve, reject)
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve()))
    })
    req.on('error', reject)
  })
}

function unzip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    const p = spawn('unzip', ['-qo', zipPath, '-d', destDir], { stdio: 'inherit' })
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`unzip ${code}`))))
  })
}

function walkPngs(dir, base = dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const st = fs.statSync(full)
    if (st.isDirectory()) out.push(...walkPngs(full, base))
    else if (name.toLowerCase().endsWith('.png')) out.push(path.relative(base, full))
  }
  return out.sort()
}

async function ensurePack(pack) {
  const destDir = path.join(OUT, pack.id)
  const invPath = path.join(destDir, 'inventory.json')
  fs.mkdirSync(destDir, { recursive: true })

  const existing = walkPngs(destDir)
  if (existing.length > 20) {
    console.log(`[skip] ${pack.id} already has ${existing.length} PNGs`)
    fs.writeFileSync(
      invPath,
      JSON.stringify({ id: pack.id, url: pack.url, license: 'CC0', files: existing }, null, 2),
    )
    return
  }

  const zipPath = path.join(OUT, `${pack.id}.zip`)
  console.log(`[dl] ${pack.id}`)
  await download(pack.url, zipPath)
  await unzip(zipPath, destDir)
  fs.unlinkSync(zipPath)
  const files = walkPngs(destDir)
  fs.writeFileSync(
    invPath,
    JSON.stringify({ id: pack.id, url: pack.url, license: 'CC0', files }, null, 2),
  )
  console.log(`[ok] ${pack.id}: ${files.length} PNGs`)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  fs.mkdirSync(path.join(ROOT, 'assets', 'freepik'), { recursive: true })
  for (const pack of PACKS) await ensurePack(pack)
  console.log('Done. Assets in kenney/assets/')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
