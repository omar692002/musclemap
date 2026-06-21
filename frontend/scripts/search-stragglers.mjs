// Dev-only, one-shot: targeted searches (hand-written queries) for the last
// exercises whose generic search hit the wrong video. Prints top results per
// exercise for manual picking. Usage: node scripts/search-stragglers.mjs
import { chromium } from 'playwright-core'

const QUERIES = {
  Ankle_On_The_Knee: 'seated figure four piriformis stretch how to',
  Atlas_Stones: 'atlas stone lift technique strongman tutorial',
  Bicycling: 'road cycling technique for beginners',
  Bicycling_Stationary: 'how to use a stationary exercise bike properly',
  'Body-Up': 'plank to push up exercise how to',
  Body_Tricep_Press: 'bodyweight skull crusher exercise',
  Bottoms_Up: 'bottoms up exercise abs lying leg raise hip lift',
  Car_Drivers: 'car drivers exercise weight plate shoulders',
  Crucifix: 'crucifix hold strongman event',
  Dancers_Stretch: 'seated spinal twist stretch how to',
  Heavy_Bag_Thrust: 'heavy bag thrust exercise',
  Iron_Cross: 'dumbbell iron cross exercise squat raise',
  Runners_Stretch: 'runners lunge hamstring stretch how to',
  'See-Saw_Press_Alternating_Side_Press': 'dumbbell see saw press how to',
  Skating: 'how to skate for beginners technique',
  Smith_Incline_Shoulder_Raise: 'smith machine incline shoulder raise',
  Spinal_Stretch: 'seated spinal stretch how to',
  Standing_Hip_Flexors: 'standing hip flexor stretch how to',
  Step_Mill: 'how to use stepmill stair climber',
  Thigh_Adductor: 'hip adduction machine how to use',
  Toe_Touchers: 'lying toe touch crunch exercise how to',
  Upward_Stretch: 'standing overhead reach stretch full body',
  Windmills: 'standing windmill exercise toe touch form',
}

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

for (const [id, query] of Object.entries(QUERIES)) {
  await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForTimeout(2000)
  const results = await page.evaluate(() => {
    const out = []
    for (const a of document.querySelectorAll('a#video-title[href*="watch?v="], a[href*="/shorts/"]')) {
      const href = a.getAttribute('href') ?? ''
      const m = href.match(/[?&]v=([\w-]{11})/) ?? href.match(/\/shorts\/([\w-]{11})/)
      if (!m) continue
      const title = (a.getAttribute('title') || a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim()
      if (title) out.push(`${m[1]}  ${title}`)
      if (out.length >= 4) break
    }
    return out
  })
  console.log(`\n## ${id}  ("${query}")`)
  for (const r of results) console.log('   ' + r)
}
await browser.close()
