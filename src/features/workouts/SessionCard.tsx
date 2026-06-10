import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { WorkoutSession } from '../../config/sessions.config'
import { sessionPath } from '../../config/routes'
import { sessionTitle, sessionSubtitle } from './sessionPlan'
import { UiText } from '../../config/labels'

/** A big tappable gradient workout banner on the home screen. */
export function SessionCard({ session }: { session: WorkoutSession }) {
  return (
    <Link
      to={sessionPath(session.id)}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg shadow-zinc-900/5 transition hover:shadow-xl hover:shadow-zinc-900/10 active:scale-[0.99] ${session.gradient}`}
    >
      {/* Soft highlight blob for depth. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -end-10 -top-14 h-40 w-40 rounded-full bg-white/15 blur-2xl"
      />
      <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-white/20 p-3 backdrop-blur-sm" aria-hidden>
        <session.icon className="h-7 w-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold tracking-tight">{sessionTitle(session)}</span>
        <span className="block truncate text-sm text-white/80">{sessionSubtitle(session)}</span>
        <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-white/70">
          {UiText.startWorkout}
        </span>
      </span>
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 transition group-hover:bg-white/30"
      >
        <ChevronRight className="h-5 w-5 rtl:rotate-180" />
      </span>
    </Link>
  )
}
