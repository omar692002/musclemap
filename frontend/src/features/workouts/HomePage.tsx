import { CalendarDays, Search } from 'lucide-react'
import { SessionCard, SessionHeroCard } from './SessionCard'
import { HOME_SESSIONS, suggestedSessionFor } from '../../config/sessions.config'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { getActiveLanguage } from '../../config/i18n'
import { useAuth } from '../auth/AuthContext'
import { isStaff } from '../auth/roles'
import { useProfile } from '../onboarding/ProfileContext'
import { OnboardingPrompt } from '../onboarding/OnboardingPrompt'
import { PremiumPrompt } from '../subscription/PremiumPrompt'
import { Dashboard, QuickTile } from '../dashboard/Dashboard'

/** Today's date in the active language, e.g. "Wednesday, June 10". */
function todayLabel(): string {
  return new Intl.DateTimeFormat(getActiveLanguage(), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

/** The session launcher shown to signed-out / not-yet-onboarded users. */
function SessionLanding() {
  const featured = suggestedSessionFor(new Date())
  const others = HOME_SESSIONS.filter((session) => session.id !== featured.id)
  return (
    <>
      <SessionHeroCard session={featured} />

      <h2 className="mb-2.5 mt-6 text-xs font-semibold uppercase tracking-widest text-faint">
        {UiText.allSessions}
      </h2>
      <div className="flex flex-col gap-2.5">
        {others.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <QuickTile to={AppRoutes.program} icon={CalendarDays} title={UiText.buildYourOwn} hint={UiText.buildYourOwnHint} />
        <QuickTile to={AppRoutes.browser} icon={Search} title={UiText.browseAll} />
      </div>
    </>
  )
}

/**
 * Home screen. For a signed-in, onboarded user it renders the personalized
 * {@link Dashboard} (EM4); otherwise it falls back to the session launcher and
 * nudges sign-in/onboarding via {@link OnboardingPrompt}.
 */
export function HomePage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const firstName = user?.name.split(' ')[0]
  const showDashboard = user != null && profile?.onboardingCompleted === true
  // Coaches/admins don't onboard or buy premium — those nudges are member-only.
  const member = user != null && !isStaff(user)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5">
        <p className="text-sm font-medium capitalize text-faint">{todayLabel()}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          {UiText.homeGreeting}
          {firstName ? `, ${firstName}` : ''} 💪
        </h1>
      </header>

      {member ? <OnboardingPrompt /> : null}
      {member ? <PremiumPrompt /> : null}

      {showDashboard ? <Dashboard /> : <SessionLanding />}
    </div>
  )
}
