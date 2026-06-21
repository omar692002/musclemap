import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Subscription } from '../../domain/models/Subscription'
import { useAuth } from '../auth/AuthContext'
import {
  cancelSubscription,
  fetchSubscription,
  readLocalSubscription,
  upgradeSubscription,
} from './subscriptionApi'

interface SubscriptionContextValue {
  /** The current subscription (FREE until loaded / signed out). */
  readonly subscription: Subscription
  readonly loading: boolean
  /** The single entitlement flag the UI gates premium features on. */
  readonly isPremium: boolean
  /** Mock-upgrade to PREMIUM (no payment). */
  upgrade(): Promise<void>
  /** Cancel back to FREE. */
  cancel(): Promise<void>
  /** Re-read the subscription from the backend / local cache. */
  reload(): Promise<void>
}

const FREE: Subscription = readLocalSubscription()

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscription: FREE,
  loading: false,
  isPremium: false,
  upgrade: async () => undefined,
  cancel: async () => undefined,
  reload: async () => undefined,
})

/**
 * Loads and holds the current user's subscription (EM11). Seeds synchronously
 * from the local cache so gating is correct on first paint, then refreshes from
 * the backend whenever the signed-in identity changes; cleared back to FREE on
 * sign-out. The single source of truth for `isPremium` across the app.
 */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription>(readLocalSubscription)
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!user) {
      setSubscription(readLocalSubscription())
      return
    }
    setLoading(true)
    try {
      setSubscription(await fetchSubscription())
    } finally {
      setLoading(false)
    }
  }, [user])

  const upgrade = useCallback(async () => {
    setSubscription(await upgradeSubscription())
  }, [])

  const cancel = useCallback(async () => {
    setSubscription(await cancelSubscription())
  }, [])

  // Refresh whenever the signed-in identity changes (sign-in / sign-out), with a
  // cancellation guard so a late response can't clobber a newer state.
  useEffect(() => {
    let active = true
    void (async () => {
      if (!user) {
        if (active) setSubscription(readLocalSubscription())
        return
      }
      if (active) setLoading(true)
      try {
        const loaded = await fetchSubscription()
        if (active) setSubscription(loaded)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [user])

  const value = useMemo<SubscriptionContextValue>(
    () => ({ subscription, loading, isPremium: subscription.premium, upgrade, cancel, reload }),
    [subscription, loading, upgrade, cancel, reload],
  )
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

/** The current subscription state. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext)
}
