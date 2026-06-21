// Dev-only: propose exercise → video matches from the harvested shorts list.
// Reads scripts/shorts-list.txt + the dataset + the current curated map, and
// writes scripts/match-suggestions.txt (tiered by confidence) for hand review.
// Usage: node scripts/match-shorts.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const exercises = JSON.parse(readFileSync('src/data/static/source/exercises.json', 'utf8'))
const curated = readFileSync('src/data/static/exerciseVideos.ts', 'utf8')
const shorts = readFileSync('scripts/shorts-list.txt', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const [id, ...rest] = line.split(' | ')
    return { id: id.trim(), title: rest.join(' | ').trim() }
  })

// Already-curated exercise keys and video ids.
const mappedExercises = new Set([...curated.matchAll(/^\s+'?([\w-]+)'?:\s*'([\w-]{11})'/gm)].map((m) => m[1]))
const usedVideos = new Set([...curated.matchAll(/'([\w-]{11})'/g)].map((m) => m[1]))

// French → English fitness vocabulary (titles are mixed EN/FR).
const FR = {
  pompes: 'pushup', pompe: 'pushup', tractions: 'pullup', traction: 'pullup',
  squat: 'squat', bulgare: 'bulgarian', fentes: 'lunge', fente: 'lunge',
  'souleve': 'deadlift', terre: '', roumain: 'romanian',
  'developpe': 'press', couche: 'bench', incline: 'incline', militaire: 'military',
  haltere: 'dumbbell', halteres: 'dumbbell', barre: 'barbell', poulie: 'cable',
  machine: 'machine', guide: '', poitrine: 'chest', pectoraux: 'chest',
  epaules: 'shoulder', epaule: 'shoulder', dos: 'back', jambes: 'leg', jambe: 'leg',
  fessiers: 'glute', fessier: 'glute', mollets: 'calf', mollet: 'calf',
  ischio: 'hamstring', ischios: 'hamstring', quadriceps: 'quad',
  abdos: 'ab', abdominaux: 'ab', gainage: 'plank', planche: 'plank',
  biceps: 'biceps', triceps: 'triceps', avantbras: 'forearm',
  curl: 'curl', extension: 'extension', extensions: 'extension',
  rowing: 'row', tirage: 'pulldown', vertical: '', horizontal: '',
  elevations: 'raise', elevation: 'raise', laterales: 'lateral', laterale: 'lateral',
  frontales: 'front', frontale: 'front', oiseau: 'reverse fly',
  ecarte: 'fly', ecartes: 'fly', crucifix: 'fly',
  dips: 'dip', mouvement: '', exercice: 'exercise', exercices: 'exercise',
  parfait: 'perfect', parfaite: 'perfect', parfaits: 'perfect', parfaites: 'perfect',
  erreurs: 'mistake', erreur: 'mistake', variations: 'variations', variation: 'variations',
  assis: 'seated', debout: 'standing', allonge: 'lying', prise: 'grip',
  serree: 'close', large: 'wide', marteau: 'hammer', inversee: 'reverse', inverse: 'reverse',
  bras: 'arm', nuque: 'neck', trapezes: 'shrug', haussements: 'shrug',
  hanches: 'hip', poussee: 'thrust', releve: 'raise', releves: 'raise',
  suspendu: 'hanging', flexions: 'curl', flexion: 'curl', mortes: 'deadlift',
}

// Words that carry no exercise identity (marketing/filler, EN + FR).
const STOP = new Set([
  'the', 'a', 'an', 'of', 'for', 'and', 'or', 'to', 'with', 'your', 'you', 'this', 'these', 'them',
  'do', 'does', 'fix', 'need', 'know', 'try', 'avoid', 'stop', 'now', 'in', '4k', 'like', 'that',
  'perfect', 'mistake', 'mistakes', 'guide', 'form', 'complete', 'common', 'best', 'top',
  'workout', 'exercise', 'exercises', 'muscles', 'muscle', 'worked', 'difference', 'between',
  'variations', 'vs', 'versus', 'all', 'hit', 'heads', 'which', 'one', 'is', 'are', 'it', 'its',
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'de', 'du', 'au', 'aux', 'et', 'ou', 'pour', 'avec',
  'ces', 'cet', 'cette', 'vos', 'votre', 'sur', 'a', 'en', 'corrigez', 'essayez', 'testez',
  'courantes', 'courante', 'absolument', 'tester', 'essayer', 'faire', 'comment', 'quel', 'quelle',
])

