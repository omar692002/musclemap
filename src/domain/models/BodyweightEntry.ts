/**
 * One bodyweight weigh-in (EM7). The same shape round-trips with the backend
 * (`bodyweight_entries`) and the localStorage fallback, and feeds the analytics
 * screen's bodyweight-evolution chart. At most one entry per day: logging again
 * on the same day replaces the value (see
 * {@link import('../../features/analytics/bodyweightApi')}).
 */
export interface BodyweightEntry {
  /** Backend UUID, or a locally-generated id on the static (no-backend) deploy. */
  readonly id: string
  readonly weightKg: number
  /** Local calendar day of the weigh-in, `yyyy-mm-dd` (one entry per day). */
  readonly recordedOn: string
  readonly note: string | null
}
