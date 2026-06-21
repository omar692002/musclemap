// Dev-only: for every exercise still without a video, run a YouTube search and
// score the top results against the exercise name. Resumable: results append to
// scripts/search-results.jsonl (one {exerciseId, videoId, title, score} line);
// already-searched exercises are skipped on re-run.
// Usage: node scripts/search-videos.mjs [limit]
import { chromium } from 'playwright-core'
import { readFileSync, existsSync, appendFileSync } from 'node:fs'

const limit = Number(process.argv[2] ?? Infinity)
const exercises = JSON.parse(readFileSync('src/data/static/source/exercises.json', 'utf8'))
const curated = readFileSync('src/data/static/exerciseVideos.ts', 'utf8')
const mapped = new Set([...curated.matchAll(/^\s+'?([\w-]+)'?:\s*'([\w-]{11})'/gm)].map((m) => m[1]))

const OUT = 'scripts/search-results.jsonl'
const done = new Set()
if (existsSync(OUT)) {
  for (const line of readFileSync(OUT, 'utf8').split(/\r?\n/).filter(Boolean)) {
    done.add(JSON.parse(line).exerciseId)
  }
}

const strip = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[''’]/g, '').replace(/[^a-z0-9\s/-]/g, ' ')
const CANON = {
  db: 'dumbbell', dumbbells: 'dumbbell', barbells: 'barbell', cables: 'cable', machines: 'machine',
  presses: 'press', rows: 'row', curls: 'curl', raises: 'raise', flyes: 'fly', flys: 'fly', flies: 'fly',
  pushups: 'pushup', 'push-ups': 'pushup', 'push-up': 'pushup', pullups: 'pullup', 'pull-ups': 'pullup',
  pulldowns: 'pulldown', lunges: 'lunge', squats: 'squat', deadlifts: 'deadlift', shrugs: 'shrug',
  dips: 'dip', extensions: 'extension', kickbacks: 'kickback', crunches: 'crunch', situps: 'situp',
  'sit-ups': 'situp', 'sit-up': 'situp', planks: 'plank', thrusts: 'thrust', bridges: 'bridge',
  stretches: 'stretch', twists: 'twist', jumps: 'jump', swings: 'swing', cleans: 'clean',
  snatches: 'snatch', jerks: 'jerk', windmills: 'windmill', legs: 'leg', arms: 'arm',
  shoulders: 'shoulder', knees: 'knee', wrists: 'wrist', hamstrings: 'hamstring', calves: 'calf',
  glutes: 'glute', abs: 'ab', lats: 'lat', tricep: 'triceps', bicep: 'biceps', quads: 'quad',
  kettlebells: 'kettlebell', bands: 'band', plates: 'plate', ups: 'up', mornings: 'morning',
  exercises: 'exercise', smr: 'foam roll', hyperextensions: 'hyperextension',
}
const STOP = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'or', 'to', 'with', 'on', 'in', 'at', 'how', 'do', 'your'])
function tokens(text) {
  const out = []
  for (let word of strip(text).split(/[\s/-]+/).filter(Boolean)) {
    word = CANON[word] ?? word
    if (!STOP.has(word) && word.length > 0) for (const w of word.split(' ')) out.push(w)
  }
  return out
}

const GOOD_HINT = /how to|form|guide|tutorial|technique|exercise|demo|stretch|properly|correctly/i

const queue = exercises.filter((e) => !mapped.has(e.id) && !done.has(e.id)).slice(0, limit)
console.log(`searching for ${queue.length} exercises (resume file: ${OUT})`)

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

let n = 0
for (const e of queue) {
  const query = encodeURIComponent(`${e.name} exercise`)
  try {
    await page.goto(`https://www.youtube.com/results?search_query=${query}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1800 + Math.random() * 900)
    const results = await page.evaluate(() => {
      const out = []
      for (const a of document.querySelectorAll('a#video-title[href*="watch?v="], a[href*="/shorts/"]')) {
        const href = a.getAttribute('href') ?? ''
        const m = href.match(/[?&]v=([\w-]{11})/) ?? href.match(/\/shorts\/([\w-]{11})/)
        if (!m) continue
        const title = (a.getAttribute('title') || a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim()
        if (title) out.push({ id: m[1], title })
        if (out.length >= 10) break
      }
      return out
    })
    const toks = tokens(e.name)
    let best = null
    for (const r of results) {
      const rToks = tokens(r.title)
      const overlap = toks.filter((t) => rToks.includes(t)).length
      const coverage = toks.length ? overlap / toks.length : 0
      const surplus = Math.max(0, rToks.length - overlap)
      const score = coverage - surplus * 0.03 + (GOOD_HINT.test(r.title) ? 0.08 : 0)
      if (!best || score > best.score) best = { ...r, score, coverage }
    }
    const rec = { exerciseId: e.id, name: e.name, videoId: best?.id ?? null, title: best?.title ?? null, score: best?.score ?? 0, coverage: best?.coverage ?? 0 }
    appendFileSync(OUT, JSON.stringify(rec) + '\n', 'utf8')
    n++
    process.stdout.write(`\r${n}/${queue.length}  ${e.id.slice(0, 40).padEnd(42)}`)
  } catch (err) {
    console.error(`\nerror on ${e.id}: ${err.message ?? err}`)
    await page.waitForTimeout(5000)
  }
}
console.log(`\ndone: ${n} searched`)
await browser.close()
