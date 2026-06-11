// Dev-only: harvest every video (videoId | title) from a channel tab by
// scrolling until the list stops growing. Works for both the /shorts and the
// /videos tab. Output: one "id | title" line per video.
// Usage: node scripts/harvest-channel.mjs <channelUrl> <outFile> [maxRounds]
//   e.g. node scripts/harvest-channel.mjs https://www.youtube.com/@MuscleWiki/shorts scripts/harvest-musclewiki.txt
import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'

const url = process.argv[2]
const out = process.argv[3]
const maxRounds = Number(process.argv[4] ?? 400)
if (!url || !out) {
  console.error('usage: node scripts/harvest-channel.mjs <channelUrl> <outFile> [maxRounds]')
  process.exit(1)
}

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3000)

// Dismiss a consent dialog if one appears.
const consent = page.locator('button[aria-label*="Accept"], button:has-text("Accept all")').first()
if (await consent.isVisible().catch(() => false)) {
  await consent.click()
  await page.waitForTimeout(2000)
}

// Collects both layouts: shorts lockups and regular video grid items.
const collect = () =>
  page.evaluate(() => {
    const out = {}
    for (const a of document.querySelectorAll('a[href*="/shorts/"], a[href*="watch?v="]')) {
      const href = a.getAttribute('href') ?? ''
      const match = href.match(/\/shorts\/([\w-]{11})/) ?? href.match(/[?&]v=([\w-]{11})/)
      if (!match) continue
      const host = a.closest('ytm-shorts-lockup-view-model, ytd-rich-item-renderer') ?? a
      const title =
        a.getAttribute('title') ||
        host.querySelector('a#video-title-link')?.getAttribute('title') ||
        host.querySelector('h3, [class*="title"]')?.textContent?.trim() ||
        a.getAttribute('aria-label') ||
        ''
      if (!out[match[1]] && title) out[match[1]] = title.replace(/\s+/g, ' ').trim()
    }
    return out
  })

let items = {}
let stableRounds = 0
for (let i = 0; i < maxRounds && stableRounds < 8; i++) {
  await page.keyboard.press('End')
  await page.waitForTimeout(1200)
  const next = await collect()
  const before = Object.keys(items).length
  items = { ...next, ...items }
  stableRounds = Object.keys(items).length === before ? stableRounds + 1 : 0
  process.stdout.write(`\rcollected: ${Object.keys(items).length} (round ${i + 1})   `)
}

const lines = Object.entries(items).map(([id, title]) => `${id} | ${title}`)
writeFileSync(out, lines.join('\n'), 'utf8')
console.log(`\nwrote ${lines.length} entries to ${out}`)
await browser.close()
