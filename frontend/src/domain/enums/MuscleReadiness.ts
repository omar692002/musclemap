/**
 * Whether a muscle group is recovered enough to train again (EM8), derived from
 * the time since its last stimulus, scaled by that session's load, against the
 * group's modelled recovery window.
 */
export enum MuscleReadiness {
  /** Recovered — good to train. */
  Ready = 'READY',
  /** Partway through recovery. */
  Recovering = 'RECOVERING',
  /** Recently trained and still under-recovered. */
  Fatigued = 'FATIGUED',
}
