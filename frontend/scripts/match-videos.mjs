// Dev-only: match harvested channel videos to unmapped exercises.
// Sources are tried in priority order; exact normalized-name matches are
// emitted as a ready-to-merge TS snippet, fuzzier candidates go to a review
// file. Usage: node scripts/match-videos.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const exercises = JSON.parse(readFileSync('src/data/static/source/exercises.json', 'utf8'))
const curated = readFileSync('src/data/static/exerciseVideos.ts', 'utf8')
const mappedExercises = new Set([...curated.matchAll(/^\s+'?([\w-]+)'?:\s*'([\w-]{11})'/gm)].map((m) => m[1]))

// Priority order: official BB.com exercise guides beat everything (the dataset
// names come from that database), then the channels with how-to libraries.
const SOURCES = [
  { tag: 'bbcom', file: 'scripts/harvest-bbcom.txt' },
  { tag: 'deltabolic', file: 'scripts/shorts-list.txt' },
  { tag: 'scotth', file: 'scripts/harvest-schermanfitness.txt' },
  { tag: 'musclewiki', file: 'scripts/harvest-musclewiki-shorts.txt' },
]

/** Per-source title cleanup → the candidate exercise phrase. */
function cleanTitle(tag, title) {
  let t = title
  if (tag === 'bbcom') {
    // "X | Exercise Guide", "How To Do A X | Exercise Guide",
    // "Barbell Squat - Leg Exercise - Bodybuilding.com" → "X"
    t = t.split(/\s*\|\s*/)[0]
    const parts = t.split(/\s+-\s+/)
    while (parts.length > 1 && /bodybuilding\.com|^\w[\w/ &]* exercise$|exercise guide/i.test(parts[parts.length - 1])) {
      parts.pop()
    }
    t = parts.join(' - ').replace(/^how\s+to(\s+do)?\s+(an?\s+)?/i, '').replace(/\s+with\s+[A-Z][a-z]+( [A-Z][a-z]+)?$/, '')
  }
  if (tag === 'scotth') {
    t = t.split(/\s*\|\|?\s*/)[0].replace(/^how\s*to:?\s*/i, '')
    // "Dumbbell Raise- Posterior Deltoid Gains!" → drop a trailing hype segment
    t = t.replace(/-\s+[A-Z][^-]*!$/, '')
  }
  return t
    .replace(/\(.*?\)/g, ' ') // parentheticals are marketing
    .replace(/#\w+/g, ' ')
    .replace(/[|‼️!?✅❌🛑🔥💪🚨⚠️🎯💨🏋️‍♂️🏋️]+/gu, ' ')
    .trim()
}

const strip = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[''’]/g, '').replace(/[^a-z0-9\s/-]/g, ' ')

const CANON = {
  db: 'dumbbell', dumbbells: 'dumbbell', bb: 'barbell', barbells: 'barbell',
  cables: 'cable', machines: 'machine', presses: 'press', rows: 'row',
  curls: 'curl', raises: 'raise', flyes: 'fly', flys: 'fly', flies: 'fly',
  pushups: 'pushup', 'push-ups': 'pushup', 'push-up': 'pushup', 'push': 'push',
  pullups: 'pullup', 'pull-ups': 'pullup', 'pull-up': 'pullup', 'chin-ups': 'chinup', chinups: 'chinup',
  pulldowns: 'pulldown', lunges: 'lunge', squats: 'squat', deadlifts: 'deadlift',
  shrugs: 'shrug', dips: 'dip', extensions: 'extension', kickbacks: 'kickback',
  crunches: 'crunch', situps: 'situp', 'sit-ups': 'situp', 'sit-up': 'situp',
  planks: 'plank', thrusts: 'thrust', bridges: 'bridge', hyperextensions: 'hyperextension',
  stretches: 'stretch', twists: 'twist', jumps: 'jump', swings: 'swing', cleans: 'clean',
  snatches: 'snatch', jerks: 'jerk', getups: 'getup', 'get-ups': 'getup', windmills: 'windmill',
  legs: 'leg', arms: 'arm', shoulders: 'shoulder', knees: 'knee', wrists: 'wrist',
  hamstrings: 'hamstring', calves: 'calf', glutes: 'glute', abs: 'ab', lats: 'lat',
  delts: 'delt', tricep: 'triceps', bicep: 'biceps', quads: 'quad',
  grips: 'grip', benches: 'bench', kettlebells: 'kettlebell', bands: 'band', plates: 'plate',
  ups: 'up', exercises: 'exercise', mornings: 'morning', walks: 'walk', steps: 'step',
}
const STOP = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'or', 'to', 'with', 'on', 'in', 'at', 'your', 'using'])

