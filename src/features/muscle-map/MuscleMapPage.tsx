import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleId } from '../../domain/enums/MuscleId'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { MuscleMapBoard } from './MuscleMapBoard'
import { AppRoutes, browserPathForMuscle } from '../../config/routes'
import { UiText } from '../../config/labels'

/** Interactive muscle map: tap a muscle to jump to the exercises that train it. */
export function MuscleMapPage() {
  const navigate = useNavigate()
  const { exercises, muscleIndex, loading } = useExerciseData()

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
      <p className="mb-5 text-sm text-slate-400">{UiText.mapHelp}</p>

      {loading ? (
        <p className="text-slate-400">{UiText.loading}</p>
      ) : (
        <MuscleMapBoard muscleIndex={muscleIndex} onSelect={handleSelect} describe={describe} />
      )}
    </div>
  )
}
