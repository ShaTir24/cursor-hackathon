#!/usr/bin/env node
/**
 * Debug Mixamo bone vs animation track name mismatch
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
const PORT = 5178
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
      throw new Error(`Scene error: ${err}`)
    }

    const data = await page.evaluate(() => {
      if (!window.__MS?.debug) throw new Error('window.__MS.debug missing')
      return window.__MS.debug()
    })

    console.log('\n===== DEBUG ANIM JSON =====')
    console.log(JSON.stringify(data, null, 2))
    console.log('===== END DEBUG ANIM JSON =====\n')
  } catch (e) {
    console.error('\nDEBUG FAILED:', e?.message || e)
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
