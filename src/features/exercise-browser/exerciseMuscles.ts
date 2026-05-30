import type { Exercise, MuscleInvolvement } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { MuscleRole } from '../../domain/enums/MuscleRole'

/** Distinct muscle groups trained as a *primary* mover (order-preserving). */
export function primaryGroupsOf(
  exercise: Exercise,
  muscleIndex: ReadonlyMap<string, Muscle>,
): readonly MuscleGroup[] {
  const groups: MuscleGroup[] = []
  for (const involvement of exercise.muscles) {
    if (involvement.role !== MuscleRole.Primary) continue
    const group = muscleIndex.get(involvement.muscleId)?.group
    if (group && !groups.includes(group)) groups.push(group)
  }
  return groups
}

/** Involvements of a given role, with their resolved Muscle (skips unknown ids). */
export function involvementsByRole(
  exercise: Exercise,
  role: MuscleRole,
  muscleIndex: ReadonlyMap<string, Muscle>,
): readonly { involvement: MuscleInvolvement; muscle: Muscle }[] {
  return exercise.muscles
    .filter((involvement) => involvement.role === role)
    .map((involvement) => ({ involvement, muscle: muscleIndex.get(involvement.muscleId) }))
    .filter((entry): entry is { involvement: MuscleInvolvement; muscle: Muscle } => Boolean(entry.muscle))
}
