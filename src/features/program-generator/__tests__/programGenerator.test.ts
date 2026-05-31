import { describe, it, expect } from 'vitest'
import type { Exercise } from '../../../domain/models/Exercise'
import type { Muscle } from '../../../domain/models/Muscle'
import { MuscleId } from '../../../domain/enums/MuscleId'
import { MuscleGroup } from '../../../domain/enums/MuscleGroup'
import { MuscleRole } from '../../../domain/enums/MuscleRole'
import { Equipment } from '../../../domain/enums/Equipment'
import { ExerciseCategory } from '../../../domain/enums/ExerciseCategory'
import { ExerciseLevel } from '../../../domain/enums/ExerciseLevel'
import { ExerciseMechanic } from '../../../domain/enums/ExerciseMechanic'
import { SplitType } from '../../../domain/enums/SplitType'
import { generateProgram } from '../programGenerator'

const MUSCLE_INDEX: ReadonlyMap<string, Muscle> = new Map([
  [MuscleId.PectoralisMajor, { id: MuscleId.PectoralisMajor, name: 'Chest', group: MuscleGroup.Chest }],
  [MuscleId.TricepsBrachii, { id: MuscleId.TricepsBrachii, name: 'Triceps', group: MuscleGroup.Triceps }],
  [MuscleId.Deltoid, { id: MuscleId.Deltoid, name: 'Delts', group: MuscleGroup.Shoulders }],
  [MuscleId.LatissimusDorsi, { id: MuscleId.LatissimusDorsi, name: 'Lats', group: MuscleGroup.Back }],
  [MuscleId.Quadriceps, { id: MuscleId.Quadriceps, name: 'Quads', group: MuscleGroup.Quadriceps }],
])

function ex(
  id: string,
  muscleId: MuscleId,
  equipment: Equipment,
  mechanic = ExerciseMechanic.Compound,
): Exercise {
  return {
    id,
    name: id,
    muscles: [
      { muscleId, role: MuscleRole.Primary, contribution: 1 },
      { muscleId: MuscleId.TricepsBrachii, role: MuscleRole.Secondary, contribution: 0.5 },
    ],
    category: ExerciseCategory.Strength,
    level: ExerciseLevel.Beginner,
    equipment,
    mechanic,
    instructions: [],
    media: [],
  }
}

const EXERCISES: readonly Exercise[] = [
  ex('Bench Press', MuscleId.PectoralisMajor, Equipment.Barbell),
  ex('Push-up', MuscleId.PectoralisMajor, Equipment.Bodyweight),
  ex('Overhead Press', MuscleId.Deltoid, Equipment.Barbell),
  ex('Pull-up', MuscleId.LatissimusDorsi, Equipment.Bodyweight),
  ex('Squat', MuscleId.Quadriceps, Equipment.Barbell),
]

describe('generateProgram', () => {
  it('produces the requested number of days', () => {
    const program = generateProgram(
      { split: SplitType.PushPullLegs, days: 3, equipment: new Set() },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(program.days).toHaveLength(3)
    expect(program.days.map((d) => d.focus)).toEqual(['Push', 'Pull', 'Legs'])
  })

  it('never repeats an exercise across the week', () => {
    const program = generateProgram(
      { split: SplitType.FullBody, days: 4, equipment: new Set() },
      EXERCISES,
      MUSCLE_INDEX,
    )
    const ids = program.days.flatMap((d) => d.exercises.map((e) => e.exercise.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('respects the equipment filter', () => {
    const program = generateProgram(
      { split: SplitType.FullBody, days: 1, equipment: new Set([Equipment.Bodyweight]) },
      EXERCISES,
      MUSCLE_INDEX,
    )
    const equipmentUsed = program.days[0].exercises.map((e) => e.exercise.equipment)
    expect(equipmentUsed.every((e) => e === Equipment.Bodyweight)).toBe(true)
  })

  it('accumulates effective weekly volume per group', () => {
    const program = generateProgram(
      { split: SplitType.PushPullLegs, days: 1, equipment: new Set() },
      EXERCISES,
      MUSCLE_INDEX,
    )
    // Push day picks one chest + one shoulder primary (each 3 sets); triceps is a
    // secondary (0.5) on both → 3 sets × 0.5 × 2 exercises = 3 effective sets.
    expect(program.volumeByGroup.get(MuscleGroup.Triceps)).toBe(3)
    expect(program.volumeByGroup.get(MuscleGroup.Chest)).toBe(3)
  })
})
