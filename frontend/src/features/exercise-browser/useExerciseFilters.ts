import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Exercise } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'
import { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { Equipment } from '../../domain/enums/Equipment'
import { BrowserParam } from '../../config/routes'
import { exerciseInvolvesHead } from '../muscle-map/headAttribution'

export interface ExerciseFiltersState {
  readonly search: string
  readonly group: MuscleGroup | null
  readonly equipment: Equipment | null
  /** A single muscle id (set by the muscle map); null when not filtering by muscle. */
  readonly muscle: string | null
  /** A single muscle head id (set by the 3D map); null when not filtering by head. */
  readonly head: string | null
  readonly results: readonly Exercise[]
  setSearch(value: string): void
  setGroup(value: MuscleGroup | null): void
  setEquipment(value: Equipment | null): void
  setMuscle(value: string | null): void
  setHead(value: string | null): void
}

/** Reads a raw query value back into an enum member, or null if absent/invalid. */
function readEnum<T extends Record<string, string>>(values: T, raw: string | null): T[keyof T] | null {
  if (!raw) return null
  return (Object.values(values) as string[]).includes(raw) ? (raw as T[keyof T]) : null
}

/**
 * Holds the browser's filter state in the URL query string (so it survives
 * back-navigation and is shareable) and derives the matching exercises: name
 * search (case-insensitive), muscle-group (via the muscle index), and
 * equipment. Filtering is memoised against the resolved inputs.
 */
export function useExerciseFilters(
  exercises: readonly Exercise[],
  muscleIndex: ReadonlyMap<string, Muscle>,
): ExerciseFiltersState {
  const [params, setParams] = useSearchParams()

  const search = params.get(BrowserParam.search) ?? ''
  const group = readEnum(MuscleGroup, params.get(BrowserParam.group))
  const equipment = readEnum(Equipment, params.get(BrowserParam.equipment))
  const muscle = params.get(BrowserParam.muscle)
  const head = params.get(BrowserParam.head)

  // `replace` so typing/filtering doesn't pile up history entries; empty
  // values are dropped to keep the URL clean.
  const setParam = useCallback(
    (key: string, value: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const setSearch = useCallback(
    (value: string) => setParam(BrowserParam.search, value.trim() ? value : null),
    [setParam],
  )
  const setGroup = useCallback(
    (value: MuscleGroup | null) => setParam(BrowserParam.group, value),
    [setParam],
  )
  const setEquipment = useCallback(
    (value: Equipment | null) => setParam(BrowserParam.equipment, value),
    [setParam],
  )
  const setMuscle = useCallback(
    (value: string | null) => setParam(BrowserParam.muscle, value),
    [setParam],
  )
  const setHead = useCallback(
    (value: string | null) => setParam(BrowserParam.head, value),
    [setParam],
  )

  const results = useMemo(() => {
    const term = search.trim().toLowerCase()
    return exercises.filter((exercise) => {
      if (term && !exercise.name.toLowerCase().includes(term)) return false
      if (equipment && exercise.equipment !== equipment) return false
      if (head && !exerciseInvolvesHead(exercise, head)) return false
      if (muscle && !exercise.muscles.some((involvement) => involvement.muscleId === muscle)) {
        return false
      }
      if (
        group &&
        !exercise.muscles.some((involvement) => muscleIndex.get(involvement.muscleId)?.group === group)
      ) {
        return false
      }
      return true
    })
  }, [exercises, muscleIndex, search, group, equipment, muscle, head])

  return {
    search,
    group,
    equipment,
    muscle,
    head,
    results,
    setSearch,
    setGroup,
    setEquipment,
    setMuscle,
    setHead,
  }
}
