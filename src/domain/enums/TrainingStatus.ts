/**
 * How a muscle group's recent weekly volume sits against evidence-based volume
 * landmarks (EM8). Classified from rolling 7-day effective sets vs the group's
 * MEV/MAV/MRV (see {@link import('../../config/muscleIntel.config')}).
 */
export enum TrainingStatus {
  /** No effective sets in the rolling window. */
  Untrained = 'UNTRAINED',
  /** Below the minimum effective volume (MEV) — likely leaving gains on the table. */
  Undertrained = 'UNDERTRAINED',
  /** Within the productive MEV…MRV range. */
  Optimal = 'OPTIMAL',
  /** Above the maximum recoverable volume (MRV) — risk of under-recovery. */
  Overtrained = 'OVERTRAINED',
}
