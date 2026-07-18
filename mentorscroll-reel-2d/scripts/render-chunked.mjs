#!/usr/bin/env node
/**
 * Chunked render — restart Chromium every CHUNK frames (avoids mid-run browser death).
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
const PORT = 5191
const TOPIC = 'cap_theorem_marvel'
const CHUNK = 240

function mime(p) {
  if (p.endsWith('.html')) return 'text/html'
  if (p.endsWith('.js') || p.endsWith('.mjs')) return 'text/javascript'
  if (p.endsWith('.css')) return 'text/css'
  if (p.endsWith('.png')) return 'image/png'
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg'
  if (p.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' })
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))))
  })
}

async function openPage(serverReady) {
  await serverReady
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  await page.goto(`http://127.0.0.1:${PORT}/public/index.html`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForFunction(() => window.__MS_READY === true || window.__MS_ERROR, null, { timeout: 60000 })
  const err = await page.evaluate(() => window.__MS_ERROR || null)
  if (err) throw new Error(err)
  return { browser, page }
}

async function main() {
  await import(path.join(__dirname, 'sync-assets.mjs'))
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const stamp = Date.now()
  const framesDir = path.join(OUT_DIR, `frames_2d_${TOPIC}_${stamp}`)
  fs.mkdirSync(framesDir, { recursive: true })

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
  const serverReady = new Promise((r) => server.listen(PORT, '127.0.0.1', r))

  let { browser, page } = await openPage(serverReady)
  const meta = await page.evaluate(() => ({
    duration: window.__MS.duration,
    fps: window.__MS.fps,
    visualOk: window.__MS.visualOk(),
  }))
  if (!meta.visualOk) throw new Error('visualOk failed')
  const totalFrames = Math.round(meta.duration * meta.fps)
  console.log(`Chunked JPEG render: ${totalFrames} frames, chunk=${CHUNK}`)

  for (let i = 0; i < totalFrames; i++) {
    if (i > 0 && i % CHUNK === 0) {
      await browser.close()
      console.log(`  restarted browser at frame ${i}`)
      ;({ browser, page } = await openPage(Promise.resolve()))
    }
    const t = i / meta.fps
    await page.evaluate((time) => window.__MS.frameAt(time), t)
    const framePath = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.jpg`)
    await page.screenshot({
      path: framePath,
      type: 'jpeg',
      quality: 88,
      clip: { x: 0, y: 0, width: 1080, height: 1920 },
      animations: 'disabled',
      caret: 'hide',
    })
    if (i % 60 === 0) console.log(`  frame ${i}/${totalFrames}`)
  }
  await browser.close()
  server.close()

  const mp4 = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_${stamp}.mp4`)
  console.log('Encoding MP4…')
  await run('ffmpeg', [
    '-y',
    '-framerate',
    String(meta.fps),
    '-i',
    path.join(framesDir, 'frame_%05d.jpg'),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '20',
    '-movflags',
    '+faststart',
    mp4,
  ])

  fs.rmSync(framesDir, { recursive: true, force: true })

  const vo = path.join(OUT_DIR, 'audio', `${TOPIC}_vo.mp3`)
  let withVo = null
  if (fs.existsSync(vo)) {
    withVo = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_with_vo_${stamp}.mp4`)
    console.log('Muxing VO…')
    await run('ffmpeg', [
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

  console.log('MP4:', mp4)
  if (withVo) console.log('MP4+VO:', withVo)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
