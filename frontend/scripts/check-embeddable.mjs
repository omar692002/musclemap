// Dev-only: check that every video id in exerciseVideos.ts (or a given file of
// ids) is embeddable, via YouTube's oEmbed endpoint (200 = embeddable,
// 401/403 = embedding disabled, 404 = gone). Prints the bad ones.
// Usage: node scripts/check-embeddable.mjs [file-with-ids]
import { readFileSync } from 'node:fs'

const source = process.argv[2] ?? 'src/data/static/exerciseVideos.ts'
const text = readFileSync(source, 'utf8')
const ids = [...new Set([...text.matchAll(/:\s*'([\w-]{11})'/g)].map((m) => m[1]))]
console.log(`checking ${ids.length} distinct video ids…`)

const bad = []
const CONCURRENCY = 8
let cursor = 0
async function worker() {
  while (cursor < ids.length) {
    const id = ids[cursor++]
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
      if (!res.ok) bad.push({ id, status: res.status })
    } catch {
      bad.push({ id, status: 'network' })
    }
    if (cursor % 50 === 0) process.stdout.write(`\r${cursor}/${ids.length}`)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
console.log(`\nnot embeddable/missing: ${bad.length}`)
for (const b of bad) console.log(`  ${b.id}  (${b.status})`)
