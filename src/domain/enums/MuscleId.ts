/**
 * Stable identifiers for individual muscles in our taxonomy.
 * Used everywhere a muscle is referenced (involvements, mappings, the catalog)
 * so muscle ids are never hardcoded as loose strings.
 *
 * Granularity is muscle-level in M1. Head-level entries (e.g. the three
 * deltoid heads) are reserved for a later curation pass — see DATA_MODEL.md.
 */
export enum MuscleId {
  PectoralisMajor = 'pectoralis-major',
  LatissimusDorsi = 'latissimus-dorsi',
  Trapezius = 'trapezius',
  Rhomboids = 'rhomboids',
  ErectorSpinae = 'erector-spinae',
  Deltoid = 'deltoid',
  BicepsBrachii = 'biceps-brachii',
  TricepsBrachii = 'triceps-brachii',
  Forearms = 'forearms',
  RectusAbdominis = 'rectus-abdominis',
  Quadriceps = 'quadriceps',
  Hamstrings = 'hamstrings',
  Gluteus = 'gluteus',
  Calves = 'calves',
  Neck = 'neck',
  HipAbductors = 'hip-abductors',
  HipAdductors = 'hip-adductors',
}
