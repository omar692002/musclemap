import { MuscleId } from '../../../domain/enums/MuscleId'

/**
 * 3D geometry for the rotating muscle model — the spatial cousin of the 2D
 * `bodyGeometry`. A stylised mannequin built from typed primitives (sphere /
 * capsule / box) positioned in a Y-up space (X = left/right, +Z = front).
 *
 * This is a *prototype* body: front/back muscles live at different Z so they're
 * distinguishable as you rotate. A realistic segmented anatomy mesh (GLTF) is a
 * later asset swap behind the same `Body3DScene` contract — see PROGRESS.md.
 */
export type Vec3 = readonly [number, number, number]

export type Body3DShape =
  | { readonly kind: 'sphere'; readonly position: Vec3; readonly radius: number; readonly scale?: Vec3 }
  | { readonly kind: 'capsule'; readonly position: Vec3; readonly radius: number; readonly length: number; readonly rotation?: Vec3 }
  | { readonly kind: 'box'; readonly position: Vec3; readonly size: Vec3; readonly rotation?: Vec3 }

export interface MuscleSegment3D {
  readonly muscleId: MuscleId
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

/** Neutral mannequin drawn behind the muscles (head, torso, limbs, hands, feet). */
export const BODY_3D: readonly Body3DShape[] = [
  { kind: 'sphere', position: [0, 1.45, 0], radius: 0.22 }, // head
  { kind: 'capsule', position: [0, 1.2, 0], radius: 0.09, length: 0.1 }, // neck
  { kind: 'box', position: [0, 0.8, 0], size: [0.6, 0.82, 0.34] }, // torso
  { kind: 'box', position: [0, 0.26, 0], size: [0.54, 0.34, 0.3] }, // pelvis
  ...pair({ kind: 'capsule', position: [0.62, 0.78, 0], radius: 0.1, length: 0.34 }), // upper arms
  ...pair({ kind: 'capsule', position: [0.66, 0.37, 0], radius: 0.085, length: 0.34 }), // forearms
  ...pair({ kind: 'sphere', position: [0.68, 0.14, 0], radius: 0.09 }), // hands
  ...pair({ kind: 'capsule', position: [0.22, -0.34, 0], radius: 0.155, length: 0.54 }), // thighs
  ...pair({ kind: 'capsule', position: [0.2, -1.04, 0], radius: 0.115, length: 0.48 }), // shins
  ...pair({ kind: 'box', position: [0.2, -1.6, 0.08], size: [0.16, 0.12, 0.32] }), // feet
]

const FRONT: readonly MuscleSegment3D[] = [
  segment(MuscleId.Deltoid, pair({ kind: 'sphere', position: [0.46, 1.02, 0], radius: 0.16 })),
  segment(MuscleId.PectoralisMajor, pair({ kind: 'sphere', position: [0.17, 0.95, 0.2], radius: 0.16, scale: [1, 1, 0.6] })),
  segment(MuscleId.BicepsBrachii, pair({ kind: 'capsule', position: [0.62, 0.74, 0.1], radius: 0.08, length: 0.26 })),
  segment(MuscleId.Forearms, pair({ kind: 'capsule', position: [0.66, 0.36, 0.07], radius: 0.075, length: 0.3 })),
  segment(MuscleId.RectusAbdominis, [{ kind: 'box', position: [0, 0.58, 0.19], size: [0.3, 0.42, 0.08] }]),
  segment(MuscleId.HipAbductors, pair({ kind: 'sphere', position: [0.36, 0.16, 0.05], radius: 0.11 })),
  segment(MuscleId.HipAdductors, pair({ kind: 'capsule', position: [0.12, -0.2, 0.06], radius: 0.075, length: 0.28 })),
  segment(MuscleId.Quadriceps, pair({ kind: 'capsule', position: [0.22, -0.32, 0.14], radius: 0.13, length: 0.46 })),
  segment(MuscleId.Neck, [{ kind: 'capsule', position: [0, 1.2, 0.04], radius: 0.085, length: 0.12 }]),
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
