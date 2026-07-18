#!/usr/bin/env node
/**
 * Headless render: Playwright captures #stage frames → FFmpeg MP4 + WebM
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
const TOPIC = 'newtons_laws_ranked'

function mime(p) {
  if (p.endsWith('.html')) return 'text/html'
  if (p.endsWith('.js') || p.endsWith('.mjs')) return 'text/javascript'
  if (p.endsWith('.css')) return 'text/css'
  if (p.endsWith('.png')) return 'image/png'
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
  return new Promise((resolve) => {
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

async function main() {
  // sync assets first if missing
  const sync = path.join(__dirname, 'sync-assets.mjs')
  await import(sync)

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const stamp = Date.now()
  const mp4 = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_${stamp}.mp4`)
  const webm = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_${stamp}.webm`)
  const framesDir = path.join(OUT_DIR, `frames_2d_${TOPIC}_${stamp}`)
  fs.mkdirSync(framesDir, { recursive: true })

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
  console.log(`Rendering ${totalFrames} frames @ ${meta.fps}fps (${meta.duration}s)`)

  for (let i = 0; i < totalFrames; i++) {
    const t = i / meta.fps
    await page.evaluate((time) => window.__MS.frameAt(time), t)
    const framePath = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`)
    await page.locator('#stage').screenshot({ path: framePath, type: 'png' })
    if (i % 30 === 0) console.log(`  frame ${i}/${totalFrames}`)
  }

  await browser.close()
  server.close()

  console.log('Encoding MP4 + WebM...')
  await Promise.all([
    runFfmpeg([
      '-y',
      '-framerate',
      String(meta.fps),
      '-i',
      path.join(framesDir, 'frame_%05d.png'),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '18',
      '-movflags',
      '+faststart',
      mp4,
    ]),
    runFfmpeg([
      '-y',
      '-framerate',
      String(meta.fps),
      '-i',
      path.join(framesDir, 'frame_%05d.png'),
      '-c:v',
      'libvpx-vp9',
      '-b:v',
      '0',
      '-crf',
      '32',
      '-row-mt',
      '1',
      webm,
    ]),
  ])

  console.log('Removing temporary frames...')
  fs.rmSync(framesDir, { recursive: true, force: true })

  // Mux ElevenLabs VO when present
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
  console.log('WebM:', webm)
  if (withVo) console.log('MP4+VO:', withVo)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
