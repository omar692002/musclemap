import type { Exercise } from '../../domain/models/Exercise'
import { MuscleRole } from '../../domain/enums/MuscleRole'

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

/** Distinct roles present in a highlight map, strongest first (for the legend). */
export function rolesInHighlight(highlight: ReadonlyMap<string, MuscleRole>): readonly MuscleRole[] {
  const present = new Set(highlight.values())
  return ([MuscleRole.Primary, MuscleRole.Secondary, MuscleRole.Stabilizer] as const).filter((role) =>
    present.has(role),
  )
}