function tokens(text) {
  const out = []
  for (let word of strip(text).split(/[\s/-]+/).filter(Boolean)) {
    word = CANON[word] ?? word
    if (!STOP.has(word) && word.length > 0) out.push(word)
  }
  return out.sort()
}

const key = (toks) => toks.join(' ')

// Build per-source lookup: normalized phrase → {id, title}. First seen wins
// within a source (channel uploads sometimes duplicate).
const lookups = []
for (const src of SOURCES) {
  if (!existsSync(src.file)) continue
  const byKey = new Map()
  const all = []
  for (const line of readFileSync(src.file, 'utf8').split(/\r?\n/).filter(Boolean)) {
    const [id, ...rest] = line.split(' | ')
    const title = rest.join(' | ').trim()
    if (!/^[\w-]{11}$/.test(id.trim())) continue
    const toks = tokens(cleanTitle(src.tag, title))
    if (toks.length === 0) continue
    const k = key(toks)
    if (!byKey.has(k)) byKey.set(k, { id: id.trim(), title })
    all.push({ id: id.trim(), title, toks })
  }
  lookups.push({ ...src, byKey, all })
}

const auto = [] // exact normalized matches
const near = [] // exercise tokens fully covered, small title surplus
const review = [] // fuzzy, needs a human

for (const e of exercises) {
  if (mappedExercises.has(e.id)) continue
  const toks = tokens(e.name)
  const k = key(toks)

  // Stage A: exact normalized-phrase equality, by source priority.
  let hit = null
  for (const src of lookups) {
    const found = src.byKey.get(k)
    if (found) {
      hit = { ...found, tag: src.tag }
      break
    }
  }
  if (hit) {
    auto.push({ ex: e, ...hit })
    continue
  }

  // Stage B/C: token-overlap scoring across all sources.
  let best = null
  for (const src of lookups) {
    for (const v of src.all) {
      const overlap = toks.filter((t) => v.toks.includes(t)).length
      if (overlap === 0) continue
      const coverage = overlap / toks.length
      const surplus = v.toks.length - overlap
      const score = coverage - surplus * 0.06
      if (!best || score > best.score) best = { ex: e, id: v.id, title: v.title, tag: src.tag, score, coverage, surplus }
    }
  }
  if (!best) continue
  if (best.coverage === 1 && best.surplus <= 2) near.push(best)
  else if (best.coverage >= 0.6) review.push(best)
}

const tsLine = ({ ex, id, title, tag }) => {
  const needsQuotes = !/^[A-Za-z_][A-Za-z0-9_]*$/.test(ex.id)
  const k = needsQuotes ? `'${ex.id}'` : ex.id
  return `  ${k}: '${id}', // [${tag}] ${title.replace(/'/g, '')}`
}

writeFileSync(
  'scripts/auto-matches.txt',
  ['// Stage A: exact normalized-name matches', ...auto.map(tsLine), '', '// Stage B: full coverage, small surplus', ...near.map(tsLine)].join('\n'),
  'utf8',
)
writeFileSync(
  'scripts/match-suggestions2.txt',
  review
    .sort((a, b) => b.score - a.score)
    .map((r) => `${r.ex.id}  (${r.ex.name})\n    ${r.id}  ${r.score.toFixed(2)} [${r.tag}] ${r.title}`)
    .join('\n'),
  'utf8',
)

const unmappedTotal = exercises.filter((e) => !mappedExercises.has(e.id)).length
console.log(`unmapped: ${unmappedTotal} | exact: ${auto.length} | near: ${near.length} | review: ${review.length} | no candidate: ${unmappedTotal - auto.length - near.length - review.length}`)
