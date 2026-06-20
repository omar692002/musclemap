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
      className="group mb-5 flex items-center gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm transition hover:border-orange-300 active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600" aria-hidden>
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-zinc-900">{UiText.onboardingPromptTitle}</span>
        <span className="block truncate text-xs text-zinc-500">{UiText.onboardingPromptBody}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">
        {UiText.onboardingPromptCta}
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  )
}
