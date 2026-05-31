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
import { TrainingGoal } from '../../../domain/enums/TrainingGoal'
import { DayFocus } from '../../../domain/enums/DayFocus'
import { generateProgram } from '../programGenerator'
import { GOAL_SCHEMES } from '../../../config/program.config'

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
      { split: SplitType.PushPullLegs, days: 3, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(program.days).toHaveLength(3)
    expect(program.days.map((d) => d.focus)).toEqual([DayFocus.Push, DayFocus.Pull, DayFocus.Legs])
  })

  it('supports the body-part split (Chest+Tri, Back+Bi, Legs, Shoulders+Core)', () => {
    const program = generateProgram(
      { split: SplitType.BodyPart, days: 4, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(program.days.map((d) => d.focus)).toEqual([
      DayFocus.ChestTriceps,
      DayFocus.BackBiceps,
      DayFocus.Legs,
      DayFocus.ShouldersCore,
    ])
  })

  it('never repeats an exercise across the week', () => {
    const program = generateProgram(
      { split: SplitType.FullBody, days: 4, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    const ids = program.days.flatMap((d) => d.exercises.map((e) => e.exercise.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('respects the equipment filter', () => {
    const program = generateProgram(
      {
        split: SplitType.FullBody,
        days: 1,
        goal: TrainingGoal.Hypertrophy,
        equipment: new Set([Equipment.Bodyweight]),
        seed: 0,
      },
      EXERCISES,
      MUSCLE_INDEX,
    )
    const equipmentUsed = program.days[0].exercises.map((e) => e.exercise.equipment)
    expect(equipmentUsed.every((e) => e === Equipment.Bodyweight)).toBe(true)
  })

  it('accumulates effective weekly volume per group', () => {
    const program = generateProgram(
      { split: SplitType.PushPullLegs, days: 1, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    // Push day picks one chest + one shoulder primary; both are compounds → 4
    // sets each under Hypertrophy. Triceps is a secondary (0.5) on both → 4 × 0.5
    // × 2 = 4 effective sets; chest primary (1.0) on its one exercise → 4.
    const sets = GOAL_SCHEMES[TrainingGoal.Hypertrophy].compound.sets
    expect(program.volumeByGroup.get(MuscleGroup.Triceps)).toBe(sets)
    expect(program.volumeByGroup.get(MuscleGroup.Chest)).toBe(sets)
  })

  it('prescribes sets and a rep range from the goal scheme', () => {
    const program = generateProgram(
      { split: SplitType.PushPullLegs, days: 1, goal: TrainingGoal.Strength, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    const compoundScheme = GOAL_SCHEMES[TrainingGoal.Strength].compound
    for (const { sets, reps } of program.days[0].exercises) {
      expect(sets).toBe(compoundScheme.sets)
      expect(reps).toBe(compoundScheme.repRange)
    }
  })

  it('is deterministic for a given seed', () => {
    const params = { split: SplitType.PushPullLegs, days: 3, goal: TrainingGoal.Hypertrophy, equipment: new Set<Equipment>(), seed: 7 }
    const a = generateProgram(params, EXERCISES, MUSCLE_INDEX)
    const b = generateProgram(params, EXERCISES, MUSCLE_INDEX)
    const ids = (p: typeof a) => p.days.flatMap((d) => d.exercises.map((e) => e.exercise.id))
    expect(ids(a)).toEqual(ids(b))
  })
})
