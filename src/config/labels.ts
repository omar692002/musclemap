import { MuscleGroup } from '../domain/enums/MuscleGroup'
import { Equipment } from '../domain/enums/Equipment'
import { MuscleRole } from '../domain/enums/MuscleRole'
import { ExerciseLevel } from '../domain/enums/ExerciseLevel'
import { ExerciseMechanic } from '../domain/enums/ExerciseMechanic'
import { ExerciseForce } from '../domain/enums/ExerciseForce'
import { ExerciseCategory } from '../domain/enums/ExerciseCategory'

/**
 * Human-readable labels for enum values, and static UI copy.
 * Centralised so the UI never hardcodes display strings (project rule).
 */

export const MUSCLE_GROUP_LABELS: Readonly<Record<MuscleGroup, string>> = {
  [MuscleGroup.Chest]: 'Chest',
  [MuscleGroup.Back]: 'Back',
  [MuscleGroup.Shoulders]: 'Shoulders',
  [MuscleGroup.Biceps]: 'Biceps',
  [MuscleGroup.Triceps]: 'Triceps',
  [MuscleGroup.Forearms]: 'Forearms',
  [MuscleGroup.Core]: 'Core',
  [MuscleGroup.Quadriceps]: 'Quadriceps',
  [MuscleGroup.Hamstrings]: 'Hamstrings',
  [MuscleGroup.Glutes]: 'Glutes',
  [MuscleGroup.Calves]: 'Calves',
  [MuscleGroup.Neck]: 'Neck',
  [MuscleGroup.Adductors]: 'Adductors',
  [MuscleGroup.Abductors]: 'Abductors',
}

export const EQUIPMENT_LABELS: Readonly<Record<Equipment, string>> = {
  [Equipment.Bands]: 'Bands',
  [Equipment.Barbell]: 'Barbell',
  [Equipment.Bodyweight]: 'Bodyweight',
  [Equipment.Cable]: 'Cable',
  [Equipment.Dumbbell]: 'Dumbbell',
  [Equipment.EzCurlBar]: 'EZ Curl Bar',
  [Equipment.ExerciseBall]: 'Exercise Ball',
  [Equipment.FoamRoll]: 'Foam Roll',
  [Equipment.Kettlebell]: 'Kettlebell',
  [Equipment.Machine]: 'Machine',
  [Equipment.MedicineBall]: 'Medicine Ball',
  [Equipment.Other]: 'Other',
}

export const MUSCLE_ROLE_LABELS: Readonly<Record<MuscleRole, string>> = {
  [MuscleRole.Primary]: 'Primary',
  [MuscleRole.Secondary]: 'Secondary',
  [MuscleRole.Stabilizer]: 'Stabilizer',
}

export const EXERCISE_LEVEL_LABELS: Readonly<Record<ExerciseLevel, string>> = {
  [ExerciseLevel.Beginner]: 'Beginner',
  [ExerciseLevel.Intermediate]: 'Intermediate',
  [ExerciseLevel.Expert]: 'Expert',
}

export const EXERCISE_MECHANIC_LABELS: Readonly<Record<ExerciseMechanic, string>> = {
  [ExerciseMechanic.Compound]: 'Compound',
  [ExerciseMechanic.Isolation]: 'Isolation',
}

export const EXERCISE_FORCE_LABELS: Readonly<Record<ExerciseForce, string>> = {
  [ExerciseForce.Push]: 'Push',
  [ExerciseForce.Pull]: 'Pull',
  [ExerciseForce.Static]: 'Static',
}

export const EXERCISE_CATEGORY_LABELS: Readonly<Record<ExerciseCategory, string>> = {
  [ExerciseCategory.Cardio]: 'Cardio',
  [ExerciseCategory.OlympicWeightlifting]: 'Olympic Weightlifting',
  [ExerciseCategory.Plyometrics]: 'Plyometrics',
  [ExerciseCategory.Powerlifting]: 'Powerlifting',
  [ExerciseCategory.Strength]: 'Strength',
  [ExerciseCategory.Stretching]: 'Stretching',
  [ExerciseCategory.Strongman]: 'Strongman',
}

/** Static UI copy for the exercise browser/detail screens. */
export const UiText = {
  appName: 'MuscleMap',
  searchPlaceholder: 'Search exercises…',
  allGroups: 'All muscle groups',
  allEquipment: 'All equipment',
  loading: 'Loading exercises…',
  noResults: 'No exercises match your filters.',
  loadMore: 'Load more',
  backToBrowser: '← All exercises',
  notFound: 'Exercise not found.',
  musclesWorked: 'Muscles worked',
  instructions: 'Instructions',
  noInstructions: 'No instructions provided for this exercise.',
} as const
