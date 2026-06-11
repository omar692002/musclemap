// Dev-only: turn scripts/search-results.jsonl into ready-to-merge TS lines.
// Full-coverage matches (every exercise-name token present in the video title)
// go to search-accept.txt; weaker ones to search-review.txt for a human pass.
// Usage: node scripts/merge-search-results.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const curated = readFileSync('src/data/static/exerciseVideos.ts', 'utf8')
const mapped = new Set([...curated.matchAll(/^\s+'?([\w-]+)'?:\s*'([\w-]{11})'/gm)].map((m) => m[1]))

const records = readFileSync('scripts/search-results.jsonl', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line))

const tsLine = (r) => {
  const needsQuotes = !/^[A-Za-z_][A-Za-z0-9_]*$/.test(r.exerciseId)
  const k = needsQuotes ? `'${r.exerciseId}'` : r.exerciseId
  return `  ${k}: '${r.videoId}', // ${r.title.replace(/'/g, '')}`
}

const accept = []
const review = []
const none = []
for (const r of records) {
  if (mapped.has(r.exerciseId)) continue
  if (!r.videoId) {
    none.push(r.exerciseId)
    continue
  }
  if (r.coverage === 1) accept.push(r)
  else review.push(r)
}

accept.sort((a, b) => a.exerciseId.localeCompare(b.exerciseId))
review.sort((a, b) => b.coverage - a.coverage)

writeFileSync('scripts/search-accept.txt', accept.map(tsLine).join('\n'), 'utf8')
writeFileSync(
  'scripts/search-review.txt',
  review.map((r) => `${r.exerciseId}  (${r.name})  cov=${r.coverage.toFixed(2)}\n${tsLine(r)}`).join('\n'),
  'utf8',
)
console.log(`accept (full coverage): ${accept.length} | review: ${review.length} | no result: ${none.length}`)
if (none.length) console.log('no result:', none.join(', '))
