/** Media rendering constants (no hardcoded URLs in components). */
export const MediaConfig = {
  /** YouTube privacy-enhanced embed base; a video id is appended. */
  youTubeEmbedBaseUrl: 'https://www.youtube-nocookie.com/embed/',
  /** Still-frame thumbnail for a YouTube id: `${base}${id}${suffix}`. */
  youTubeThumbnailBaseUrl: 'https://img.youtube.com/vi/',
  youTubeThumbnailSuffix: '/hqdefault.jpg',
} as const

/** Builds the still-frame thumbnail URL for a YouTube video id. */
export function youTubeThumbnailUrl(videoId: string): string {
  return `${MediaConfig.youTubeThumbnailBaseUrl}${videoId}${MediaConfig.youTubeThumbnailSuffix}`
}
