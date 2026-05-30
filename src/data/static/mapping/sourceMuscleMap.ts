import { MuscleId } from '../../../domain/enums/MuscleId'
import { MuscleRole } from '../../../domain/enums/MuscleRole'
import { Equipment } from '../../../domain/enums/Equipment'
import { ExerciseMechanic } from '../../../domain/enums/ExerciseMechanic'
import { ExerciseForce } from '../../../domain/enums/ExerciseForce'
import { ExerciseLevel } from '../../../domain/enums/ExerciseLevel'
import { ExerciseCategory } from '../../../domain/enums/ExerciseCategory'
import type {
  SourceMuscleName,
  SourceEquipment,
  SourceMechanic,
  SourceForce,
  SourceLevel,
  SourceCategory,
} from '../source/sourceSchema'

/**
 * Translation tables: external source vocabulary -> our taxonomy/enums.
 * This module is the single place the raw strings are interpreted; the
 * taxonomy integrity test guarantees every source muscle resolves to a
 * real `Muscle`.
 */

export const SOURCE_MUSCLE_TO_ID: Readonly<Record<SourceMuscleName, MuscleId>> = {
  abdominals: MuscleId.RectusAbdominis,
  abductors: MuscleId.HipAbductors,
  adductors: MuscleId.HipAdductors,
  biceps: MuscleId.BicepsBrachii,
  calves: MuscleId.Calves,
  chest: MuscleId.PectoralisMajor,
  forearms: MuscleId.Forearms,
  glutes: MuscleId.Gluteus,
  hamstrings: MuscleId.Hamstrings,
  lats: MuscleId.LatissimusDorsi,
  'lower back': MuscleId.ErectorSpinae,
  'middle back': MuscleId.Rhomboids,
  neck: MuscleId.Neck,
  quadriceps: MuscleId.Quadriceps,
  shoulders: MuscleId.Deltoid,
  traps: MuscleId.Trapezius,
  triceps: MuscleId.TricepsBrachii,
}

export const SOURCE_EQUIPMENT_TO_ENUM: Readonly<Record<SourceEquipment, Equipment>> = {
  bands: Equipment.Bands,
  barbell: Equipment.Barbell,
  'body only': Equipment.Bodyweight,
  cable: Equipment.Cable,
  dumbbell: Equipment.Dumbbell,
  'e-z curl bar': Equipment.EzCurlBar,
  'exercise ball': Equipment.ExerciseBall,
  'foam roll': Equipment.FoamRoll,
  kettlebells: Equipment.Kettlebell,
  machine: Equipment.Machine,
  'medicine ball': Equipment.MedicineBall,
  other: Equipment.Other,
}

export const SOURCE_MECHANIC_TO_ENUM: Readonly<Record<SourceMechanic, ExerciseMechanic>> = {
  compound: ExerciseMechanic.Compound,
  isolation: ExerciseMechanic.Isolation,
}

export const SOURCE_FORCE_TO_ENUM: Readonly<Record<SourceForce, ExerciseForce>> = {
  push: ExerciseForce.Push,
  pull: ExerciseForce.Pull,
  static: ExerciseForce.Static,
}

export const SOURCE_LEVEL_TO_ENUM: Readonly<Record<SourceLevel, ExerciseLevel>> = {
  beginner: ExerciseLevel.Beginner,
  intermediate: ExerciseLevel.Intermediate,
  expert: ExerciseLevel.Expert,
}

export const SOURCE_CATEGORY_TO_ENUM: Readonly<Record<SourceCategory, ExerciseCategory>> = {
  cardio: ExerciseCategory.Cardio,
  'olympic weightlifting': ExerciseCategory.OlympicWeightlifting,
  plyometrics: ExerciseCategory.Plyometrics,
  powerlifting: ExerciseCategory.Powerlifting,
  strength: ExerciseCategory.Strength,
  stretching: ExerciseCategory.Stretching,
  strongman: ExerciseCategory.Strongman,
}

/**
 * Default per-role volume contribution (0..1) used until per-exercise
 * values are curated. A transparent default, not fabricated source data.
 */
export const ROLE_DEFAULT_CONTRIBUTION: Readonly<Record<MuscleRole, number>> = {
  [MuscleRole.Primary]: 1,
  [MuscleRole.Secondary]: 0.5,
  [MuscleRole.Stabilizer]: 0.25,
}
