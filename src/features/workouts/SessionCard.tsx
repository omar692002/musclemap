import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SESSION_HERO_GRADIENT, type WorkoutSession } from '../../config/sessions.config'
import { sessionPath } from '../../config/routes'
import { sessionTitle, sessionSubtitle } from './sessionPlan'
import { UiText } from '../../config/labels'

/** Featured session: the one big ember-gradient banner on the home screen. */
export function SessionHeroCard({ session }: { session: WorkoutSession }) {
  return (
    <Link
      to={sessionPath(session.id)}
      className={`group relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg shadow-orange-600/20 transition hover:shadow-xl hover:shadow-orange-600/25 active:scale-[0.99] ${SESSION_HERO_GRADIENT}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -end-12 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{UiText.todaysPick}</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{sessionTitle(session)}</h2>
          <p className="mt-0.5 truncate text-sm text-white/80">{sessionSubtitle(session)}</p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20" aria-hidden>
          <session.icon className="h-6 w-6" />
        </span>
      </div>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm transition group-hover:bg-orange-50">
        {UiText.startWorkout}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  )
}

/** Compact white session card used in the "All sessions" list. */
export function SessionCard({ session }: { session: WorkoutSession }) {
  return (
    <Link
      to={sessionPath(session.id)}
      className="group flex items-center gap-3.5 rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-sm transition hover:border-zinc-300 hover:shadow active:scale-[0.99]"
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${session.chip}`} aria-hidden>
        <session.icon className="h-5.5 w-5.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-zinc-900">{sessionTitle(session)}</span>
        <span className="block truncate text-sm text-zinc-400">{sessionSubtitle(session)}</span>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500 rtl:rotate-180"
        aria-hidden
      />
    </Link>
  )
}
