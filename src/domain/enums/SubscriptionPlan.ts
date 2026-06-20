/**
 * Subscription tier (EM11). Mirrors the backend `com.musclemap.subscription.SubscriptionPlan`;
 * the string values match the persisted enum names so the same value travels
 * UI → API → DB unchanged. PREMIUM unlocks premium-gated coach content.
 */
export enum SubscriptionPlan {
  Free = 'FREE',
  Premium = 'PREMIUM',
}
