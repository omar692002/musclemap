import { describe, it, expect } from 'vitest'
import { MuscleHeadId } from '../../../domain/enums/MuscleHeadId'
import { headForChain } from '../three/anatomyHeadMap'

// One representative model part name per head (as the GLB names them).
const CASES: ReadonlyArray<readonly [string, MuscleHeadId]> = [
  ['Clavicular part of deltoid muscle.l', MuscleHeadId.DeltoidAnterior],
  ['Acromial part of deltoid muscle.l', MuscleHeadId.DeltoidLateral],
  ['Scapular spinal part of deltoid muscle.l', MuscleHeadId.DeltoidPosterior],
  ['Clavicular head of pectoralis major muscle.l', MuscleHeadId.PecUpper],
  ['Sternocostal head of pectoralis major muscle.l', MuscleHeadId.PecMid],
  ['(Abdominal part of pectoralis major muscle).l', MuscleHeadId.PecLower],
  ['Long head of triceps brachii.l', MuscleHeadId.TricepsLong],
  ['Lateral head of triceps brachii.l', MuscleHeadId.TricepsLateral],
  ['Medial head of triceps brachii.l', MuscleHeadId.TricepsMedial],
  ['Long head of biceps brachii.l', MuscleHeadId.BicepsLong],
  ['Short head of biceps brachii.l', MuscleHeadId.BicepsShort],
  ['Descending part of trapezius muscle.l', MuscleHeadId.TrapsUpper],
  ['Transverse part of trapezius muscle.l', MuscleHeadId.TrapsMid],
  ['Ascending part of trapezius muscle.l', MuscleHeadId.TrapsLower],
  ['Lateral head of gastrocnemius.l', MuscleHeadId.CalfGastrocnemius],
  ['Soleus muscle.l', MuscleHeadId.CalfSoleus],
  ['Rectus femoris muscle.l', MuscleHeadId.QuadRectusFemoris],
  ['Vastus lateralis muscle.l', MuscleHeadId.QuadVastusLateralis],
  ['Vastus medialis muscle.l', MuscleHeadId.QuadVastusMedialis],
  ['Vastus intermedius muscle.l', MuscleHeadId.QuadVastusIntermedius],
  ['Long head of biceps femoris.l', MuscleHeadId.HamBicepsFemoris],
  ['Semitendinosus muscle.l', MuscleHeadId.HamSemitendinosus],
  ['Semimembranosus muscle.l', MuscleHeadId.HamSemimembranosus],
]

describe('anatomy mesh → head mapping', () => {
  it.each(CASES)('maps "%s"', (chain, expected) => {
    expect(headForChain(chain)).toBe(expected)
  })

  it('covers every head in the taxonomy', () => {
    const produced = new Set(CASES.map(([, head]) => head))
    const missing = Object.values(MuscleHeadId).filter((id) => !produced.has(id))
    expect(missing).toEqual([])
  })

  it('returns null for non-head parts', () => {
    expect(headForChain('Latissimus dorsi muscle.l')).toBeNull()
    expect(headForChain('Brachial fascia.l')).toBeNull()
  })
})