// EN token canonicalisation (plurals, abbreviations, synonyms).
const CANON = {
  db: 'dumbbell', dumbbells: 'dumbbell', bb: 'barbell', barbells: 'barbell',
  cables: 'cable', machines: 'machine', presses: 'press', rows: 'row',
  curls: 'curl', raises: 'raise', flyes: 'fly', flys: 'fly', flies: 'fly',
  pushups: 'pushup', 'push-ups': 'pushup', 'push-up': 'pushup',
  pullups: 'pullup', 'pull-ups': 'pullup', 'pull-up': 'pullup', chinup: 'chinup', 'chin-ups': 'chinup',
  pulldowns: 'pulldown', lunges: 'lunge', squats: 'squat', deadlifts: 'deadlift',
  shrugs: 'shrug', dips: 'dip', extensions: 'extension', kickbacks: 'kickback',
  crunches: 'crunch', situps: 'situp', 'sit-ups': 'situp', 'sit-up': 'situp',
  planks: 'plank', thrusts: 'thrust', bridges: 'bridge', hyperextensions: 'hyperextension',
  legs: 'leg', arms: 'arm', shoulders: 'shoulder', quads: 'quad', hams: 'hamstring',
  hamstrings: 'hamstring', calves: 'calf', glutes: 'glute', abs: 'ab', lats: 'lat',
  delts: 'delt', pecs: 'chest', pec: 'chest', ohp: 'overhead press', rdl: 'romanian deadlift',
  laterals: 'lateral', overheads: 'overhead', tricep: 'triceps', bicep: 'biceps',
  grips: 'grip', widths: 'width', benchs: 'bench', benches: 'bench',
}

const strip = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[''’]/g, '').replace(/[^a-z0-9\s-]/g, ' ')

function tokens(text) {
  const out = []
  for (let word of strip(text).split(/[\s-]+/).filter(Boolean)) {
    if (FR[word] !== undefined) word = FR[word]
    if (!word) continue
    for (let t of word.split(' ')) {
      t = CANON[t] ?? t
      if (!STOP.has(t) && t.length > 1) out.push(t)
    }
  }
  return [...new Set(out)]
}

// Exercise-centric view: for every unmapped exercise, the best-matching short
// titles (used videos are fair game — one video may fit several exercises).
const shortToks = shorts.map((s) => ({ ...s, toks: tokens(s.title) })).filter((s) => s.toks.length > 0)

const rows = []
for (const e of exercises) {
  if (mappedExercises.has(e.id)) continue
  const toks = tokens(e.name)
  if (toks.length === 0) continue
  const scored = []
  for (const s of shortToks) {
    const hit = toks.filter((tok) => s.toks.includes(tok)).length
    if (hit === 0) continue
    const coverage = hit / toks.length
    const precision = hit / s.toks.length
    const score = coverage * 0.7 + precision * 0.3
    if (coverage >= 0.5) scored.push({ s, score })
  }
  scored.sort((a, b) => b.score - a.score)
  if (scored.length === 0 || scored[0].score < 0.55) continue
  rows.push({
    score: scored[0].score,
    text:
      `${e.id}  (${e.name})\n` +
      scored
        .slice(0, 3)
        .map((c) => `    ${c.s.id}  ${c.score.toFixed(2)}${usedVideos.has(c.s.id) ? ' *' : '  '} ${c.s.title}`)
        .join('\n'),
  })
}

rows.sort((a, b) => b.score - a.score)
writeFileSync('scripts/match-suggestions.txt', rows.map((r) => r.text).join('\n'), 'utf8')
console.log(`exercises with candidates: ${rows.length} → scripts/match-suggestions.txt (* = video already used elsewhere)`)
