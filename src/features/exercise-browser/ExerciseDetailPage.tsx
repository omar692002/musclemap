import { lazy, Suspense, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useExerciseData } from './useExerciseData'
import { MuscleInvolvementList } from './components/MuscleInvolvementList'
import { ExerciseMediaGallery } from './components/ExerciseMediaGallery'
import { MuscleMapBoard } from '../muscle-map/MuscleMapBoard'
import { highlightFromExercise, highlightHeadsFromExercise } from '../muscle-map/highlight'
import { Badge } from '../../components/Badge'
import { AppRoutes } from '../../config/routes'

// Reuse the rotatable 3D model (read-only, worked muscles highlighted). Lazy so
// three.js loads only when a detail page is opened.
const Muscle3DView = lazy(() => import('../muscle-map/three/Muscle3DView'))
import {
  UiText,
  EQUIPMENT_LABELS,
  EXERCISE_LEVEL_LABELS,
  EXERCISE_CATEGORY_LABELS,
  EXERCISE_MECHANIC_LABELS,
  EXERCISE_FORCE_LABELS,
} from '../../config/labels'

const BACK_LINK_CLASS = 'inline-block text-sm text-sky-400 hover:text-sky-300'

/** Full exercise view: media, muscles worked (by role), and instructions. */
export function ExerciseDetailPage() {
  const params = useParams()
  const id = params.id ? decodeURIComponent(params.id) : ''
  const { exercises, muscleIndex, loading } = useExerciseData()
  const exercise = exercises.find((candidate) => candidate.id === id)
  const [show3d, setShow3d] = useState(true)

  if (loading) {
    return <p className="mx-auto max-w-3xl px-4 py-6 text-slate-400">{UiText.loading}</p>
  }

  if (!exercise) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="mb-3 text-slate-300">{UiText.notFound}</p>
        <Link to={AppRoutes.browser} className={BACK_LINK_CLASS}>
          {UiText.backToBrowser}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to={AppRoutes.browser} className={`${BACK_LINK_CLASS} mb-4`}>
        {UiText.backToBrowser}
      </Link>

      <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-100">{exercise.name}</h1>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <Badge tone="accent">{EXERCISE_CATEGORY_LABELS[exercise.category]}</Badge>
        <Badge>{EXERCISE_LEVEL_LABELS[exercise.level]}</Badge>
        {exercise.equipment ? <Badge>{EQUIPMENT_LABELS[exercise.equipment]}</Badge> : null}
        {exercise.mechanic ? <Badge>{EXERCISE_MECHANIC_LABELS[exercise.mechanic]}</Badge> : null}
        {exercise.force ? <Badge>{EXERCISE_FORCE_LABELS[exercise.force]}</Badge> : null}
      </div>

      <ExerciseMediaGallery media={exercise.media} title={exercise.name} />

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-100">{UiText.musclesWorked}</h2>
          <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800 p-0.5" role="group">
            <button
              type="button"
              onClick={() => setShow3d(true)}
              aria-pressed={show3d}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                show3d ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {UiText.view3dLabel}
            </button>
            <button
              type="button"
              onClick={() => setShow3d(false)}
              aria-pressed={!show3d}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                !show3d ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {UiText.view2dLabel}
            </button>
          </div>
        </div>
        <div className="mb-4">
          {show3d ? (
            // 3D is head-level (e.g. a lateral raise lights only the side delt);
            // the 2D fallback/board stays whole-muscle.
            <Suspense fallback={<MuscleMapBoard muscleIndex={muscleIndex} highlight={highlightFromExercise(exercise)} />}>
              <Muscle3DView muscleIndex={muscleIndex} highlight={highlightHeadsFromExercise(exercise)} />
            </Suspense>
          ) : (
            <MuscleMapBoard muscleIndex={muscleIndex} highlight={highlightFromExercise(exercise)} />
          )}
        </div>
        <MuscleInvolvementList exercise={exercise} muscleIndex={muscleIndex} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-100">{UiText.instructions}</h2>
        {exercise.instructions.length > 0 ? (
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
            {exercise.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-400">{UiText.noInstructions}</p>
        )}
      </section>
    </div>
  )
}
