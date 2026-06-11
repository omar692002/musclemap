import { lazy, Suspense, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MuscleId } from '../../domain/enums/MuscleId'
import type { RegionRef } from './region'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { headsOf } from './headAttribution'
import { isHeadedMuscle } from '../../data/static/taxonomy/muscleHeads'
import { browserPathForMuscle, browserPathForHead } from '../../config/routes'
import { UiText } from '../../config/labels'
import { Skeleton } from '../../components/Skeleton'

// three.js is heavy — only fetched when the page is actually shown.
const Muscle3DView = lazy(() => import('./three/Muscle3DView'))

/** Interactive rotatable, head-split 3D muscle map: tap a region for its exercises. */
export function MuscleMapPage() {
  const navigate = useNavigate()
  const { exercises, muscleIndex, loading } = useExerciseData()

  // Exercise counts per region/head (shown in the 3D hover tooltips).
  const countByRegion = useMemo(() => {
    const byRegion = new Map<string, number>()
    for (const exercise of exercises) {
      const regions = new Set<string>()
      for (const headId of headsOf(exercise).keys()) regions.add(headId)
      for (const involvement of exercise.muscles) {
        if (!isHeadedMuscle(involvement.muscleId as MuscleId)) regions.add(involvement.muscleId)
      }
      for (const key of regions) byRegion.set(key, (byRegion.get(key) ?? 0) + 1)
    }
    return byRegion
  }, [exercises])

  const countFor = (regionKey: string) => countByRegion.get(regionKey) ?? 0
  const handleRegion = (region: RegionRef) =>
    navigate(region.headId ? browserPathForHead(region.headId) : browserPathForMuscle(region.muscleId))

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{UiText.mapTitle}</h1>
      </header>

      <p className="mb-5 text-sm text-zinc-500">{UiText.mapHelp}</p>

      {loading ? (
        <div className="flex justify-center">
          <Skeleton className="aspect-[3/4] w-full max-w-[380px] rounded-2xl" />
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="aspect-[3/4] w-full max-w-[380px] rounded-2xl" />
              <p className="text-sm text-zinc-400">{UiText.loading3d}</p>
            </div>
          }
        >
          <Muscle3DView muscleIndex={muscleIndex} onSelect={handleRegion} countFor={countFor} />
        </Suspense>
      )}
    </div>
  )
}
