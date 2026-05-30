import type { Muscle } from '../../../domain/models/Muscle'
import { MuscleGroup } from '../../../domain/enums/MuscleGroup'
import { MuscleId } from '../../../domain/enums/MuscleId'

/**
 * The authored muscle taxonomy (muscle-level granularity for M1).
 * Each source muscle name maps onto exactly one of these (see
 * `mapping/sourceMuscleMap.ts`). Head-level entries are a later pass.
 */
export const MUSCLES: readonly Muscle[] = [
  { id: MuscleId.PectoralisMajor, name: 'Pectoralis Major', group: MuscleGroup.Chest },
  { id: MuscleId.LatissimusDorsi, name: 'Latissimus Dorsi', group: MuscleGroup.Back },
  { id: MuscleId.Trapezius, name: 'Trapezius', group: MuscleGroup.Back },
  { id: MuscleId.Rhomboids, name: 'Rhomboids', group: MuscleGroup.Back },
  { id: MuscleId.ErectorSpinae, name: 'Erector Spinae', group: MuscleGroup.Back },
  { id: MuscleId.Deltoid, name: 'Deltoid', group: MuscleGroup.Shoulders },
  { id: MuscleId.BicepsBrachii, name: 'Biceps Brachii', group: MuscleGroup.Biceps },
  { id: MuscleId.TricepsBrachii, name: 'Triceps Brachii', group: MuscleGroup.Triceps },
  { id: MuscleId.Forearms, name: 'Forearms', group: MuscleGroup.Forearms },
  { id: MuscleId.RectusAbdominis, name: 'Abdominals', group: MuscleGroup.Core },
  { id: MuscleId.Quadriceps, name: 'Quadriceps', group: MuscleGroup.Quadriceps },
  { id: MuscleId.Hamstrings, name: 'Hamstrings', group: MuscleGroup.Hamstrings },
  { id: MuscleId.Gluteus, name: 'Gluteus', group: MuscleGroup.Glutes },
  { id: MuscleId.Calves, name: 'Calves', group: MuscleGroup.Calves },
  { id: MuscleId.Neck, name: 'Neck', group: MuscleGroup.Neck },
  { id: MuscleId.HipAbductors, name: 'Hip Abductors', group: MuscleGroup.Abductors },
  { id: MuscleId.HipAdductors, name: 'Hip Adductors', group: MuscleGroup.Adductors },
]
