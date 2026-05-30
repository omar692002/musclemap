/**
 * Shape of a record in `yuhonas/free-exercise-db` (`dist/exercises.json`).
 * These string unions are the external source vocabulary; they live in the
 * data layer (not the domain) and are translated into our enums by the
 * mapping module. Declared once here so the raw strings are never scattered.
 */

export type SourceMuscleName =
  | 'abdominals'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lower back'
  | 'middle back'
  | 'neck'
  | 'quadriceps'
  | 'shoulders'
  | 'traps'
  | 'triceps'

export type SourceEquipment =
  | 'bands'
  | 'barbell'
  | 'body only'
  | 'cable'
  | 'dumbbell'
  | 'e-z curl bar'
  | 'exercise ball'
  | 'foam roll'
  | 'kettlebells'
  | 'machine'
  | 'medicine ball'
  | 'other'

export type SourceForce = 'pull' | 'push' | 'static'

export type SourceLevel = 'beginner' | 'intermediate' | 'expert'

export type SourceMechanic = 'compound' | 'isolation'

export type SourceCategory =
  | 'cardio'
  | 'olympic weightlifting'
  | 'plyometrics'
  | 'powerlifting'
  | 'strength'
  | 'stretching'
  | 'strongman'

export interface RawExercise {
  readonly id: string
  readonly name: string
  readonly force: SourceForce | null
  readonly level: SourceLevel
  readonly mechanic: SourceMechanic | null
  readonly equipment: SourceEquipment | null
  readonly primaryMuscles: readonly SourceMuscleName[]
  readonly secondaryMuscles: readonly SourceMuscleName[]
  readonly instructions: readonly string[]
  readonly category: SourceCategory
  readonly images: readonly string[]
}
