#!/usr/bin/env node
/**
 * Fast pipe render: Playwright JPEG frames → ffmpeg stdin → MP4 (+ VO mux)
 * Avoids writing thousands of PNGs to a tight disk.
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
const PORT = 5188
const TOPIC = 'cap_theorem_marvel'

function mime(p) {
  if (p.endsWith('.html')) return 'text/html'
  if (p.endsWith('.js') || p.endsWith('.mjs')) return 'text/javascript'
  if (p.endsWith('.css')) return 'text/css'
  if (p.endsWith('.png')) return 'image/png'
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg'
  if (p.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}

async function main() {
  await import(path.join(__dirname, 'sync-assets.mjs'))
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const stamp = Date.now()
  const mp4 = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_${stamp}.mp4`)

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
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r))

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  await page.goto(`http://127.0.0.1:${PORT}/public/index.html`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForFunction(() => window.__MS_READY === true || window.__MS_ERROR, null, { timeout: 60000 })
  const err = await page.evaluate(() => window.__MS_ERROR || null)
  if (err) throw new Error(err)

  const meta = await page.evaluate(() => ({
    duration: window.__MS.duration,
    fps: window.__MS.fps,
    visualOk: window.__MS.visualOk(),
  }))
  if (!meta.visualOk) throw new Error('visualOk failed')
  const totalFrames = Math.round(meta.duration * meta.fps)
  console.log(`Piping ${totalFrames} JPEG frames @ ${meta.fps}fps (${meta.duration}s)`)

  const ff = spawn(
    'ffmpeg',
    [
      '-y',
      '-f',
      'image2pipe',
      '-framerate',
      String(meta.fps),
      '-i',
      '-',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '20',
      '-movflags',
      '+faststart',
      mp4,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  )

  for (let i = 0; i < totalFrames; i++) {
    const t = i / meta.fps
    await page.evaluate((time) => window.__MS.frameAt(time), t)
    const buf = await page.screenshot({
      type: 'jpeg',
      quality: 85,
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
  await new Promise((resolve, reject) => {
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))))
    ff.on('error', reject)
  })

  await browser.close()
  server.close()

  const vo = path.join(OUT_DIR, 'audio', `${TOPIC}_vo.mp3`)
  let withVo = null
  if (fs.existsSync(vo)) {
    withVo = path.join(OUT_DIR, `mentorscroll2d_${TOPIC}_with_vo_${stamp}.mp4`)
    console.log('Muxing VO…')
    await new Promise((resolve, reject) => {
      const p = spawn(
        'ffmpeg',
        ['-y', '-i', mp4, '-i', vo, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', withVo],
        { stdio: 'inherit' },
      )
      p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`mux exit ${code}`))))
    })
  }

  console.log('MP4:', mp4)
  if (withVo) console.log('MP4+VO:', withVo)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
