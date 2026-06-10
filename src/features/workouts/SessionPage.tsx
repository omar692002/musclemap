import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { sessionExercises, sessionTitle, sessionSubtitle } from './sessionPlan'
import { SESSION_BY_ID, SESSION_HERO_GRADIENT } from '../../config/sessions.config'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { BackButton } from '../../components/BackButton'
import { WarmupBlock } from '../../components/WarmupBlock'
import { WorkoutExerciseRow } from '../../components/WorkoutExerciseRow'
import { RowListSkeleton } from '../../components/Skeleton'

/** A ready-made workout: warm-up + exercises for the chosen session. */
export function SessionPage() {
  const params = useParams()
  const session = params.id ? SESSION_BY_ID.get(decodeURIComponent(params.id)) : undefined
  const { exercises, muscleIndex, loading } = useExerciseData()
  const [seed, setSeed] = useState(0)

  const items = useMemo(
    () => (session ? sessionExercises(session, exercises, muscleIndex, seed) : []),
    [session, exercises, muscleIndex, seed],
  )

  if (!session) return <Navigate to={AppRoutes.home} replace />

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <div className="mb-4">
        <BackButton />
      </div>

      {/* Gradient session banner. */}
      <header
        className={`relative mb-4 flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg shadow-orange-600/20 ${SESSION_HERO_GRADIENT}`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -end-10 -top-14 h-40 w-40 rounded-full bg-white/15 blur-2xl"
        />
        <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-white/20 p-3" aria-hidden>
          <session.icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight">{sessionTitle(session)}</h1>
          <p className="truncate text-sm text-white/80">{sessionSubtitle(session)}</p>
        </div>
      </header>

      <div className="mb-4">
        <WarmupBlock />
      </div>

      {loading ? (
        <RowListSkeleton count={6} />
      ) : (
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">
              {UiText.exercisesHeading}
              <span className="ms-1.5 text-xs font-normal text-zinc-400">{items.length}</span>
            </h2>
            <button
              type="button"
              onClick={() => setSeed((value) => value + 1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              {UiText.regenerate}
            </button>
          </div>
          {items.length === 0 ? (
            <p className="py-2 text-sm text-zinc-400">{UiText.emptyDay}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-100">
              {items.map((item) => (
                <WorkoutExerciseRow key={item.exercise.id} item={item} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
