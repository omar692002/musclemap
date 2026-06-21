// Dev-only, one-shot: append the last hand-picked straggler matches.
import { readFileSync, writeFileSync } from 'node:fs'

const ADD = [
  ['Ankle_On_The_Knee', '2E8WWX4cOc4', 'Seated Figure Four Stretch for Piriformis'],
  ['Atlas_Stones', 'JqDm3nZiglk', 'Atlas Stone Tutorial'],
  ['Bicycling', '4ssLDk1eX9w', '4 Basic Skills For Beginner Cyclists'],
  ['Bicycling_Stationary', 'dieOsJlsvpM', 'How to use spin bike for beginners'],
  ['Body-Up', 'Mvk58L-fP9A', 'Plank to push-up'],
  ['Body_Tricep_Press', 'toGzo1GAJ1A', 'Bodyweight Skullcrusher'],
  ['Bottoms_Up', 'lw8HnB0cEP0', 'How to do leg raises correctly'],
  ['Car_Drivers', 'CPiNth6zOeI', 'Plate Driver Rotation'],
  ['Crucifix', 'r27dRHcig6M', 'Crucifix holds (shoulder/lat challenge)'],
  ['Dancers_Stretch', 'sI44ZU33DjA', 'How to do a seated spinal twist'],
  ['Heavy_Bag_Thrust', 'Av0hD5PNNpA', 'Heavy Bag Thrust exercise guide (BB.com)'],
  ['Iron_Cross', 'RP6yDSs-6D0', 'Dumbbell Iron Cross'],
  ['Runners_Stretch', 'r7Th0lHOhSI', 'Dynamic runners lunge + hamstring stretch'],
  ['See-Saw_Press_Alternating_Side_Press', 'lMLYGU3zl-A', 'Dumbbell Seesaw Press'],
  ['Skating', 'RCSlX4bp24Y', 'Inline skating tutorial (first steps)'],
  ['Smith_Incline_Shoulder_Raise', 'ZcU8twN7EsA', 'Barbell Incline Shoulder Raise (same movement)'],
  ['Spinal_Stretch', 'CEGaNMsb8IA', 'Seated Spinal Twist'],
  ['Standing_Hip_Flexors', 'ljCDEb_MIto', 'Standing hip flexor stretch'],
  ['Step_Mill', 'k8iktBIyk8I', 'How to use a StairMaster (beginners)'],
  ['Thigh_Adductor', 'fwpMYCWdUNY', 'How to properly use the adductor machine'],
  ['Toe_Touchers', 'NR4k8hJfs-8', 'Toe touch crunch'],
  ['Upward_Stretch', '2iE9p3l-OQ8', 'Overhead reach stretch'],
  ['Windmills', 'hDrmh7XW4WM', 'Standing Windmill'],
]

const lines = ADD.map(([k, id, t]) => {
  const key = /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : `'${k}'`
  return `  ${key}: '${id}', // ${t}`
})

const path = 'src/data/static/exerciseVideos.ts'
let content = readFileSync(path, 'utf8')
content = content.replace(
  /\}\s*$/,
  '  // ── Final stragglers (targeted hand-written queries, picked by hand) ──────\n' + lines.join('\n') + '\n}\n',
)
writeFileSync(path, content, 'utf8')
console.log('appended', ADD.length)
