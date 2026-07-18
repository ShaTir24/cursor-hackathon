#!/usr/bin/env node
/**
 * Chunked render: render FRAME_START..FRAME_END into a segment mp4 via jpeg pipe.
 * Env: CHUNK_START, CHUNK_END, CHUNK_OUT, PORT (optional)
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
const PORT = Number(process.env.PORT || 5188)
const CHUNK_START = Number(process.env.CHUNK_START || 0)
const CHUNK_END = Number(process.env.CHUNK_END || 150)
const CHUNK_OUT = process.env.CHUNK_OUT

if (!CHUNK_OUT) {
  console.error('CHUNK_OUT required')
  process.exit(1)
}

function mime(p) {
  if (p.endsWith('.html')) return 'text/html'
  if (p.endsWith('.js') || p.endsWith('.mjs')) return 'text/javascript'
  if (p.endsWith('.css')) return 'text/css'
  if (p.endsWith('.png')) return 'image/png'
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg'
  if (p.endsWith('.svg')) return 'image/svg+xml'
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

async function main() {
  await import(path.join(__dirname, 'sync-assets.mjs'))
  fs.mkdirSync(path.dirname(CHUNK_OUT), { recursive: true })

  const server = await startServer()
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  })
  await page.goto(`http://127.0.0.1:${PORT}/public/index.html`, {
    waitUntil: 'networkidle',
    timeout: 120000,
  })
  await page.waitForFunction(() => window.__MS_READY === true, null, { timeout: 60000 })

  const meta = await page.evaluate(() => ({
    duration: window.__MS.duration,
    fps: window.__MS.fps,
  }))
  const fps = meta.fps
  const end = Math.min(CHUNK_END, Math.round(meta.duration * fps))
  console.log(`chunk frames ${CHUNK_START}..${end - 1} @ ${fps}fps → ${CHUNK_OUT}`)

  const ff = spawn(
    'ffmpeg',
    [
      '-y',
      '-f',
      'image2pipe',
      '-framerate',
      String(fps),
      '-i',
      'pipe:0',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '18',
      '-an',
      CHUNK_OUT,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  )
  const ffDone = new Promise((resolve, reject) => {
    ff.on('error', reject)
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))))
  })

  const stage = page.locator('#stage')
  for (let i = CHUNK_START; i < end; i++) {
    const t = i / fps
    await page.evaluate((time) => window.__MS.frameAt(time), t)
    const buf = await stage.screenshot({ type: 'jpeg', quality: 90 })
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
    if ((i - CHUNK_START) % 50 === 0) console.log(`  ${i}/${end}`)
  }
  ff.stdin.end()
  await ffDone
  await browser.close()
  server.close()
  console.log('chunk done', CHUNK_OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
