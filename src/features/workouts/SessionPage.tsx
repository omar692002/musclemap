import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { sessionExercises, sessionTitle, sessionSubtitle } from './sessionPlan'
import { SESSION_BY_ID } from '../../config/sessions.config'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { WarmupBlock } from '../../components/WarmupBlock'
import { WorkoutExerciseRow } from '../../components/WorkoutExerciseRow'

/** A ready-made workout: warm-up + exercises for the chosen session. */
export function SessionPage() {
  const params = useParams()
  const navigate = useNavigate()
  const session = params.id ? SESSION_BY_ID.get(decodeURIComponent(params.id)) : undefined
  const { exercises, muscleIndex, loading } = useExerciseData()
  const [seed, setSeed] = useState(0)

  const items = useMemo(
    () => (session ? sessionExercises(session, exercises, muscleIndex, seed) : []),
    [session, exercises, muscleIndex, seed],
  )

  if (!session) return <Navigate to={AppRoutes.home} replace />

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-block text-sm text-sky-400 hover:text-sky-300"
      >
        ← {UiText.back}
      </button>

      <header className="mb-4 flex items-center gap-3">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
          style={{ backgroundColor: `${session.accent}22` }}
          aria-hidden
        >
          {session.icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">{sessionTitle(session)}</h1>
          <p className="text-sm text-slate-400">{sessionSubtitle(session)}</p>
        </div>
      </header>

      <div className="mb-4">
        <WarmupBlock />
      </div>

      {loading ? (
        <p className="text-slate-400">{UiText.loading}</p>
      ) : (
        <section className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-100">{UiText.exercisesHeading}</h2>
            <button
              type="button"
              onClick={() => setSeed((value) => value + 1)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
            >
              {UiText.regenerate}
            </button>
          </div>
          {items.length === 0 ? (
            <p className="py-2 text-sm text-slate-500">{UiText.emptyDay}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-800">
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
