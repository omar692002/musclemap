import type { Exercise } from '../../domain/models/Exercise'
import { MediaKind } from '../../domain/enums/MediaKind'
import { MediaConfig } from '../../config/media.config'

/**
 * The still image to show as a card/cover thumbnail, if the exercise has one.
 * Prefers an explicit thumbnail (e.g. a video poster), else the first image.
 */
export function coverImageOf(exercise: Exercise): string | undefined {
  for (const item of exercise.media) {
    if (item.thumbnailUrl) return item.thumbnailUrl
    if (item.kind === MediaKind.Image) return item.url
  }
  return undefined
}

/** Builds the embeddable iframe URL for a YouTube video id. */
export function youTubeEmbedUrl(videoId: string): string {
  return `${MediaConfig.youTubeEmbedBaseUrl}${encodeURIComponent(videoId)}`
}

/** Whether the exercise has a demo video (used to flag cards with a play badge). */
export function hasVideo(exercise: Exercise): boolean {
  return exercise.media.some((item) => item.kind === MediaKind.Video)
}
