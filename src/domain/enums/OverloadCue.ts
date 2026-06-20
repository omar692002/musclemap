/**
 * The per-exercise progressive-overload cue shown on a generated lift (EM5).
 * Picked from the program's {@link ProgressionStrategy} and the exercise's
 * mechanic (heavy compounds vs. isolation accessories).
 */
export enum OverloadCue {
  /** Add weight once you hit the top of the rep range on all sets. */
  AddLoadAtTopReps = 'ADD_LOAD_AT_TOP_REPS',
  /** Add a rep each week; once at the top, add load and reset. */
  AddRepThenLoad = 'ADD_REP_THEN_LOAD',
  /** Add reps and trim rest between sets. */
  AddRepsCutRest = 'ADD_REPS_CUT_REST',
}
