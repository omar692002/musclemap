// Dev-only, one-shot: append the human-reviewed search matches to
// exerciseVideos.ts. Rejects/remaps below are the outcome of a manual review
// of search-accept.txt + search-review.txt (see PROGRESS.md round 5).
// Usage: node scripts/apply-search-matches.mjs
import { readFileSync, writeFileSync } from 'node:fs'

// Wrong-video matches found during review (movement mismatch / not a demo).
const REJECT = new Set([
  'Ankle_On_The_Knee', 'Atlas_Stones', 'Body-Up', 'Bottoms_Up', 'Crucifix',
  'Dancers_Stretch', 'Iron_Cross', 'Skating', 'Spinal_Stretch',
  'Standing_Hip_Flexors', 'Step_Mill', 'Thigh_Adductor', 'Windmills',
  'Smith_Incline_Shoulder_Raise', 'Heavy_Bag_Thrust', 'Bicycling_Stationary',
  'Car_Drivers', 'Runners_Stretch', 'Toe_Touchers', 'Upward_Stretch',
  'Body_Tricep_Press', 'Bicycling',
])
// Reviewed: keep the exercise but use a better id than the search's pick.
const REMAP = {
  Walking_Treadmill: { id: 'UIyZUHq2UdU', title: 'How to run on a treadmill (improve your gait)' },
  Running_Treadmill: { id: 'UIyZUHq2UdU', title: 'How to run on a treadmill (improve your gait)' },
  Sumo_Deadlift_with_Bands: { id: 'MXwS7Q9fKoU', title: 'How to Do a Sumo Deadlift' },
}
// Review-tier records accepted as-is (coverage < 1 but verified by hand).
const REVIEW_ACCEPT = new Set([
  'One-Arm_Kettlebell_Para_Press', 'One-Arm_Kettlebell_Push_Press',
  'One-Arm_Overhead_Kettlebell_Squats', 'Chest_And_Front_Of_Shoulder_Stretch',
  'Leg-Up_Hamstring_Stretch', 'Medicine_Ball_Scoop_Throw', 'One-Arm_Kettlebell_Row',
  'One-Arm_Kettlebell_Snatch', 'Standing_Cable_Wood_Chop', 'Alternating_Renegade_Row',
  'Band_Hip_Adductions', 'Barbell_Ab_Rollout', 'Hip_Lift_with_Band', 'Incline_Cable_Flye',
  'Intermediate_Groin_Stretch', 'Isometric_Chest_Squeezes', 'Middle_Back_Stretch',
  'One_Handed_Hang', 'One_Knee_To_Chest', 'Single_Dumbbell_Raise',
  'Standing_Front_Barbell_Raise_Over_Head', 'Battling_Ropes', 'Fast_Skipping',
  'Jogging_Treadmill', 'Kettlebell_One-Legged_Deadlift', 'Landmine_180s',
  'Lying_Bent_Leg_Groin', 'Peroneals_Stretch', 'Rowing_Stationary', 'Scissors_Jump',
  'Pushups_Close_and_Wide_Hand_Positions',
])

const curatedPath = 'src/data/static/exerciseVideos.ts'
const curated = readFileSync(curatedPath, 'utf8')
const mapped = new Set([...curated.matchAll(/^\s+'?([\w-]+)'?:\s*'([\w-]{11})'/gm)].map((m) => m[1]))

const records = readFileSync('scripts/search-results.jsonl', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line))

const rows = []
for (const r of records) {
  if (mapped.has(r.exerciseId) || REJECT.has(r.exerciseId) || !r.videoId) continue
  const remap = REMAP[r.exerciseId]
  if (!remap && r.coverage < 1 && !REVIEW_ACCEPT.has(r.exerciseId)) continue
  const id = remap?.id ?? r.videoId
  const title = (remap?.title ?? r.title).replace(/'/g, '').replace(/\s+/g, ' ')
  rows.push({ key: r.exerciseId, id, title })
}
rows.sort((a, b) => a.key.localeCompare(b.key))

const lines = rows.map(({ key, id, title }) => {
  const k = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : `'${key}'`
  return `  ${k}: '${id}', // ${title}`
})

const block = [
  '  // ── Search-curated coverage (per-exercise YouTube search, hand-reviewed) ──',
  ...lines,
  '}',
].join('\n')

writeFileSync(curatedPath, curated.replace(/\}\s*$/, block + '\n'), 'utf8')
console.log(`appended ${rows.length} entries`)
