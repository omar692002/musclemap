import { Link, useParams } from 'react-router-dom'
import { useExerciseData } from './useExerciseData'
import { MuscleInvolvementList } from './components/MuscleInvolvementList'
import { ExerciseMediaGallery } from './components/ExerciseMediaGallery'
import { Badge } from '../../components/Badge'
import { AppRoutes } from '../../config/routes'
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
        <h2 className="mb-2 text-lg font-semibold text-slate-100">{UiText.musclesWorked}</h2>
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
