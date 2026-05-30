import { useMemo, useState } from 'react'
import type { Exercise } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import type { Equipment } from '../../domain/enums/Equipment'

export interface ExerciseFiltersState {
  readonly search: string
  readonly group: MuscleGroup | null
  readonly equipment: Equipment | null
  readonly results: readonly Exercise[]
  setSearch(value: string): void
  setGroup(value: MuscleGroup | null): void
  setEquipment(value: Equipment | null): void
}

/**
 * Holds the browser's filter state and derives the matching exercises:
 * name search (case-insensitive), muscle-group (via the muscle index), and
 * equipment. Pure/derived via useMemo so filtering is recomputed only when
 * inputs change.
 */
export function useExerciseFilters(
  exercises: readonly Exercise[],
  muscleIndex: ReadonlyMap<string, Muscle>,
): ExerciseFiltersState {
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState<MuscleGroup | null>(null)
  const [equipment, setEquipment] = useState<Equipment | null>(null)

  const results = useMemo(() => {
    const term = search.trim().toLowerCase()
    return exercises.filter((exercise) => {
      if (term && !exercise.name.toLowerCase().includes(term)) return false
      if (equipment && exercise.equipment !== equipment) return false
      if (
        group &&
        !exercise.muscles.some((involvement) => muscleIndex.get(involvement.muscleId)?.group === group)
      ) {
        return false
      }
      return true
    })
  }, [exercises, muscleIndex, search, group, equipment])

  return { search, group, equipment, results, setSearch, setGroup, setEquipment }
}
