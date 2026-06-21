import { MuscleId } from '../../../domain/enums/MuscleId'
import { MuscleHeadId } from '../../../domain/enums/MuscleHeadId'

/**
 * 3D geometry for the rotating muscle model. A stylised mannequin built from
 * typed primitives (sphere / capsule / box) positioned in a Y-up space
 * (X = left/right, +Z = front).
 *
 * This is the *procedural* body shown instantly while the realistic anatomy
 * model loads (and as the fallback if it fails). Front/back muscles live at
 * different Z so they stay distinguishable as you rotate. Muscles with distinct
 * heads (e.g. pectoralis: upper / mid / lower) are modelled as separate
 * segments carrying a `headId`, so the same head regions the realistic model
 * exposes are clickable here too.
 */
export type Vec3 = readonly [number, number, number]

export type Body3DShape =
  | { readonly kind: 'sphere'; readonly position: Vec3; readonly radius: number; readonly scale?: Vec3 }
  | { readonly kind: 'capsule'; readonly position: Vec3; readonly radius: number; readonly length: number; readonly rotation?: Vec3 }
  | { readonly kind: 'box'; readonly position: Vec3; readonly size: Vec3; readonly rotation?: Vec3 }

export interface MuscleSegment3D {
  readonly muscleId: MuscleId
  /** Finer head when this segment is one subdivision of `muscleId` (else absent). */
  readonly headId?: MuscleHeadId
  readonly shapes: readonly Body3DShape[]
}

/** Reflects a shape across the X = 0 plane (the body's centre line). */
function mirror(shape: Body3DShape): Body3DShape {
  const [x, y, z] = shape.position
  const position: Vec3 = [-x, y, z]
  if (shape.kind === 'sphere') return { ...shape, position }
  const rotation = shape.rotation
  return { ...shape, position, rotation: rotation ? [rotation[0], -rotation[1], -rotation[2]] : undefined }
}

/** A shape and its mirror — for the left/right paired muscles and limbs. */
function pair(shape: Body3DShape): Body3DShape[] {
  return [shape, mirror(shape)]
}

function segment(muscleId: MuscleId, shapes: readonly Body3DShape[]): MuscleSegment3D {
  return { muscleId, shapes }
}

/** A segment that is one named *head* of its parent muscle (separately clickable). */
function headSegment(muscleId: MuscleId, headId: MuscleHeadId, shapes: readonly Body3DShape[]): MuscleSegment3D {
  return { muscleId, headId, shapes }
}

/** Neutral mannequin drawn behind the muscles (head, torso, limbs, hands, feet). */
export const BODY_3D: readonly Body3DShape[] = [
  // Head: a softly ovoid skull (taller than wide) + a tapered jaw, so it reads
  // as a head rather than a bare ball. Sat on a short neck.
  { kind: 'sphere', position: [0, 1.5, 0], radius: 0.2, scale: [0.92, 1.06, 0.96] }, // cranium
  { kind: 'sphere', position: [0, 1.4, 0.05], radius: 0.15, scale: [0.82, 0.7, 0.85] }, // jaw / face
  ...pair({ kind: 'sphere', position: [0.18, 1.5, 0], radius: 0.04 }), // ears
  { kind: 'capsule', position: [0, 1.22, 0], radius: 0.085, length: 0.12 }, // neck
  { kind: 'box', position: [0, 0.8, 0], size: [0.6, 0.82, 0.34] }, // torso
  { kind: 'box', position: [0, 0.26, 0], size: [0.54, 0.34, 0.3] }, // pelvis
  ...pair({ kind: 'capsule', position: [0.62, 0.78, 0], radius: 0.1, length: 0.34 }), // upper arms
  ...pair({ kind: 'capsule', position: [0.66, 0.37, 0], radius: 0.085, length: 0.34 }), // forearms
  ...pair({ kind: 'sphere', position: [0.68, 0.14, 0], radius: 0.09 }), // hands
  ...pair({ kind: 'capsule', position: [0.22, -0.34, 0], radius: 0.155, length: 0.54 }), // thighs
  ...pair({ kind: 'capsule', position: [0.2, -1.04, 0], radius: 0.115, length: 0.48 }), // shins
  // Feet: an ankle + a forward-pointing arch + a rounded toe cap + a heel, so
  // they look like feet (pointing +Z) instead of flat slabs.
  ...pair({ kind: 'sphere', position: [0.2, -1.5, 0], radius: 0.085 }), // ankles
  ...pair({ kind: 'box', position: [0.2, -1.62, 0.08], size: [0.15, 0.08, 0.3] }), // foot arch
  ...pair({ kind: 'sphere', position: [0.2, -1.63, 0.24], radius: 0.07, scale: [1, 0.7, 1] }), // toes
  ...pair({ kind: 'sphere', position: [0.2, -1.58, -0.06], radius: 0.06 }), // heels
]

