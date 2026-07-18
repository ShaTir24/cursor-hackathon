#!/usr/bin/env node
/**
 * Smoke test: load scene, frameAt(10), screenshot — fail fast before full render
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import { createReadStream, statSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const ASSETS_SRC = path.join(ROOT, '..', 'mixamo', 'assets')
const ASSETS_DST = path.join(ROOT, 'assets')
const OUT_DIR = path.join(ROOT, '..', 'outputs')
const PORT = 5177
const READY_TIMEOUT_MS = 120000

function mime(p) {
  if (p.endsWith('.html')) return 'text/html'
  if (p.endsWith('.js')) return 'text/javascript'
  if (p.endsWith('.mjs')) return 'text/javascript'
  if (p.endsWith('.css')) return 'text/css'
  if (p.endsWith('.fbx')) return 'application/octet-stream'
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg'
  if (p.endsWith('.png')) return 'image/png'
  if (p.endsWith('.json')) return 'application/json'
  return 'application/octet-stream'
}

function copyAssets() {
  fs.mkdirSync(ASSETS_DST, { recursive: true })
  if (!fs.existsSync(ASSETS_SRC)) {
    throw new Error(`Assets source missing: ${ASSETS_SRC}`)
  }
  for (const f of fs.readdirSync(ASSETS_SRC)) {
    const from = path.join(ASSETS_SRC, f)
    const to = path.join(ASSETS_DST, f)
    if (statSync(from).isFile()) {
      fs.copyFileSync(from, to)
    }
  }
  console.log(`Copied assets from ${ASSETS_SRC} → ${ASSETS_DST}`)
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

async function main() {
  const consoleLogs = []
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const shotPath = path.join(OUT_DIR, 'smoke_newton.png')

  console.log('Copying assets...')
  copyAssets()

  console.log(`Starting static server on ${PORT}...`)
  const server = await startServer()

  let browser
  try {
    console.log('Launching Chromium...')
    browser = await chromium.launch({
      headless: true,
      args: ['--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
    })
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1,
    })

    page.on('console', (msg) => {
      const line = `[${msg.type()}] ${msg.text()}`
      consoleLogs.push(line)
      console.log('PAGE:', line)
    })
    page.on('pageerror', (err) => {
      const line = `[pageerror] ${err.message}`
      consoleLogs.push(line)
      console.log('PAGE:', line)
    })
    page.on('requestfailed', (req) => {
      const line = `[requestfailed] ${req.url()} ${req.failure()?.errorText || ''}`
      consoleLogs.push(line)
      console.log('PAGE:', line)
    })

    await page.goto(`http://127.0.0.1:${PORT}/public/index.html`, {
      waitUntil: 'networkidle',
      timeout: READY_TIMEOUT_MS,
    })

    console.log('Waiting for __MS_READY / __MS_ERROR...')
    await page.waitForFunction(() => window.__MS_READY === true || window.__MS_ERROR, null, {
      timeout: READY_TIMEOUT_MS,
    })

    const err = await page.evaluate(() => window.__MS_ERROR || null)
    if (err) {
      throw new Error(`Scene error (character/load failed?): ${err}`)
    }

    const actionKeys = await page.evaluate(() => {
      if (window.__MS?.actions) {
        const a = window.__MS.actions
        return typeof a === 'function' ? a() : Object.keys(a)
      }
      return null
    })
    if (actionKeys) {
      console.log('actions keys:', JSON.stringify(actionKeys))
    } else {
      console.log('actions not exposed; see PAGE console logs above')
    }

    const animOk = await page.evaluate(() => window.__MS?.animOk?.() ?? window.__MS_ANIM_OK)
    console.log('animOk (bone moved):', animOk)
    if (!animOk) {
      throw new Error('Animation scrub check failed — bones did not move between t=0 and t=0.45')
    }

    // Capture multiple beats to verify motion + background
    const samples = [
      { t: 2, name: 'smoke_newton_wave.png' },
      { t: 10, name: 'smoke_newton_talk.png' },
      { t: 18, name: 'smoke_newton_point.png' },
      { t: 30, name: 'smoke_newton_look.png' },
      { t: 40, name: 'smoke_newton_win.png' },
    ]
    for (const s of samples) {
      await page.evaluate((time) => window.__MS.frameAt(time), s.t)
      const p = path.join(OUT_DIR, s.name)
      await page.locator('#c').screenshot({ path: p, type: 'png' })
      console.log('Screenshot:', p)
    }
    // keep legacy path too
    fs.copyFileSync(path.join(OUT_DIR, 'smoke_newton_talk.png'), shotPath)

    const meta = await page.evaluate(() => ({
      ready: window.__MS_READY,
      duration: window.__MS?.duration,
      fps: window.__MS?.fps,
      animOk: window.__MS?.animOk?.(),
    }))
    console.log('Smoke OK', meta)
  } catch (e) {
    console.error('\nSMOKE FAILED:', e?.message || e)
    console.error('\n--- Page console logs ---')
    if (consoleLogs.length === 0) console.error('(none captured)')
    else consoleLogs.forEach((l) => console.error(l))
    console.error('--- end logs ---\n')
    process.exitCode = 1
  } finally {
    if (browser) await browser.close().catch(() => {})
    server.close()
  }

  if (process.exitCode) process.exit(process.exitCode)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
