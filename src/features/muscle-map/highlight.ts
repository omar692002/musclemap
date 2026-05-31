import type { Exercise } from '../../domain/models/Exercise'
import { MuscleId } from '../../domain/enums/MuscleId'
import { MuscleRole } from '../../domain/enums/MuscleRole'
import { headsOf } from './headAttribution'
import { isHeadedMuscle } from '../../data/static/taxonomy/muscleHeads'

/** Strength order so a muscle shown in two roles keeps its most prominent one. */
const ROLE_RANK: Readonly<Record<MuscleRole, number>> = {
  [MuscleRole.Primary]: 3,
  [MuscleRole.Secondary]: 2,
  [MuscleRole.Stabilizer]: 1,
}

/** Maps each muscle an exercise trains to the role to colour it by on the map. */
export function highlightFromExercise(exercise: Exercise): ReadonlyMap<string, MuscleRole> {
  const byMuscle = new Map<string, MuscleRole>()
  for (const involvement of exercise.muscles) {
    const current = byMuscle.get(involvement.muscleId)
    if (!current || ROLE_RANK[involvement.role] > ROLE_RANK[current]) {
      byMuscle.set(involvement.muscleId, involvement.role)
    }
  }
  return byMuscle
}

/**
 * Head-level highlight: like {@link highlightFromExercise} but headed muscles
 * (delts, pecs, triceps, …) are keyed by the specific head(s) the exercise
 * emphasises — inferred by {@link headsOf} — so only those light up on the
 * head-split 3D model. Non-headed muscles stay keyed by their muscle id. Keys
 * match a mesh's `region.key` (headId ?? muscleId).
 */
export function highlightHeadsFromExercise(exercise: Exercise): ReadonlyMap<string, MuscleRole> {
  const byRegion = new Map<string, MuscleRole>()
  const upgrade = (key: string, role: MuscleRole) => {
    const current = byRegion.get(key)
    if (!current || ROLE_RANK[role] > ROLE_RANK[current]) byRegion.set(key, role)
  }
  for (const involvement of exercise.muscles) {
    if (!isHeadedMuscle(involvement.muscleId as MuscleId)) upgrade(involvement.muscleId, involvement.role)
  }
  for (const [headId, role] of headsOf(exercise)) upgrade(headId, role)
  return byRegion
}

/** Distinct roles present in a highlight map, strongest first (for the legend). */
export function rolesInHighlight(highlight: ReadonlyMap<string, MuscleRole>): readonly MuscleRole[] {
  const present = new Set(highlight.values())
  return ([MuscleRole.Primary, MuscleRole.Secondary, MuscleRole.Stabilizer] as const).filter((role) =>
    present.has(role),
  )
}