const FRONT: readonly MuscleSegment3D[] = [
  segment(MuscleId.Deltoid, pair({ kind: 'sphere', position: [0.46, 1.02, 0], radius: 0.16 })),
  // Pectoralis split into its three heads (upper / mid / lower), stacked on the
  // chest front — the same heads the realistic model exposes.
  headSegment(MuscleId.PectoralisMajor, MuscleHeadId.PecUpper, pair({ kind: 'sphere', position: [0.15, 1.09, 0.18], radius: 0.115, scale: [1.05, 0.7, 0.55] })),
  headSegment(MuscleId.PectoralisMajor, MuscleHeadId.PecMid, pair({ kind: 'sphere', position: [0.16, 0.97, 0.19], radius: 0.13, scale: [1.05, 0.7, 0.6] })),
  headSegment(MuscleId.PectoralisMajor, MuscleHeadId.PecLower, pair({ kind: 'sphere', position: [0.15, 0.86, 0.18], radius: 0.12, scale: [1.05, 0.6, 0.55] })),
  segment(MuscleId.BicepsBrachii, pair({ kind: 'capsule', position: [0.62, 0.74, 0.1], radius: 0.08, length: 0.26 })),
  segment(MuscleId.Forearms, pair({ kind: 'capsule', position: [0.66, 0.36, 0.07], radius: 0.075, length: 0.3 })),
  // Abdominals modelled as a visible six-pack (three rows of paired bricks) plus
  // the flanking obliques — all one region (no separately-trained ab data yet).
  segment(MuscleId.RectusAbdominis, [
    ...pair({ kind: 'box', position: [0.07, 0.71, 0.19], size: [0.12, 0.11, 0.07] }), // upper row
    ...pair({ kind: 'box', position: [0.07, 0.57, 0.19], size: [0.12, 0.11, 0.07] }), // mid row
    ...pair({ kind: 'box', position: [0.07, 0.43, 0.19], size: [0.12, 0.12, 0.07] }), // lower row
    ...pair({ kind: 'box', position: [0.2, 0.56, 0.14], size: [0.08, 0.34, 0.1], rotation: [0, 0, 0.12] }), // obliques
  ]),
  segment(MuscleId.HipAbductors, pair({ kind: 'sphere', position: [0.36, 0.16, 0.05], radius: 0.11 })),
  segment(MuscleId.HipAdductors, pair({ kind: 'capsule', position: [0.12, -0.2, 0.06], radius: 0.075, length: 0.28 })),
  segment(MuscleId.Quadriceps, pair({ kind: 'capsule', position: [0.22, -0.32, 0.14], radius: 0.13, length: 0.46 })),
  segment(MuscleId.Neck, [{ kind: 'capsule', position: [0, 1.22, 0.04], radius: 0.085, length: 0.12 }]),
]

const BACK: readonly MuscleSegment3D[] = [
  segment(MuscleId.Trapezius, [{ kind: 'box', position: [0, 1.0, -0.16], size: [0.5, 0.42, 0.08] }]),
  segment(MuscleId.Rhomboids, [{ kind: 'box', position: [0, 0.8, -0.19], size: [0.32, 0.22, 0.06] }]),
  segment(MuscleId.LatissimusDorsi, pair({ kind: 'box', position: [0.2, 0.68, -0.17], size: [0.22, 0.42, 0.08] })),
  segment(MuscleId.ErectorSpinae, [{ kind: 'box', position: [0, 0.52, -0.19], size: [0.14, 0.5, 0.06] }]),
  segment(MuscleId.TricepsBrachii, pair({ kind: 'capsule', position: [0.62, 0.74, -0.1], radius: 0.08, length: 0.26 })),
  segment(MuscleId.Gluteus, pair({ kind: 'sphere', position: [0.18, 0.08, -0.16], radius: 0.17, scale: [1, 0.9, 0.8] })),
  segment(MuscleId.Hamstrings, pair({ kind: 'capsule', position: [0.22, -0.4, -0.13], radius: 0.12, length: 0.44 })),
  segment(MuscleId.Calves, pair({ kind: 'capsule', position: [0.2, -1.02, -0.1], radius: 0.1, length: 0.38 })),
]

export const MUSCLES_3D: readonly MuscleSegment3D[] = [...FRONT, ...BACK]
