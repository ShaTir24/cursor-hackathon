#!/usr/bin/env node
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import { createReadStream, statSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, '..', 'outputs')
const PORT = 5179

function mime(p) {
  if (p.endsWith('.html')) return 'text/html'
  if (p.endsWith('.js') || p.endsWith('.mjs')) return 'text/javascript'
  if (p.endsWith('.css')) return 'text/css'
  if (p.endsWith('.png')) return 'image/png'
  return 'application/octet-stream'
}

async function main() {
  await import(path.join(__dirname, 'sync-assets.mjs'))
  fs.mkdirSync(OUT_DIR, { recursive: true })

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
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
  await page.goto(`http://127.0.0.1:${PORT}/public/index.html`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  })
  await page.waitForFunction(() => window.__MS_READY || window.__MS_ERROR, null, { timeout: 30000 })
  const err = await page.evaluate(() => window.__MS_ERROR || null)
  if (err) throw new Error(err)

  const duration = await page.evaluate(() => window.__MS.duration)
  const times = [0.1, 0.4, 0.7].map((p) => p * duration)
  for (const t of times) {
    await page.evaluate((time) => window.__MS.frameAt(time), t)
    const out = path.join(OUT_DIR, `smoke_2d_cap_theorem_marvel_${String(t.toFixed(1)).replace('.', '_')}.png`)
    await page.locator('#stage').screenshot({ path: out, type: 'png' })
    console.log('wrote', out)
  }

  const ok = await page.evaluate(() => window.__MS.visualOk())
  console.log('visualOk:', ok)
  if (!ok) throw new Error('visualOk failed')

  await browser.close()
  server.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
