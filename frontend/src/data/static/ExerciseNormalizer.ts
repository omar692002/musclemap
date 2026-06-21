import type { Exercise, MuscleInvolvement } from '../../domain/models/Exercise'
import type { ExerciseMedia } from '../../domain/models/ExerciseMedia'
import type { RawExercise, SourceMuscleName } from './source/sourceSchema'
import { MuscleRole } from '../../domain/enums/MuscleRole'
import { MediaKind } from '../../domain/enums/MediaKind'
import { MediaSource } from '../../domain/enums/MediaSource'
import { EXERCISE_VIDEO_IDS } from './exerciseVideos'
import { youTubeThumbnailUrl } from '../../config/media.config'
import {
  SOURCE_MUSCLE_TO_ID,
  SOURCE_EQUIPMENT_TO_ENUM,
  SOURCE_MECHANIC_TO_ENUM,
  SOURCE_FORCE_TO_ENUM,
  SOURCE_LEVEL_TO_ENUM,
  SOURCE_CATEGORY_TO_ENUM,
  ROLE_DEFAULT_CONTRIBUTION,
} from './mapping/sourceMuscleMap'

/**
 * Transforms raw `free-exercise-db` records into our immutable `Exercise`
 * entities: maps the source vocabulary to our enums/taxonomy, derives
 * muscle involvements (primary/secondary) with default contributions, and
 * resolves relative image paths against the configured CDN base.
 *
 * Stabilizer involvements are intentionally not invented here — the source
 * has none, and fabricating them would be guesswork. They are a later
 * curation pass (see DATA_MODEL.md).
 */
export class ExerciseNormalizer {
  constructor(private readonly imageBaseUrl: string) {}

  normalizeAll(raws: readonly RawExercise[]): readonly Exercise[] {
    return raws.map((raw) => this.normalize(raw))
  }

  normalize(raw: RawExercise): Exercise {
    return {
      id: raw.id,
      name: raw.name,
      muscles: this.toInvolvements(raw),
      category: SOURCE_CATEGORY_TO_ENUM[raw.category],
      level: SOURCE_LEVEL_TO_ENUM[raw.level],
      equipment: raw.equipment ? SOURCE_EQUIPMENT_TO_ENUM[raw.equipment] : undefined,
      mechanic: raw.mechanic ? SOURCE_MECHANIC_TO_ENUM[raw.mechanic] : undefined,
      force: raw.force ? SOURCE_FORCE_TO_ENUM[raw.force] : undefined,
      instructions: raw.instructions,
      media: this.toMedia(raw),
    }
  }

  /** A curated demo video (if any) first, then the source images. */
  private toMedia(raw: RawExercise): readonly ExerciseMedia[] {
    const images = raw.images.map((path) => this.imageMedia(path))
    const videoId = EXERCISE_VIDEO_IDS[raw.id]
    return videoId ? [this.youTubeMedia(videoId), ...images] : images
  }

  /** Wraps a YouTube video id as a video media item (with a still thumbnail). */
  private youTubeMedia(videoId: string): ExerciseMedia {
    return {
      kind: MediaKind.Video,
      source: MediaSource.YouTube,
      url: videoId,
      thumbnailUrl: youTubeThumbnailUrl(videoId),
    }
  }

  private toInvolvements(raw: RawExercise): readonly MuscleInvolvement[] {
    return [
      ...raw.primaryMuscles.map((m) => this.involvement(m, MuscleRole.Primary)),
      ...raw.secondaryMuscles.map((m) => this.involvement(m, MuscleRole.Secondary)),
    ]
  }

  private involvement(source: SourceMuscleName, role: MuscleRole): MuscleInvolvement {
    return {
      muscleId: SOURCE_MUSCLE_TO_ID[source],
      role,
      contribution: ROLE_DEFAULT_CONTRIBUTION[role],
    }
  }

  /** Wraps a source image path as a directly-addressable image media item. */
  private imageMedia(path: string): ExerciseMedia {
    return {
      kind: MediaKind.Image,
      source: MediaSource.File,
      url: this.resolveImageUrl(path),
    }
  }

  private resolveImageUrl(path: string): string {
    return `${this.imageBaseUrl}${path}`
  }
}
