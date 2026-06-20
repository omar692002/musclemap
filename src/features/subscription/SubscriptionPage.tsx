import { useState } from 'react'
import { Check, Crown, Sparkles } from 'lucide-react'
import { SubscriptionPlan } from '../../domain/enums/SubscriptionPlan'
import { UiText, SUBSCRIPTION_PLAN_LABELS } from '../../config/labels'
import { getActiveLanguage } from '../../config/i18n'
import { isAuthEnabled } from '../../config/auth.config'
import { useAuth } from '../auth/AuthContext'
import { useSubscription } from './SubscriptionContext'

/** One row in the FREE-vs-PREMIUM comparison. */
interface FeatureRow {
  readonly label: string
  readonly free: boolean
  readonly premium: boolean
}

/** Formats an ISO instant as a localized date (premium period end). */
function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(getActiveLanguage(), { dateStyle: 'medium' }).format(date)
}

/**
 * Subscription / Premium page (EM11). Shows the current plan, a FREE-vs-PREMIUM
 * feature comparison, and a mock upgrade/cancel (no real payment). The premium
 * entitlement it grants is enforced server-side by the content guard. Per-user
 * state, so it asks the visitor to sign in first when signed out.
 */
export function SubscriptionPage() {
  const { user } = useAuth()
  const { subscription, isPremium, upgrade, cancel } = useSubscription()
  const [busy, setBusy] = useState(false)

  const features: FeatureRow[] = [
    { label: UiText.subscriptionFeatureBrowse, free: true, premium: true },
    { label: UiText.subscriptionFeatureTracking, free: true, premium: true },
    { label: UiText.subscriptionFeaturePremiumContent, free: false, premium: true },
    { label: UiText.subscriptionFeatureEarlyAccess, free: false, premium: true },
  ]

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  const periodEnd = formatDate(subscription.currentPeriodEnd)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-600" aria-hidden>
          <Crown className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{UiText.subscriptionTitle}</h1>
          <p className="text-sm text-zinc-400">{UiText.subscriptionSubtitle}</p>
        </div>
      </header>

      {!isAuthEnabled() || !user ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-8 text-center">
          <Crown className="mx-auto h-8 w-8 text-zinc-300" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-zinc-500">{UiText.subscriptionSignInNotice}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{UiText.subscriptionSignInHint}</p>
        </div>
      ) : (
        <>
          {/* Current plan banner. */}
          <div
            className={`flex items-center justify-between rounded-2xl border p-4 ${
              isPremium ? 'border-orange-200 bg-orange-50' : 'border-zinc-200 bg-white'
            }`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {UiText.subscriptionCurrentPlan}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-lg font-extrabold text-zinc-900">
                {isPremium ? <Crown className="h-4 w-4 text-orange-500" aria-hidden /> : null}
                {SUBSCRIPTION_PLAN_LABELS[subscription.plan]}
              </p>
              {isPremium && periodEnd ? (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {UiText.subscriptionUntil} {periodEnd}
                </p>
              ) : null}
            </div>
          </div>

          {/* Feature comparison. */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PlanCard
              name={SUBSCRIPTION_PLAN_LABELS[SubscriptionPlan.Free]}
              tagline={UiText.subscriptionFreeTagline}
              features={features}
              column="free"
              highlighted={!isPremium}
            />
            <PlanCard
              name={SUBSCRIPTION_PLAN_LABELS[SubscriptionPlan.Premium]}
              tagline={UiText.subscriptionPremiumTagline}
              features={features}
              column="premium"
              highlighted={isPremium}
            />
          </div>

          {/* Action. */}
          <div className="mt-5">
            {isPremium ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(cancel)}
                className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                {busy ? UiText.subscriptionCancelling : UiText.subscriptionCancelCta}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(upgrade)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {busy ? UiText.subscriptionUpgrading : UiText.subscriptionUpgradeCta}
              </button>
            )}
            <p className="mt-2 text-center text-xs text-zinc-400">{UiText.subscriptionMockNote}</p>
          </div>
        </>
      )}
    </div>
  )
}

/** A single plan column in the comparison grid. */
function PlanCard({
  name,
  tagline,
  features,
  column,
  highlighted,
}: {
  name: string
  tagline: string
  features: readonly FeatureRow[]
  column: 'free' | 'premium'
  highlighted: boolean
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        highlighted ? 'border-orange-300 bg-orange-50/40' : 'border-zinc-200 bg-white'
      }`}
    >
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-zinc-900">
        {column === 'premium' ? <Crown className="h-4 w-4 text-orange-500" aria-hidden /> : null}
        {name}
      </h2>
      <p className="mt-0.5 text-xs text-zinc-400">{tagline}</p>
      <ul className="mt-3 space-y-2">
        {features.map((feature) => {
          const included = column === 'premium' ? feature.premium : feature.free
          return (
            <li
              key={feature.label}
              className={`flex items-start gap-2 text-xs ${included ? 'text-zinc-700' : 'text-zinc-300 line-through'}`}
            >
              <Check
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${included ? 'text-emerald-500' : 'text-zinc-300'}`}
                aria-hidden
              />
              {feature.label}
            </li>
          )
        })}
      </ul>
    </article>
  )
}
