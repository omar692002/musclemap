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
import { RecoveryStatus } from '../../../domain/enums/RecoveryStatus'
import { ProgressionStrategy } from '../../../domain/enums/ProgressionStrategy'
import { generateProgram } from '../programGenerator'
import { GOAL_SCHEMES, WEEK_ORDER } from '../../../config/program.config'

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

/** The non-rest days of a generated week, in calendar order. */
function trainingDays(program: ReturnType<typeof generateProgram>) {
  return program.days.filter((day) => !day.isRest)
}

describe('generateProgram', () => {
  it('lays out a full Mon→Sun week with the requested number of training days', () => {
    const program = generateProgram(
      { split: SplitType.PushPullLegs, days: 3, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(program.days).toHaveLength(WEEK_ORDER.length)
    const training = trainingDays(program)
    expect(training).toHaveLength(3)
    expect(training.map((d) => d.focus)).toEqual([DayFocus.Push, DayFocus.Pull, DayFocus.Legs])
  })

  it('inserts rest days for the remaining slots (focus = Rest, no exercises)', () => {
    const program = generateProgram(
      { split: SplitType.FullBody, days: 3, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    const rest = program.days.filter((d) => d.isRest)
    expect(rest).toHaveLength(WEEK_ORDER.length - 3)
    expect(rest.every((d) => d.focus === DayFocus.Rest && d.exercises.length === 0)).toBe(true)
  })

  it('supports the body-part split (Chest+Tri, Back+Bi, Legs, Shoulders+Core)', () => {
    const program = generateProgram(
      { split: SplitType.BodyPart, days: 4, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(trainingDays(program).map((d) => d.focus)).toEqual([
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
        days: 2,
        goal: TrainingGoal.Hypertrophy,
        equipment: new Set([Equipment.Bodyweight]),
        seed: 0,
      },
      EXERCISES,
      MUSCLE_INDEX,
    )
    const equipmentUsed = trainingDays(program).flatMap((d) => d.exercises.map((e) => e.exercise.equipment))
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
    for (const { sets, reps } of trainingDays(program)[0].exercises) {
      expect(sets).toBe(compoundScheme.sets)
      expect(reps).toBe(compoundScheme.repRange)
    }
  })

  it('tags every prescribed exercise with a progressive-overload cue', () => {
    const program = generateProgram(
      { split: SplitType.PushPullLegs, days: 3, goal: TrainingGoal.Strength, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    const exercises = trainingDays(program).flatMap((d) => d.exercises)
    expect(exercises.length).toBeGreaterThan(0)
    expect(exercises.every((e) => e.overload != null)).toBe(true)
  })

  it('spaces a 3-day week so trained groups stay well recovered', () => {
    const program = generateProgram(
      { split: SplitType.FullBody, days: 3, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(program.recovery.length).toBeGreaterThan(0)
    // Mon/Wed/Fri layout → ≥48h between sessions for every group.
    expect(program.recovery.every((r) => r.status === RecoveryStatus.Optimal)).toBe(true)
  })

  it('flags an overlap when a group is trained on back-to-back days', () => {
    // Full body 6×/week trains every group on consecutive calendar days.
    const program = generateProgram(
      { split: SplitType.FullBody, days: 6, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(program.recovery.some((r) => r.status === RecoveryStatus.Overlap)).toBe(true)
  })

  it('derives a 4-week progression plan from the goal', () => {
    const strength = generateProgram(
      { split: SplitType.PushPullLegs, days: 3, goal: TrainingGoal.Strength, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(strength.progression.strategy).toBe(ProgressionStrategy.LinearLoad)
    expect(strength.progression.weeks).toHaveLength(4)
    expect(strength.progression.weeks.map((w) => w.week)).toEqual([1, 2, 3, 4])

    const hypertrophy = generateProgram(
      { split: SplitType.PushPullLegs, days: 3, goal: TrainingGoal.Hypertrophy, equipment: new Set(), seed: 0 },
      EXERCISES,
      MUSCLE_INDEX,
    )
    expect(hypertrophy.progression.strategy).toBe(ProgressionStrategy.DoubleProgression)
  })

  it('is deterministic for a given seed', () => {
    const params = { split: SplitType.PushPullLegs, days: 3, goal: TrainingGoal.Hypertrophy, equipment: new Set<Equipment>(), seed: 7 }
    const a = generateProgram(params, EXERCISES, MUSCLE_INDEX)
    const b = generateProgram(params, EXERCISES, MUSCLE_INDEX)
    const ids = (p: typeof a) => p.days.flatMap((d) => d.exercises.map((e) => e.exercise.id))
    expect(ids(a)).toEqual(ids(b))
  })
})
