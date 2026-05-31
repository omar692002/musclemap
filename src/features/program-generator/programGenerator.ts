import type { Exercise } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'
import type { ProgramExercise, WorkoutDay, WorkoutProgram } from '../../domain/models/WorkoutProgram'
import type { Equipment } from '../../domain/enums/Equipment'
import { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { MuscleRole } from '../../domain/enums/MuscleRole'
import { ExerciseMechanic } from '../../domain/enums/ExerciseMechanic'
import { SplitType } from '../../domain/enums/SplitType'
import { SPLIT_PATTERNS, ProgramConfig } from '../../config/program.config'

export interface ProgramParams {
  readonly split: SplitType
  readonly days: number
  /** Allowed equipment; an empty set means "no restriction". */
  readonly equipment: ReadonlySet<Equipment>
}

function allowsEquipment(exercise: Exercise, allowed: ReadonlySet<Equipment>): boolean {
  if (allowed.size === 0) return true
  return exercise.equipment != null && allowed.has(exercise.equipment)
}

/** True when the exercise trains `group` as a primary mover. */
function isPrimaryFor(exercise: Exercise, group: MuscleGroup, muscleIndex: ReadonlyMap<string, Muscle>): boolean {
  return exercise.muscles.some(
    (inv) => inv.role === MuscleRole.Primary && muscleIndex.get(inv.muscleId)?.group === group,
  )
}

/** Candidate exercises per group, compound-first then alphabetical (stable). */
function candidatesByGroup(
  exercises: readonly Exercise[],
  allowed: ReadonlySet<Equipment>,
  muscleIndex: ReadonlyMap<string, Muscle>,
): Map<MuscleGroup, Exercise[]> {
  const byGroup = new Map<MuscleGroup, Exercise[]>()
  for (const group of Object.values(MuscleGroup)) {
    const list = exercises
      .filter((exercise) => allowsEquipment(exercise, allowed) && isPrimaryFor(exercise, group, muscleIndex))
      .sort((a, b) => {
        const compoundA = a.mechanic === ExerciseMechanic.Compound ? 0 : 1
        const compoundB = b.mechanic === ExerciseMechanic.Compound ? 0 : 1
        return compoundA - compoundB || a.name.localeCompare(b.name)
      })
    byGroup.set(group, list)
  }
  return byGroup
}

/**
 * Builds a balanced, non-redundant week: it cycles the split's day templates to
 * the chosen day count and, for each target group, picks compound-first
 * exercises that fit the equipment, avoiding repeats across the week. Then it
 * sums effective weekly sets per muscle group (sets × each muscle's
 * contribution) for the volume readout. Pure and deterministic.
 */
export function generateProgram(
  params: ProgramParams,
  exercises: readonly Exercise[],
  muscleIndex: ReadonlyMap<string, Muscle>,
): WorkoutProgram {
  const pattern = SPLIT_PATTERNS[params.split]
  const candidates = candidatesByGroup(exercises, params.equipment, muscleIndex)
  const used = new Set<string>()
  const days: WorkoutDay[] = []

  for (let i = 0; i < params.days; i += 1) {
    const template = pattern[i % pattern.length]
    const chosen: ProgramExercise[] = []
    for (const group of template.groups) {
      const pool = candidates.get(group) ?? []
      let picked = 0
      for (const exercise of pool) {
        if (picked >= ProgramConfig.exercisesPerGroup) break
        if (used.has(exercise.id)) continue
        used.add(exercise.id)
        chosen.push({ exercise, sets: ProgramConfig.setsPerExercise })
        picked += 1
      }
    }
    days.push({ label: `Day ${i + 1}`, focus: template.label, exercises: chosen })
  }

  const volumeByGroup = new Map<MuscleGroup, number>()
  for (const day of days) {
    for (const { exercise, sets } of day.exercises) {
      for (const inv of exercise.muscles) {
        const group = muscleIndex.get(inv.muscleId)?.group
        if (!group) continue
        volumeByGroup.set(group, (volumeByGroup.get(group) ?? 0) + sets * (inv.contribution ?? 0))
      }
    }
  }

  return { days, volumeByGroup }
}
