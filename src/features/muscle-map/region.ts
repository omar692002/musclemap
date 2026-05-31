import type { MuscleId } from '../../domain/enums/MuscleId'
import type { MuscleHeadId } from '../../domain/enums/MuscleHeadId'

/**
 * What a clickable area on the muscle map refers to: a muscle head when the
 * muscle is split (3D), otherwise the whole muscle. `key` is the head id or the
 * muscle id — used for selection routing, counts, and hover state.
 */
export interface RegionRef {
  readonly key: string
  readonly label: string
  readonly muscleId: MuscleId
  readonly headId?: MuscleHeadId
}
