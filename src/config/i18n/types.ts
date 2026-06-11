import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import type { Equipment } from '../../domain/enums/Equipment'
import type { MuscleRole } from '../../domain/enums/MuscleRole'
import type { SplitType } from '../../domain/enums/SplitType'
import type { TrainingGoal } from '../../domain/enums/TrainingGoal'
import type { DayFocus } from '../../domain/enums/DayFocus'
import type { ExerciseLevel } from '../../domain/enums/ExerciseLevel'
import type { ExerciseMechanic } from '../../domain/enums/ExerciseMechanic'
import type { ExerciseForce } from '../../domain/enums/ExerciseForce'
import type { ExerciseCategory } from '../../domain/enums/ExerciseCategory'

/** Static UI copy. One implementation per language keeps the set in lock-step. */
export interface UiStrings {
  readonly appName: string
  readonly searchPlaceholder: string
  readonly allGroups: string
  readonly allEquipment: string
  readonly loading: string
  readonly noResults: string
  readonly loadMore: string
  readonly backToBrowser: string
  readonly notFound: string
  readonly musclesWorked: string
  readonly instructions: string
  readonly noInstructions: string
  readonly openMap: string
  readonly mapTitle: string
  readonly mapHelp: string
  readonly muscleFilterLabel: string
  readonly clearFilter: string
  readonly exercisesWord: string
  readonly map3dHint: string
  readonly rotateHint: string
  readonly loading3d: string
  readonly openProgram: string
  readonly programTitle: string
  readonly programHelp: string
  readonly splitLabel: string
  readonly daysLabel: string
  readonly goalLabel: string
  readonly equipmentLabel: string
  readonly allEquipmentShort: string
  readonly setsWord: string
  readonly repsWord: string
  readonly regenerate: string
  readonly weeklyVolume: string
  readonly emptyDay: string
  readonly dayWord: string
  readonly warmupTitle: string
  readonly languageLabel: string
  // Mobile shell + workout-first home.
  readonly navHome: string
  readonly navExercises: string
  readonly navBody: string
  readonly navPlan: string
  readonly homeGreeting: string
  readonly homePickSession: string
  readonly startWorkout: string
  readonly buildYourOwn: string
  readonly buildYourOwnHint: string
  readonly exercisesHeading: string
  readonly back: string
  readonly cardioTitle: string
  readonly cardioSubtitle: string
  readonly cardioDuration: string
  readonly browseAll: string
  // Exercise media (animated demo + curated video).
  readonly demoLabel: string
  readonly videoGuideLabel: string
  readonly playPauseDemo: string
  // Home structure.
  readonly todaysPick: string
  readonly allSessions: string
  // Auth.
  readonly signIn: string
  readonly signOut: string
}

/**
 * A complete language pack. Every enum-keyed map is exhaustive (TS `Record`
 * enforces it), so a missing translation is a compile error — not a silent
 * English fallback at runtime.
 */
export interface Translation {
  readonly ui: UiStrings
  readonly muscleGroup: Readonly<Record<MuscleGroup, string>>
  readonly equipment: Readonly<Record<Equipment, string>>
  readonly role: Readonly<Record<MuscleRole, string>>
  readonly split: Readonly<Record<SplitType, string>>
  readonly goal: Readonly<Record<TrainingGoal, string>>
  readonly dayFocus: Readonly<Record<DayFocus, string>>
  readonly level: Readonly<Record<ExerciseLevel, string>>
  readonly mechanic: Readonly<Record<ExerciseMechanic, string>>
  readonly force: Readonly<Record<ExerciseForce, string>>
  readonly category: Readonly<Record<ExerciseCategory, string>>
  /** Warm-up checklist shown atop each training day. */
  readonly warmup: readonly string[]
}
