/**
 * High-level muscle groups (browsing/filtering taxonomy).
 * The finer muscle-head taxonomy is modelled per-muscle in M1
 * (see DATA_MODEL.md). This enum is the stable, UI-facing grouping.
 */
export enum MuscleGroup {
  Chest = 'CHEST',
  Back = 'BACK',
  Shoulders = 'SHOULDERS',
  Biceps = 'BICEPS',
  Triceps = 'TRICEPS',
  Forearms = 'FOREARMS',
  Core = 'CORE',
  Quadriceps = 'QUADRICEPS',
  Hamstrings = 'HAMSTRINGS',
  Glutes = 'GLUTES',
  Calves = 'CALVES',
  Neck = 'NECK',
}
