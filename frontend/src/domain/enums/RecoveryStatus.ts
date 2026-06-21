/**
 * How well a muscle group recovers between its weekly sessions (EM5). Derived
 * from the smallest calendar gap between two days that train the group: a gap of
 * at least 48h is {@link Optimal}; training it on back-to-back days is an
 * {@link Overlap} (insufficient recovery).
 */
export enum RecoveryStatus {
  Optimal = 'OPTIMAL',
  Overlap = 'OVERLAP',
}
