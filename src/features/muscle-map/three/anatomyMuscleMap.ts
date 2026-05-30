import { MuscleId } from '../../../domain/enums/MuscleId'

/**
 * Maps the anatomy model's named meshes onto our 17-muscle taxonomy.
 *
 * The model (BodyParts3D / Z-Anatomy) is far more granular than our taxonomy
 * and groups muscles under compartment nodes (e.g. "Anterior compartment of
 * forearm.g"). We match against each mesh's *ancestor chain* (its own name plus
 * all parent group names, lower-cased and joined), so a single compartment rule
 * captures every muscle inside it. Rules are ordered — the first hit wins — so
 * specific names (e.g. "biceps femoris") must precede broader ones.
 *
 * Unmatched meshes (fasciae, deep stabilisers, hand/foot intrinsics) stay
 * neutral. This table is the curation seam: refine it as the map is reviewed.
 */
interface MeshRule {
  /** Lower-case substring tested against the mesh's ancestor chain. */
  readonly keyword: string
  readonly muscleId: MuscleId
}

export const ANATOMY_RULES: readonly MeshRule[] = [
  // Posterior thigh — before any generic "biceps"
  { keyword: 'biceps femoris', muscleId: MuscleId.Hamstrings },
  { keyword: 'semitendinosus', muscleId: MuscleId.Hamstrings },
  { keyword: 'semimembranosus', muscleId: MuscleId.Hamstrings },
  { keyword: 'posterior compartment of thigh', muscleId: MuscleId.Hamstrings },
  // Glutes split: maximus = glutes, medius/minimus + TFL = abductors
  { keyword: 'gluteus maximus', muscleId: MuscleId.Gluteus },
  { keyword: 'gluteus medius', muscleId: MuscleId.HipAbductors },
  { keyword: 'gluteus minimus', muscleId: MuscleId.HipAbductors },
  { keyword: 'tensor fasciae', muscleId: MuscleId.HipAbductors },
  // Medial thigh = adductors (incl. gracilis, pectineus)
  { keyword: 'medial compartment of thigh', muscleId: MuscleId.HipAdductors },
  { keyword: 'adductor brevis', muscleId: MuscleId.HipAdductors },
  { keyword: 'adductor longus', muscleId: MuscleId.HipAdductors },
  { keyword: 'adductor magnus', muscleId: MuscleId.HipAdductors },
  { keyword: 'adductor minimus', muscleId: MuscleId.HipAdductors },
  { keyword: 'gracilis', muscleId: MuscleId.HipAdductors },
  { keyword: 'pectineus', muscleId: MuscleId.HipAdductors },
  // Anterior thigh = quadriceps (+ sartorius, anterior thigh)
  { keyword: 'anterior compartment of thigh', muscleId: MuscleId.Quadriceps },
  { keyword: 'vastus', muscleId: MuscleId.Quadriceps },
  { keyword: 'rectus femoris', muscleId: MuscleId.Quadriceps },
  { keyword: 'sartorius', muscleId: MuscleId.Quadriceps },
  // Posterior leg = calves
  { keyword: 'posterior compartment of leg', muscleId: MuscleId.Calves },
  { keyword: 'gastrocnemius', muscleId: MuscleId.Calves },
  { keyword: 'soleus', muscleId: MuscleId.Calves },
  // Abdomen / core
  { keyword: 'rectus abdominis', muscleId: MuscleId.RectusAbdominis },
  { keyword: 'abdominal oblique', muscleId: MuscleId.RectusAbdominis },
  { keyword: 'transversus abdominis', muscleId: MuscleId.RectusAbdominis },
  { keyword: 'muscles of abdomen', muscleId: MuscleId.RectusAbdominis },
  // Chest
  { keyword: 'pectoralis', muscleId: MuscleId.PectoralisMajor },
  // Back
  { keyword: 'latissimus', muscleId: MuscleId.LatissimusDorsi },
  { keyword: 'teres major', muscleId: MuscleId.LatissimusDorsi },
  { keyword: 'trapezius', muscleId: MuscleId.Trapezius },
  { keyword: 'rhomboid', muscleId: MuscleId.Rhomboids },
  { keyword: 'erector spinae', muscleId: MuscleId.ErectorSpinae },
  { keyword: 'iliocostalis', muscleId: MuscleId.ErectorSpinae },
  { keyword: 'longissimus', muscleId: MuscleId.ErectorSpinae },
  { keyword: 'spinalis', muscleId: MuscleId.ErectorSpinae },
  { keyword: 'multifidus', muscleId: MuscleId.ErectorSpinae },
  // Upper arm
  { keyword: 'anterior compartment of arm', muscleId: MuscleId.BicepsBrachii },
  { keyword: 'biceps brachii', muscleId: MuscleId.BicepsBrachii },
  { keyword: 'brachialis', muscleId: MuscleId.BicepsBrachii },
  { keyword: 'coracobrachialis', muscleId: MuscleId.BicepsBrachii },
  { keyword: 'posterior compartment of arm', muscleId: MuscleId.TricepsBrachii },
  { keyword: 'triceps brachii', muscleId: MuscleId.TricepsBrachii },
  { keyword: 'anconeus', muscleId: MuscleId.TricepsBrachii },
  // Forearm (every muscle lives under a forearm compartment group)
  { keyword: 'compartment of forearm', muscleId: MuscleId.Forearms },
  { keyword: 'brachioradialis', muscleId: MuscleId.Forearms },
  { keyword: 'pronator', muscleId: MuscleId.Forearms },
  { keyword: 'supinator', muscleId: MuscleId.Forearms },
  // Shoulder
  { keyword: 'deltoid', muscleId: MuscleId.Deltoid },
  { keyword: 'rotator cuff', muscleId: MuscleId.Deltoid },
  { keyword: 'supraspinatus', muscleId: MuscleId.Deltoid },
  { keyword: 'infraspinatus', muscleId: MuscleId.Deltoid },
  { keyword: 'teres minor', muscleId: MuscleId.Deltoid },
  { keyword: 'subscapularis', muscleId: MuscleId.Deltoid },
  // Neck
  { keyword: 'sternocleidomastoid', muscleId: MuscleId.Neck },
  { keyword: 'scalene', muscleId: MuscleId.Neck },
  { keyword: 'splenius', muscleId: MuscleId.Neck },
  { keyword: 'muscles of neck', muscleId: MuscleId.Neck },
]

/** Resolves a mesh's ancestor-chain string to a muscle id (or null if none). */
export function muscleForChain(chainLower: string): MuscleId | null {
  for (const rule of ANATOMY_RULES) {
    if (chainLower.includes(rule.keyword)) return rule.muscleId
  }
  return null
}
