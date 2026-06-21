// Dev-only: harvest every short (videoId | title) from a channel's shorts tab
// by scrolling until the list stops growing. Output: scripts/shorts-list.txt
// Usage: node scripts/harvest-shorts.mjs
import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'

const CHANNEL_SHORTS_URL = 'https://www.youtube.com/@DeltaBolic/shorts'
const OUT = 'scripts/shorts-list.txt'

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(CHANNEL_SHORTS_URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3000)

// Dismiss a consent dialog if one appears.
const consent = page.locator('button[aria-label*="Accept"], button:has-text("Accept all")').first()
if (await consent.isVisible().catch(() => false)) {
  await consent.click()
  await page.waitForTimeout(2000)
}

const collect = () =>
  page.evaluate(() => {
    const out = {}
    for (const a of document.querySelectorAll('a[href*="/shorts/"]')) {
      const match = a.getAttribute('href')?.match(/\/shorts\/([\w-]{11})/)
      if (!match) continue
      const host = a.closest('ytm-shorts-lockup-view-model, ytd-rich-item-renderer') ?? a
      const title =
        host.querySelector('h3, [class*="title"]')?.textContent?.trim() ||
        a.getAttribute('title') ||
        a.getAttribute('aria-label') ||
        ''
      if (!out[match[1]] && title) out[match[1]] = title.replace(/\s+/g, ' ')
    }
    return out
  })

let items = {}
let stableRounds = 0
for (let i = 0; i < 80 && stableRounds < 5; i++) {
  await page.keyboard.press('End')
  await page.waitForTimeout(1500)
  const next = await collect()
  const before = Object.keys(items).length
  items = { ...next, ...items }
  stableRounds = Object.keys(items).length === before ? stableRounds + 1 : 0
  process.stdout.write(`\rcollected: ${Object.keys(items).length} (round ${i + 1})   `)
}

const lines = Object.entries(items).map(([id, title]) => `${id} | ${title}`)
writeFileSync(OUT, lines.join('\n'), 'utf8')
console.log(`\nwrote ${lines.length} entries to ${OUT}`)
await browser.close()
