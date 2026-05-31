import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleId } from '../../domain/enums/MuscleId'
import type { RegionRef } from './region'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { MuscleMapBoard } from './MuscleMapBoard'
import { headsOf } from './headAttribution'
import { isHeadedMuscle } from '../../data/static/taxonomy/muscleHeads'
import { browserPathForMuscle, browserPathForHead } from '../../config/routes'
import { UiText } from '../../config/labels'

// three.js is heavy — only fetched when the 3D view is actually shown.
const Muscle3DView = lazy(() => import('./three/Muscle3DView'))

const DIMENSIONS = ['3D', '2D'] as const
type Dimension = (typeof DIMENSIONS)[number]
const DIMENSION_LABELS: Readonly<Record<Dimension, string>> = {
  '3D': UiText.view3dLabel,
  '2D': UiText.view2dLabel,
}

/** Interactive muscle map (2D or rotatable, head-split 3D): tap for exercises. */
export function MuscleMapPage() {
  const navigate = useNavigate()
  const { exercises, muscleIndex, loading } = useExerciseData()
  const [dimension, setDimension] = useState<Dimension>('3D')

  // Exercise counts per whole muscle (2D) and per region/head (3D tooltips).
  const { countByMuscle, countByRegion } = useMemo(() => {
    const byMuscle = new Map<string, number>()
    const byRegion = new Map<string, number>()
    for (const exercise of exercises) {
      const muscles = new Set<string>()
      for (const involvement of exercise.muscles) muscles.add(involvement.muscleId)
      for (const muscleId of muscles) byMuscle.set(muscleId, (byMuscle.get(muscleId) ?? 0) + 1)

      const regions = new Set<string>()
      for (const headId of headsOf(exercise).keys()) regions.add(headId)
      for (const muscleId of muscles) if (!isHeadedMuscle(muscleId as MuscleId)) regions.add(muscleId)
      for (const key of regions) byRegion.set(key, (byRegion.get(key) ?? 0) + 1)
    }
    return { countByMuscle: byMuscle, countByRegion: byRegion }
  }, [exercises])

  const describe = (muscle: Muscle) =>
    `${muscle.name} · ${countByMuscle.get(muscle.id) ?? 0} ${UiText.exercisesWord}`
  const countFor = (regionKey: string) => countByRegion.get(regionKey) ?? 0
  const handleMuscle = (muscleId: MuscleId) => navigate(browserPathForMuscle(muscleId))
  const handleRegion = (region: RegionRef) =>
    navigate(region.headId ? browserPathForHead(region.headId) : browserPathForMuscle(region.muscleId))

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{UiText.mapTitle}</h1>
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
          <Muscle3DView muscleIndex={muscleIndex} onSelect={handleRegion} countFor={countFor} />
        </Suspense>
      ) : (
        <MuscleMapBoard muscleIndex={muscleIndex} onSelect={handleMuscle} describe={describe} />
      )}
    </div>
  )
}
