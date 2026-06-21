import { Link } from 'react-router-dom'
import { ChevronRight, Crown } from 'lucide-react'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { isAuthEnabled } from '../../config/auth.config'
import { useAuth } from '../auth/AuthContext'
import { useSubscription } from './SubscriptionContext'

/**
 * Home banner inviting a signed-in, non-premium user to upgrade (EM11). Hidden
 * for premium users, signed-out visitors, and when auth is unavailable — so it
 * only ever shows a real upgrade opportunity.
 */
export function PremiumPrompt() {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  if (!isAuthEnabled() || !user || isPremium) return null

  return (
    <Link
      to={AppRoutes.subscription}
      className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 shadow-sm transition hover:border-amber-500/40 active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600" aria-hidden>
        <Crown className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{UiText.subscriptionTitle}</span>
        <span className="block truncate text-xs text-muted">{UiText.subscriptionSubtitle}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">
        {UiText.subscriptionUpgradeCta}
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  )
}
