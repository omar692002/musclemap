import type { MediaKind } from '../enums/MediaKind'
import type { MediaSource } from '../enums/MediaSource'

/**
 * One media item attached to an exercise. Immutable.
 *
 * Abstracts over images and videos so the UI renders from a single list and
 * real videos (a curated YouTube mapping, or coach uploads in T1) drop in as a
 * pure data change — no UI rewrite. Today the static dataset yields only
 * `Image`/`File` items; the video paths are ready and dormant.
 */
export interface ExerciseMedia {
  readonly kind: MediaKind
  readonly source: MediaSource
  /** Locator: an absolute URL for `File`, or the video id for `YouTube`. */
  readonly url: string
  /** Optional still to show as a thumbnail/poster (e.g. a video cover frame). */
  readonly thumbnailUrl?: string
}
