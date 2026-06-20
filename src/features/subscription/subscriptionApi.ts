import type { Subscription } from '../../domain/models/Subscription'
import { SubscriptionPlan } from '../../domain/enums/SubscriptionPlan'
import { SubscriptionStatus } from '../../domain/enums/SubscriptionStatus'
import { StorageKey } from '../../domain/enums/StorageKey'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'
import { getStoredToken } from '../auth/authApi'

/**
 * Client for the subscription architecture (EM11). Like the EM6/EM7 clients it is
 * dual-path: when a backend is configured (`VITE_API_BASE_URL`) and we hold a
 * bearer token, plan state round-trips through `GET|POST /subscription`.
 * Otherwise — the static GitHub-Pages deploy with no backend — it persists to
 * localStorage so the upgrade/cancel flow is still demonstrable client-side
 * (premium gating then has no shared content to unlock, but the flow works).
 *
 * Upgrade/cancel are a Stripe-free mock everywhere: the entitlement model is real
 * (the backend enforces the premium content guard), the payment step is not.
 */

/** Mock premium period granted by an upgrade — kept in lock-step with the backend. */
const PREMIUM_PERIOD_DAYS = 30

const FREE_SUBSCRIPTION: Subscription = {
  plan: SubscriptionPlan.Free,
  status: SubscriptionStatus.Active,
  premium: false,
  startedAt: null,
  currentPeriodEnd: null,
}

/** Whether plan state round-trips through the backend (vs local-only). */
function usesBackend(): boolean {
  return isBackendAuthEnabled() && getStoredToken() != null
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Reads the locally cached subscription synchronously (defaults to FREE). */
export function readLocalSubscription(): Subscription {
  try {
    const raw = localStorage.getItem(StorageKey.Subscription)
    if (!raw) return FREE_SUBSCRIPTION
    return { ...FREE_SUBSCRIPTION, ...(JSON.parse(raw) as Partial<Subscription>) }
  } catch {
    return FREE_SUBSCRIPTION
  }
}

function writeLocalSubscription(subscription: Subscription): Subscription {
  try {
    localStorage.setItem(StorageKey.Subscription, JSON.stringify(subscription))
  } catch {
    // Storage unavailable (privacy mode): keep the in-memory value only.
  }
  return subscription
}

/** Builds the local PREMIUM/FREE states the mock upgrade/cancel persist. */
function localPremium(): Subscription {
  const now = new Date()
  const end = new Date(now.getTime() + PREMIUM_PERIOD_DAYS * 24 * 60 * 60 * 1000)
  return {
    plan: SubscriptionPlan.Premium,
    status: SubscriptionStatus.Active,
    premium: true,
    startedAt: now.toISOString(),
    currentPeriodEnd: end.toISOString(),
  }
}

async function post(path: string): Promise<Subscription | null> {
  try {
    const res = await fetch(`${AuthConfig.apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    })
    if (res.ok) return writeLocalSubscription((await res.json()) as Subscription)
  } catch {
    // Degrade to local persistence so the flow never dead-ends.
  }
  return null
}

/** Loads the current subscription (backend when available, else local cache). */
export async function fetchSubscription(): Promise<Subscription> {
  if (usesBackend()) {
    try {
      const res = await fetch(`${AuthConfig.apiBaseUrl}/subscription`, { headers: { ...authHeaders() } })
      if (res.ok) return writeLocalSubscription((await res.json()) as Subscription)
    } catch {
      // Network/CORS error or backend down: fall through to the local cache.
    }
  }
  return readLocalSubscription()
}

/** Upgrades to PREMIUM (mock billing); backend when available, else local. */
export async function upgradeSubscription(): Promise<Subscription> {
  if (usesBackend()) {
    const result = await post('/subscription/upgrade')
    if (result) return result
  }
  return writeLocalSubscription(localPremium())
}

/** Cancels back to FREE; backend when available, else local. */
export async function cancelSubscription(): Promise<Subscription> {
  if (usesBackend()) {
    const result = await post('/subscription/cancel')
    if (result) return result
  }
  return writeLocalSubscription(FREE_SUBSCRIPTION)
}

/** Clears the locally cached subscription (called on sign-out). */
export function clearLocalSubscription(): void {
  try {
    localStorage.removeItem(StorageKey.Subscription)
  } catch {
    // Nothing stored / storage unavailable — nothing to do.
  }
}
