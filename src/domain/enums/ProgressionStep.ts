/** One week's instruction within a mesocycle's progression plan (EM5). */
export enum ProgressionStep {
  /** Establish working weights at the prescribed reps. */
  Baseline = 'BASELINE',
  /** Add load while keeping the rep target. */
  AddLoad = 'ADD_LOAD',
  /** Push for more reps at the same load. */
  AddReps = 'ADD_REPS',
  /** Add load and reset to the bottom of the rep range. */
  AddLoadResetReps = 'ADD_LOAD_RESET_REPS',
  /** Keep load/reps but shorten rest to raise density. */
  CutRest = 'CUT_REST',
  /** Back off volume/intensity to recover before the next block. */
  Deload = 'DELOAD',
}
