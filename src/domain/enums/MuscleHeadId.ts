/**
 * Stable ids for the individual *heads* of the muscles that have meaningful,
 * separately-trainable subdivisions. Muscles without heads keep using their
 * `MuscleId` directly. Heads are the finer granularity the 3D model exposes.
 */
export enum MuscleHeadId {
  // Deltoid
  DeltoidAnterior = 'deltoid-anterior',
  DeltoidLateral = 'deltoid-lateral',
  DeltoidPosterior = 'deltoid-posterior',
  // Pectoralis major
  PecUpper = 'pec-upper',
  PecMid = 'pec-mid',
  PecLower = 'pec-lower',
  // Triceps brachii
  TricepsLong = 'triceps-long',
  TricepsLateral = 'triceps-lateral',
  TricepsMedial = 'triceps-medial',
  // Biceps brachii
  BicepsLong = 'biceps-long',
  BicepsShort = 'biceps-short',
  // Trapezius
  TrapsUpper = 'traps-upper',
  TrapsMid = 'traps-mid',
  TrapsLower = 'traps-lower',
  // Calves
  CalfGastrocnemius = 'calf-gastrocnemius',
  CalfSoleus = 'calf-soleus',
  // Quadriceps
  QuadRectusFemoris = 'quad-rectus-femoris',
  QuadVastusLateralis = 'quad-vastus-lateralis',
  QuadVastusMedialis = 'quad-vastus-medialis',
  QuadVastusIntermedius = 'quad-vastus-intermedius',
  // Hamstrings
  HamBicepsFemoris = 'ham-biceps-femoris',
  HamSemitendinosus = 'ham-semitendinosus',
  HamSemimembranosus = 'ham-semimembranosus',
}
