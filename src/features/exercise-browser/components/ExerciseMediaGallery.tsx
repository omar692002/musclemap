import type { ExerciseMedia } from '../../../domain/models/ExerciseMedia'
import { MediaKind } from '../../../domain/enums/MediaKind'
import { MediaSource } from '../../../domain/enums/MediaSource'
import { youTubeEmbedUrl } from '../media'

interface ExerciseMediaGalleryProps {
  readonly media: readonly ExerciseMedia[]
  readonly title: string
}

const FRAME_CLASS = 'w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900'

/** Renders an exercise's media list, switching on kind/source (image | video). */
export function ExerciseMediaGallery({ media, title }: ExerciseMediaGalleryProps) {
  if (media.length === 0) return null

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {media.map((item, index) => (
        <MediaItem key={`${item.url}-${index}`} item={item} title={title} />
      ))}
    </div>
  )
}

function MediaItem({ item, title }: { item: ExerciseMedia; title: string }) {
  if (item.kind === MediaKind.Video) {
    if (item.source === MediaSource.YouTube) {
      return (
        <div className={`${FRAME_CLASS} aspect-video`}>
          <iframe
            src={youTubeEmbedUrl(item.url)}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )
    }
    return (
      <video
        src={item.url}
        poster={item.thumbnailUrl}
        controls
        playsInline
        className={`${FRAME_CLASS} object-cover`}
      />
    )
  }

  return (
    <img
      src={item.url}
      alt={title}
      loading="lazy"
      className={`${FRAME_CLASS} object-cover`}
    />
  )
}
