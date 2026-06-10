import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { useExerciseData } from './useExerciseData'
import { MuscleInvolvementList } from './components/MuscleInvolvementList'
import { ExerciseMediaGallery } from './components/ExerciseMediaGallery'
import { MuscleMapBoard } from '../muscle-map/MuscleMapBoard'
import { highlightFromExercise, highlightHeadsFromExercise } from '../muscle-map/highlight'
import { Badge } from '../../components/Badge'
import { BackButton } from '../../components/BackButton'
import { SegmentedControl } from '../../components/SegmentedControl'
import { Skeleton } from '../../components/Skeleton'
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
import { useParams } from 'react-router-dom'

const VIEW_OPTIONS = [
  { value: '3d', label: UiText.view3dLabel },
  { value: '2d', label: UiText.view2dLabel },
] as const
type ViewDimension = (typeof VIEW_OPTIONS)[number]['value']

/** Full exercise view: animated demo, muscles worked (by role), instructions. */
export function ExerciseDetailPage() {
  const params = useParams()
  const id = params.id ? decodeURIComponent(params.id) : ''
  const { exercises, muscleIndex, loading } = useExerciseData()
  const exercise = exercises.find((candidate) => candidate.id === id)
  const [view, setView] = useState<ViewDimension>('3d')

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <Skeleton className="mb-4 h-9 w-9 rounded-full" />
        <Skeleton className="mb-3 h-8 w-2/3" />
        <Skeleton className="mb-6 h-5 w-1/2" />
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="mb-3 text-zinc-600">{UiText.notFound}</p>
        <Link to={AppRoutes.browser} className="inline-block text-sm font-medium text-orange-600 hover:text-orange-700">
          {UiText.backToBrowser}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="mb-4">
        <BackButton />
      </div>

      <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-zinc-900">{exercise.name}</h1>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <Badge tone="accent">{EXERCISE_CATEGORY_LABELS[exercise.category]}</Badge>
        <Badge>{EXERCISE_LEVEL_LABELS[exercise.level]}</Badge>
        {exercise.equipment ? <Badge>{EQUIPMENT_LABELS[exercise.equipment]}</Badge> : null}
        {exercise.mechanic ? <Badge>{EXERCISE_MECHANIC_LABELS[exercise.mechanic]}</Badge> : null}
        {exercise.force ? <Badge>{EXERCISE_FORCE_LABELS[exercise.force]}</Badge> : null}
      </div>

      <ExerciseMediaGallery media={exercise.media} title={exercise.name} />

      <section className="mb-6 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-zinc-900">{UiText.musclesWorked}</h2>
          <SegmentedControl
            options={VIEW_OPTIONS}
            value={view}
            onChange={(value) => setView(value)}
          />
        </div>
        <div className="mb-4">
          {view === '3d' ? (
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

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-zinc-900">{UiText.instructions}</h2>
        {exercise.instructions.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {exercise.instructions.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-50 text-xs font-bold text-orange-600"
                >
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-zinc-600">{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-zinc-400">{UiText.noInstructions}</p>
        )}
      </section>
    </div>
  )
}
