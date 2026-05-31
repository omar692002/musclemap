import type { Exercise } from '../../domain/models/Exercise'
import { MuscleId } from '../../domain/enums/MuscleId'
import { MuscleHeadId } from '../../domain/enums/MuscleHeadId'
import { MuscleRole } from '../../domain/enums/MuscleRole'

/**
 * Head-level exercise attribution — the project's curation layer.
 *
 * The source dataset only labels muscles at the group level ("shoulders"), so
 * which *head* an exercise emphasises is inferred from its name (e.g. a lateral
 * raise → lateral deltoid). Rules are heuristic and per muscle; when none match,
 * the exercise falls back to that muscle's full set of heads. Quadriceps /
 * hamstrings have no name-distinguishable heads, so they always map to all.
 *
 * This is the seam to refine as exercises are reviewed/hand-labelled.
 */
interface HeadRule {
  readonly keywords: readonly string[]
  readonly heads: readonly MuscleHeadId[]
}

interface MuscleHeadRules {
  readonly rules: readonly HeadRule[]
  readonly fallback: readonly MuscleHeadId[]
}

const D = MuscleHeadId
const ALL_DELTOID = [D.DeltoidAnterior, D.DeltoidLateral, D.DeltoidPosterior]

const RULES_BY_MUSCLE: Partial<Record<MuscleId, MuscleHeadRules>> = {
  [MuscleId.Deltoid]: {
    rules: [
      { keywords: ['lateral raise', 'side raise', 'lateral', 'upright row'], heads: [D.DeltoidLateral] },
      {
        keywords: ['rear', 'reverse fly', 'reverse flye', 'face pull', 'rear delt', 'bent-over lateral', 'reverse machine fly'],
        heads: [D.DeltoidPosterior],
      },
      { keywords: ['front raise'], heads: [D.DeltoidAnterior] },
      { keywords: ['press', 'military', 'overhead', 'arnold', 'push press'], heads: [D.DeltoidAnterior, D.DeltoidLateral] },
    ],
    fallback: ALL_DELTOID,
  },
  [MuscleId.PectoralisMajor]: {
    rules: [
      { keywords: ['incline'], heads: [D.PecUpper] },
      { keywords: ['decline'], heads: [D.PecLower] },
    ],
    fallback: [D.PecMid],
  },
  [MuscleId.TricepsBrachii]: {
    rules: [
      { keywords: ['overhead', 'french', 'skull', 'lying'], heads: [D.TricepsLong, D.TricepsMedial] },
      { keywords: ['pushdown', 'pressdown', 'kickback', 'close grip', 'dip', 'press'], heads: [D.TricepsLateral, D.TricepsMedial] },
    ],
    fallback: [D.TricepsLong, D.TricepsLateral, D.TricepsMedial],
  },
  [MuscleId.BicepsBrachii]: {
    rules: [
      { keywords: ['incline'], heads: [D.BicepsLong] },
      { keywords: ['preacher', 'concentration', 'spider'], heads: [D.BicepsShort] },
    ],
    fallback: [D.BicepsLong, D.BicepsShort],
  },
  [MuscleId.Trapezius]: {
    rules: [
      { keywords: ['shrug'], heads: [D.TrapsUpper] },
      { keywords: ['row', 'face pull', 'y raise', 'prone'], heads: [D.TrapsMid, D.TrapsLower] },
    ],
    fallback: [D.TrapsUpper, D.TrapsMid, D.TrapsLower],
  },
  [MuscleId.Calves]: {
    rules: [
      { keywords: ['seated', 'soleus'], heads: [D.CalfSoleus] },
      { keywords: ['standing', 'donkey'], heads: [D.CalfGastrocnemius] },
    ],
    fallback: [D.CalfGastrocnemius, D.CalfSoleus],
  },
  [MuscleId.Quadriceps]: {
    rules: [],
    fallback: [D.QuadRectusFemoris, D.QuadVastusLateralis, D.QuadVastusMedialis, D.QuadVastusIntermedius],
  },
  [MuscleId.Hamstrings]: {
    rules: [],
    fallback: [D.HamBicepsFemoris, D.HamSemitendinosus, D.HamSemimembranosus],
  },
}

const ROLE_RANK: Readonly<Record<MuscleRole, number>> = {
  [MuscleRole.Primary]: 3,
  [MuscleRole.Secondary]: 2,
  [MuscleRole.Stabilizer]: 1,
}

function compute(exercise: Exercise): ReadonlyMap<MuscleHeadId, MuscleRole> {
  const name = exercise.name.toLowerCase()
  const result = new Map<MuscleHeadId, MuscleRole>()
  for (const involvement of exercise.muscles) {
    const config = RULES_BY_MUSCLE[involvement.muscleId as MuscleId]
    if (!config) continue
    const matched = config.rules.find((rule) => rule.keywords.some((keyword) => name.includes(keyword)))
    const heads = matched ? matched.heads : config.fallback
    for (const head of heads) {
      const existing = result.get(head)
      if (!existing || ROLE_RANK[involvement.role] > ROLE_RANK[existing]) result.set(head, involvement.role)
    }
  }
  return result
}

// Cheap memo: attribution is pure per exercise and the catalog is immutable.
const cache = new WeakMap<Exercise, ReadonlyMap<MuscleHeadId, MuscleRole>>()

/** The heads an exercise trains (with role), inferred from its name. */
export function headsOf(exercise: Exercise): ReadonlyMap<MuscleHeadId, MuscleRole> {
  let heads = cache.get(exercise)
  if (!heads) {
    heads = compute(exercise)
    cache.set(exercise, heads)
  }
  return heads
}

/** Whether an exercise trains a given muscle head. */
export function exerciseInvolvesHead(exercise: Exercise, headId: string): boolean {
  return headsOf(exercise).has(headId as MuscleHeadId)
}
