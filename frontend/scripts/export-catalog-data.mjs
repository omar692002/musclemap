/**
 * Exports the bundled catalogue source data into the backend's resources so the
 * Spring Boot seeder (CatalogBootstrap) can populate the database. Single source
 * of truth stays in `src/data/static/**`; re-run this whenever that data changes:
 *
 *   node scripts/export-catalog-data.mjs
 *
 * Emits:
 *   backend/src/main/resources/catalog/exercises.json        (raw free-exercise-db, copied)
 *   backend/src/main/resources/catalog/exercise-videos.json  ({ exerciseId: youTubeId })
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// The frontend now lives in <repo>/frontend; the backend is its sibling.
const outDir = resolve(root, '..', 'backend/src/main/resources/catalog')
mkdirSync(outDir, { recursive: true })

// 1. Raw exercise dataset — copied verbatim.
const exercisesSrc = resolve(root, 'src/data/static/source/exercises.json')
copyFileSync(exercisesSrc, resolve(outDir, 'exercises.json'))

// 2. Curated video map — extracted from the TS module into plain JSON.
// Entries look like `  Key: 'videoId',` or `  'quoted-key': 'videoId',`, each
// optionally trailed by a `// comment`. Strip comments, then match the pairs.
const videosTs = readFileSync(resolve(root, 'src/data/static/exerciseVideos.ts'), 'utf8')
const pair = /(?:'([^']+)'|([A-Za-z0-9_]+))\s*:\s*'([^']+)'/
const videos = {}
for (const rawLine of videosTs.split('\n')) {
  const line = rawLine.split('//')[0] // drop trailing line comments
  const m = pair.exec(line)
  if (!m) continue
  const key = m[1] ?? m[2]
  const id = m[3]
  videos[key] = id
}

const exercises = JSON.parse(readFileSync(exercisesSrc, 'utf8'))
const exerciseCount = Array.isArray(exercises) ? exercises.length : exercises.exercises.length
const videoCount = Object.keys(videos).length

writeFileSync(resolve(outDir, 'exercise-videos.json'), JSON.stringify(videos, null, 0) + '\n')

console.log(`exercises.json: ${exerciseCount} records copied`)
console.log(`exercise-videos.json: ${videoCount} video ids extracted`)
