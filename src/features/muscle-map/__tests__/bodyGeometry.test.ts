import { describe, it, expect } from 'vitest'
import { MuscleId } from '../../../domain/enums/MuscleId'
import { MUSCLE_REGIONS } from '../geometry/bodyGeometry'
import { mirrorShape } from '../geometry/shapes'

describe('muscle map geometry', () => {
  it('draws a region for every muscle in the taxonomy', () => {
    const drawn = new Set(MUSCLE_REGIONS.map((region) => region.muscleId))
    const missing = Object.values(MuscleId).filter((id) => !drawn.has(id))
    expect(missing).toEqual([])
  })

  it('mirrors an ellipse across the axis', () => {
    const mirrored = mirrorShape({ kind: 'ellipse', cx: 80, cy: 100, rx: 10, ry: 20 }, 110)
    expect(mirrored).toEqual({ kind: 'ellipse', cx: 140, cy: 100, rx: 10, ry: 20 })
  })

  it('mirrors a rect by its far edge', () => {
    const mirrored = mirrorShape({ kind: 'rect', x: 48, y: 66, w: 22, h: 78, r: 11 }, 110)
    expect(mirrored).toEqual({ kind: 'rect', x: 150, y: 66, w: 22, h: 78, r: 11 })
  })
})
