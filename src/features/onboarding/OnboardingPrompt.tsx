import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { useProfile } from './ProfileContext'

/**
 * Home banner (EM3) nudging a signed-in user who hasn't finished onboarding to
 * complete their profile. Renders nothing once the profile is complete (or while
 * signed out), so it self-dismisses after the wizard.
 */
export function OnboardingPrompt() {
  const { needsOnboarding } = useProfile()
  if (!needsOnboarding) return null

  return (
    <Link
      to={AppRoutes.onboarding}
      className="group mb-5 flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 shadow-sm transition hover:border-orange-500/40 active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-orange-600" aria-hidden>
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{UiText.onboardingPromptTitle}</span>
        <span className="block truncate text-xs text-muted">{UiText.onboardingPromptBody}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">
        {UiText.onboardingPromptCta}
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  )
}
