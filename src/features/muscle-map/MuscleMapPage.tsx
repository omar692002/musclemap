import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleId } from '../../domain/enums/MuscleId'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { MuscleMapBoard } from './MuscleMapBoard'
import { AppRoutes, browserPathForMuscle } from '../../config/routes'
import { UiText } from '../../config/labels'

// three.js is heavy — only fetched when the 3D view is actually shown.
const Muscle3DView = lazy(() => import('./three/Muscle3DView'))

const DIMENSIONS = ['3D', '2D'] as const
type Dimension = (typeof DIMENSIONS)[number]
const DIMENSION_LABELS: Readonly<Record<Dimension, string>> = {
  '3D': UiText.view3dLabel,
  '2D': UiText.view2dLabel,
}

/** Interactive muscle map (2D or rotatable 3D): tap a muscle for its exercises. */
export function MuscleMapPage() {
  const navigate = useNavigate()
  const { exercises, muscleIndex, loading } = useExerciseData()
  const [dimension, setDimension] = useState<Dimension>('3D')

  // How many exercises train each muscle — shown in each region's tooltip.
  const countByMuscle = useMemo(() => {
    const counts = new Map<string, number>()
    for (const exercise of exercises) {
      const seen = new Set<string>()
      for (const involvement of exercise.muscles) {
        if (seen.has(involvement.muscleId)) continue
        seen.add(involvement.muscleId)
        counts.set(involvement.muscleId, (counts.get(involvement.muscleId) ?? 0) + 1)
      }
    }
    return counts
  }, [exercises])

  const describe = (muscle: Muscle) =>
    `${muscle.name} · ${countByMuscle.get(muscle.id) ?? 0} ${UiText.exercisesWord}`
  const handleSelect = (muscleId: MuscleId) => navigate(browserPathForMuscle(muscleId))

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{UiText.mapTitle}</h1>
        <Link to={AppRoutes.browser} className="text-sm text-sky-400 hover:text-sky-300">
          {UiText.backToBrowser}
        </Link>
      </header>

      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{UiText.mapHelp}</p>
        <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800 p-0.5" role="group">
          {DIMENSIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDimension(value)}
              aria-pressed={dimension === value}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                dimension === value ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {DIMENSION_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">{UiText.loading}</p>
      ) : dimension === '3D' ? (
        <Suspense fallback={<p className="text-slate-400">{UiText.loading3d}</p>}>
          <Muscle3DView muscleIndex={muscleIndex} onSelect={handleSelect} describe={describe} />
        </Suspense>
      ) : (
        <MuscleMapBoard muscleIndex={muscleIndex} onSelect={handleSelect} describe={describe} />
      )}
    </div>
  )
}
