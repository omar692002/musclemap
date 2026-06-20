/**
 * Subscription lifecycle state (EM11). Mirrors the backend
 * `com.musclemap.subscription.SubscriptionStatus`. The client gates features on
 * the derived `premium` boolean rather than this raw status, but it is surfaced
 * for display (e.g. an active premium period).
 */
export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Trialing = 'TRIALING',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
}
