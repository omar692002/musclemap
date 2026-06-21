import { MuscleId } from '../../../domain/enums/MuscleId'
import { MuscleHeadId } from '../../../domain/enums/MuscleHeadId'

/** A trainable head/region of a parent muscle. */
export interface MuscleHead {
  readonly id: MuscleHeadId
  readonly parent: MuscleId
  readonly name: string
}

/** The authored head taxonomy: only muscles with distinct heads appear here. */
export const MUSCLE_HEADS: readonly MuscleHead[] = [
  { id: MuscleHeadId.DeltoidAnterior, parent: MuscleId.Deltoid, name: 'Anterior deltoid' },
  { id: MuscleHeadId.DeltoidLateral, parent: MuscleId.Deltoid, name: 'Lateral deltoid' },
  { id: MuscleHeadId.DeltoidPosterior, parent: MuscleId.Deltoid, name: 'Posterior deltoid' },
  { id: MuscleHeadId.PecUpper, parent: MuscleId.PectoralisMajor, name: 'Upper chest' },
  { id: MuscleHeadId.PecMid, parent: MuscleId.PectoralisMajor, name: 'Mid chest' },
  { id: MuscleHeadId.PecLower, parent: MuscleId.PectoralisMajor, name: 'Lower chest' },
  { id: MuscleHeadId.TricepsLong, parent: MuscleId.TricepsBrachii, name: 'Triceps long head' },
  { id: MuscleHeadId.TricepsLateral, parent: MuscleId.TricepsBrachii, name: 'Triceps lateral head' },
  { id: MuscleHeadId.TricepsMedial, parent: MuscleId.TricepsBrachii, name: 'Triceps medial head' },
  { id: MuscleHeadId.BicepsLong, parent: MuscleId.BicepsBrachii, name: 'Biceps long head' },
  { id: MuscleHeadId.BicepsShort, parent: MuscleId.BicepsBrachii, name: 'Biceps short head' },
  { id: MuscleHeadId.TrapsUpper, parent: MuscleId.Trapezius, name: 'Upper trapezius' },
  { id: MuscleHeadId.TrapsMid, parent: MuscleId.Trapezius, name: 'Middle trapezius' },
  { id: MuscleHeadId.TrapsLower, parent: MuscleId.Trapezius, name: 'Lower trapezius' },
  { id: MuscleHeadId.CalfGastrocnemius, parent: MuscleId.Calves, name: 'Gastrocnemius' },
  { id: MuscleHeadId.CalfSoleus, parent: MuscleId.Calves, name: 'Soleus' },
  { id: MuscleHeadId.QuadRectusFemoris, parent: MuscleId.Quadriceps, name: 'Rectus femoris' },
  { id: MuscleHeadId.QuadVastusLateralis, parent: MuscleId.Quadriceps, name: 'Vastus lateralis' },
  { id: MuscleHeadId.QuadVastusMedialis, parent: MuscleId.Quadriceps, name: 'Vastus medialis' },
  { id: MuscleHeadId.QuadVastusIntermedius, parent: MuscleId.Quadriceps, name: 'Vastus intermedius' },
  { id: MuscleHeadId.HamBicepsFemoris, parent: MuscleId.Hamstrings, name: 'Biceps femoris' },
  { id: MuscleHeadId.HamSemitendinosus, parent: MuscleId.Hamstrings, name: 'Semitendinosus' },
  { id: MuscleHeadId.HamSemimembranosus, parent: MuscleId.Hamstrings, name: 'Semimembranosus' },
]

export const MUSCLE_HEAD_BY_ID: ReadonlyMap<MuscleHeadId, MuscleHead> = new Map(
  MUSCLE_HEADS.map((head) => [head.id, head]),
)

/** Heads grouped by their parent muscle — also tells us which muscles are headed. */
export const HEADS_BY_MUSCLE: ReadonlyMap<MuscleId, readonly MuscleHeadId[]> = (() => {
  const map = new Map<MuscleId, MuscleHeadId[]>()
  for (const head of MUSCLE_HEADS) {
    const list = map.get(head.parent) ?? []
    list.push(head.id)
    map.set(head.parent, list)
  }
  return map
})()

/** True when a muscle has authored heads (so it should be split in the 3D map). */
export function isHeadedMuscle(muscleId: MuscleId): boolean {
  return HEADS_BY_MUSCLE.has(muscleId)
}
