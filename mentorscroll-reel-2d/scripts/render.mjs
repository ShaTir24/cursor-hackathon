#!/usr/bin/env node
/**
 * Headless render: Playwright captures #stage frames → FFmpeg MP4 + WebM
 * Streams JPEG frames into ffmpeg (avoids writing ~GB of PNGs to disk).
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import { createReadStream, statSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, '..', 'outputs')
const PORT = 5178
const TOPIC = 'birthday_paradox'

function mime(p) {
  if (p.endsWith('.html')) return 'text/html'
  if (p.endsWith('.js') || p.endsWith('.mjs')) return 'text/javascript'
  if (p.endsWith('.css')) return 'text/css'
  if (p.endsWith('.png')) return 'image/png'
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg'
  if (p.endsWith('.svg')) return 'image/svg+xml'
  if (p.endsWith('.json')) return 'application/json'
  return 'application/octet-stream'
}

function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0])
    if (urlPath === '/') urlPath = '/public/index.html'
    const filePath = path.join(ROOT, urlPath.replace(/^\//, ''))
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404)
      res.end('not found')
      return
    }
    res.writeHead(200, { 'Content-Type': mime(filePath) })
    createReadStream(filePath).pipe(res)
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(PORT, '127.0.0.1', () => resolve(server))
  })
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] })
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))))
  })
}

function spawnFfmpegPipe(args) {
  const p = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] })
  const done = new Promise((resolve, reject) => {
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))))
  })
  return { proc: p, done }
}

async function main() {
  const sync = path.join(__dirname, 'sync-assets.mjs')
  await import(sync)

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const stamp = Date.now()
  const mp4 = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_${stamp}.mp4`)
  const webm = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_${stamp}.webm`)

  console.log('Starting static server...')
  const server = await startServer()

  console.log('Launching Chromium...')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  })

  await page.goto(`http://127.0.0.1:${PORT}/public/index.html`, {
    waitUntil: 'networkidle',
    timeout: 120000,
  })

  console.log('Waiting for scene...')
  await page.waitForFunction(() => window.__MS_READY === true || window.__MS_ERROR, null, {
    timeout: 60000,
  })
  const err = await page.evaluate(() => window.__MS_ERROR || null)
  if (err) throw new Error(`Scene error: ${err}`)

  const meta = await page.evaluate(() => ({
    duration: window.__MS.duration,
    fps: window.__MS.fps,
    visualOk: window.__MS.visualOk(),
    beats: window.__MS.beats(),
  }))
  console.log('beats:', meta.beats, 'visualOk:', meta.visualOk)
  if (!meta.visualOk) throw new Error('visualOk failed — diagrams would look frozen')

  const totalFrames = Math.round(meta.duration * meta.fps)
  console.log(`Streaming ${totalFrames} frames @ ${meta.fps}fps (${meta.duration}s) → MP4`)

  const { proc: ff, done: ffDone } = spawnFfmpegPipe([
    '-y',
    '-f',
    'image2pipe',
    '-framerate',
    String(meta.fps),
    '-i',
    'pipe:0',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '18',
    '-movflags',
    '+faststart',
    mp4,
  ])

  const stage = page.locator('#stage')
  for (let i = 0; i < totalFrames; i++) {
    const t = i / meta.fps
    await page.evaluate((time) => window.__MS.frameAt(time), t)
    const buf = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      clip: { x: 0, y: 0, width: 1080, height: 1920 },
      animations: 'disabled',
      caret: 'hide',
    })
    if (!ff.stdin.write(buf)) {
      await new Promise((r) => ff.stdin.once('drain', r))
    }
    if (i % 90 === 0) console.log(`  frame ${i}/${totalFrames}`)
  }
  ff.stdin.end()
  await ffDone

  await browser.close()
  server.close()

  const vo = path.join(OUT_DIR, 'audio', `${TOPIC}_vo.mp3`)
  let withVo = null
  if (fs.existsSync(vo)) {
    withVo = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_with_vo_${stamp}.mp4`)
    console.log('Muxing VO…')
    await runFfmpeg([
      '-y',
      '-i',
      mp4,
      '-i',
      vo,
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-shortest',
      withVo,
    ])
  }

  console.log('\nDone!')
  console.log('MP4:', mp4)
  if (withVo) console.log('MP4+VO:', withVo)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
