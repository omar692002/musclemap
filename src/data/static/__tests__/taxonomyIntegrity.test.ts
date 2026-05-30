import { describe, it, expect } from 'vitest'
import { MUSCLES } from '../taxonomy/muscles'
import { SOURCE_MUSCLE_TO_ID } from '../mapping/sourceMuscleMap'
import { MuscleGroup } from '../../../domain/enums/MuscleGroup'

describe('muscle taxonomy integrity', () => {
  const muscleIds = new Set(MUSCLES.map((muscle) => muscle.id))
  const validGroups = new Set<string>(Object.values(MuscleGroup))

  it('every source muscle maps to a real taxonomy muscle', () => {
    for (const id of Object.values(SOURCE_MUSCLE_TO_ID)) {
      expect(muscleIds.has(id)).toBe(true)
    }
  })

  it('muscle ids are unique', () => {
    expect(muscleIds.size).toBe(MUSCLES.length)
  })

  it('every muscle belongs to a valid group', () => {
    for (const muscle of MUSCLES) {
      expect(validGroups.has(muscle.group)).toBe(true)
    }
  })
})
