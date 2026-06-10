// Dev-only visual smoke: screenshots the main screens at a mobile viewport.
// Usage: node scripts/screenshot.mjs [baseUrl]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:5173'
const outDir = 'screenshots'
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

const shots = [
  ['home', '/'],
  ['exercises', '/exercises'],
  ['detail', '/exercise/Dumbbell_Bench_Press'],
  ['session', '/session/CHEST_TRICEPS'],
  ['plan', '/program'],
  ['map', '/map'],
]

for (const [name, path] of shots) {
  await page.goto(base + path, { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${outDir}/${name}.png` })
  console.log('shot', name)
}

const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
if (errors.length) console.error('PAGE ERRORS:', errors)
await browser.close()
