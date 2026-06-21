import { useEffect, useState } from 'react'
import { useRepositories } from '../../context/RepositoryContext'
import type { Exercise } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'

export interface ExerciseData {
  readonly exercises: readonly Exercise[]
  /** muscleId -> Muscle, for resolving names/groups without extra lookups. */
  readonly muscleIndex: ReadonlyMap<string, Muscle>
  readonly loading: boolean
}

/**
 * Loads the exercise dataset and a muscle lookup once, through the injected
 * repository interfaces. Both screens share it; the data is in-memory so this
 * is cheap and avoids prop-drilling the repositories.
 */
export function useExerciseData(): ExerciseData {
  const { exerciseRepository, muscleRepository } = useRepositories()
  const [exercises, setExercises] = useState<readonly Exercise[]>([])
  const [muscleIndex, setMuscleIndex] = useState<ReadonlyMap<string, Muscle>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([exerciseRepository.getAll(), muscleRepository.getAll()]).then(
      ([loadedExercises, muscles]) => {
        if (!active) return
        setExercises(loadedExercises)
        setMuscleIndex(new Map(muscles.map((muscle) => [muscle.id, muscle])))
        setLoading(false)
      },
    )
    return () => {
      active = false
    }
  }, [exerciseRepository, muscleRepository])

  return { exercises, muscleIndex, loading }
}
