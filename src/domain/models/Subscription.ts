import type { SubscriptionPlan } from '../enums/SubscriptionPlan'
import type { SubscriptionStatus } from '../enums/SubscriptionStatus'

/**
 * The current user's subscription (EM11). Mirrors the backend
 * `SubscriptionResponse`. `premium` is the single entitlement flag the UI gates
 * on — derived server-side from plan + status + period, so the client never
 * re-implements the rule.
 */
export interface Subscription {
  readonly plan: SubscriptionPlan
  readonly status: SubscriptionStatus
  readonly premium: boolean
  readonly startedAt: string | null
  readonly currentPeriodEnd: string | null
}
