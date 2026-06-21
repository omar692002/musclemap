import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles, X } from 'lucide-react'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { useProfile } from './ProfileContext'

/**
 * Home banner (EM3) nudging a signed-in user who hasn't finished onboarding to
 * complete their profile. It self-dismisses once the profile is complete, while
 * signed out, or once the user taps "skip" — which is remembered per user so it
 * never nags again on this device.
 */
export function OnboardingPrompt() {
  const { needsOnboarding, skip } = useProfile()
  if (!needsOnboarding) return null

  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 shadow-sm">
      <Link to={AppRoutes.onboarding} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-orange-600" aria-hidden>
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">{UiText.onboardingPromptTitle}</span>
          <span className="block truncate text-xs text-muted">{UiText.onboardingPromptBody}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-bold text-white sm:inline-flex">
          {UiText.onboardingPromptCta}
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
        </span>
      </Link>
      <button
        type="button"
        onClick={skip}
        aria-label={UiText.onboardingSkip}
        title={UiText.onboardingSkip}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-faint transition hover:bg-orange-500/10 hover:text-muted"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
