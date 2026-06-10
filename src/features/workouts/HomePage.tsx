import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SessionCard, SessionHeroCard } from './SessionCard'
import { HOME_SESSIONS, suggestedSessionFor } from '../../config/sessions.config'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { getActiveLanguage } from '../../config/i18n'
import { useAuth } from '../auth/AuthContext'

/** Today's date in the active language, e.g. "Wednesday, June 10". */
function todayLabel(): string {
  return new Intl.DateTimeFormat(getActiveLanguage(), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

function QuickTile({ to, icon: Icon, title, hint }: { to: string; icon: LucideIcon; title: string; hint?: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-zinc-900">{title}</span>
        {hint ? <span className="block truncate text-xs text-zinc-400">{hint}</span> : null}
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500 rtl:rotate-180"
        aria-hidden
      />
    </Link>
  )
}

/** Workout-first landing: today's featured session, the rest, and shortcuts. */
export function HomePage() {
  const { user } = useAuth()
  const featured = suggestedSessionFor(new Date())
  const others = HOME_SESSIONS.filter((session) => session.id !== featured.id)
  const firstName = user?.name.split(' ')[0]

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5">
        <p className="text-sm font-medium capitalize text-zinc-400">{todayLabel()}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          {UiText.homeGreeting}
          {firstName ? `, ${firstName}` : ''} 💪
        </h1>
      </header>

      <SessionHeroCard session={featured} />

      <h2 className="mb-2.5 mt-6 text-xs font-semibold uppercase tracking-widest text-zinc-400">
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
    </div>
  )
}
