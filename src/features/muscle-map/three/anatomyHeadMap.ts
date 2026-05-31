import { MuscleHeadId } from '../../../domain/enums/MuscleHeadId'

/**
 * Maps the anatomy model's named parts to muscle *heads*. The model already
 * separates heads (e.g. "Clavicular part of deltoid muscle", "Long head of
 * triceps brachii"), so these keyword rules pick them out of the ancestor
 * chain. Matched the same way as `anatomyMuscleMap` (separators normalised),
 * but resolves the finer head id. Returns null when no head applies (the mesh
 * then falls back to whole-muscle resolution).
 */
interface HeadRule {
  readonly keyword: string
  readonly headId: MuscleHeadId
}

const HEAD_RULES: readonly HeadRule[] = [
  // Deltoid: clavicular = front, acromial = side, scapular spinal = rear
  { keyword: 'clavicular part of deltoid', headId: MuscleHeadId.DeltoidAnterior },
  { keyword: 'acromial part of deltoid', headId: MuscleHeadId.DeltoidLateral },
  { keyword: 'spinal part of deltoid', headId: MuscleHeadId.DeltoidPosterior },
  // Pectoralis major
  { keyword: 'clavicular head of pectoralis', headId: MuscleHeadId.PecUpper },
  { keyword: 'sternocostal head of pectoralis', headId: MuscleHeadId.PecMid },
  { keyword: 'abdominal part of pectoralis', headId: MuscleHeadId.PecLower },
  { keyword: 'pectoralis minor', headId: MuscleHeadId.PecMid },
  // Triceps brachii
  { keyword: 'long head of triceps', headId: MuscleHeadId.TricepsLong },
  { keyword: 'lateral head of triceps', headId: MuscleHeadId.TricepsLateral },
  { keyword: 'medial head of triceps', headId: MuscleHeadId.TricepsMedial },
  // Biceps brachii
  { keyword: 'long head of biceps brachii', headId: MuscleHeadId.BicepsLong },
  { keyword: 'short head of biceps brachii', headId: MuscleHeadId.BicepsShort },
  // Trapezius
  { keyword: 'descending part of trapezius', headId: MuscleHeadId.TrapsUpper },
  { keyword: 'transverse part of trapezius', headId: MuscleHeadId.TrapsMid },
  { keyword: 'ascending part of trapezius', headId: MuscleHeadId.TrapsLower },
  // Calves
  { keyword: 'gastrocnemius', headId: MuscleHeadId.CalfGastrocnemius },
  { keyword: 'soleus', headId: MuscleHeadId.CalfSoleus },
  // Quadriceps
  { keyword: 'rectus femoris', headId: MuscleHeadId.QuadRectusFemoris },
  { keyword: 'vastus lateralis', headId: MuscleHeadId.QuadVastusLateralis },
  { keyword: 'vastus medialis', headId: MuscleHeadId.QuadVastusMedialis },
  { keyword: 'vastus intermedius', headId: MuscleHeadId.QuadVastusIntermedius },
  // Hamstrings
  { keyword: 'biceps femoris', headId: MuscleHeadId.HamBicepsFemoris },
  { keyword: 'semitendinosus', headId: MuscleHeadId.HamSemitendinosus },
  { keyword: 'semimembranosus', headId: MuscleHeadId.HamSemimembranosus },
]

/** Resolves a mesh's ancestor-chain to a muscle head id (or null). */
export function headForChain(chain: string): MuscleHeadId | null {
  const normalized = chain.toLowerCase().replace(/[_.\-/]+/g, ' ')
  for (const rule of HEAD_RULES) {
    if (normalized.includes(rule.keyword)) return rule.headId
  }
  return null
}
