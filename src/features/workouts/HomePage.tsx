import { Link } from 'react-router-dom'
import { SessionCard } from './SessionCard'
import { HOME_SESSIONS } from '../../config/sessions.config'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'

const TILE_CLASS =
  'flex items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-800/50 p-4 text-start transition hover:border-slate-600'

/** Workout-first landing: pick a ready-made session, or build your own / browse. */
export function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{UiText.homeGreeting} 💪</h1>
        <p className="text-sm text-slate-400">{UiText.homePickSession}</p>
      </header>

      <div className="flex flex-col gap-3">
        {HOME_SESSIONS.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to={AppRoutes.program} className={TILE_CLASS}>
          <span className="text-2xl" aria-hidden>
            🗓️
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-slate-100">{UiText.buildYourOwn}</span>
            <span className="block truncate text-xs text-slate-400">{UiText.buildYourOwnHint}</span>
          </span>
        </Link>
        <Link to={AppRoutes.browser} className={TILE_CLASS}>
          <span className="text-2xl" aria-hidden>
            🔎
          </span>
          <span className="font-semibold text-slate-100">{UiText.browseAll}</span>
        </Link>
      </div>
    </div>
  )
}
