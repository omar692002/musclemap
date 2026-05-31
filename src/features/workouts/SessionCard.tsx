import { Link } from 'react-router-dom'
import type { WorkoutSession } from '../../config/sessions.config'
import { sessionPath } from '../../config/routes'
import { sessionTitle, sessionSubtitle } from './sessionPlan'

/** A big tappable workout card on the home screen. */
export function SessionCard({ session }: { session: WorkoutSession }) {
  return (
    <Link
      to={sessionPath(session.id)}
      className="group flex items-center gap-4 rounded-2xl border border-slate-700/70 bg-slate-800/70 p-4 shadow-sm transition hover:border-slate-600 hover:shadow-md active:scale-[0.99]"
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
        style={{ backgroundColor: `${session.accent}22` }}
        aria-hidden
      >
        {session.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-100">{sessionTitle(session)}</span>
        <span className="block truncate text-sm text-slate-400">{sessionSubtitle(session)}</span>
      </span>
      <span aria-hidden className="text-xl text-slate-400 transition group-hover:translate-x-0.5 rtl:rotate-180">
        ›
      </span>
    </Link>
  )
}
