import { useState } from 'react'
import { Pause, Play, Video } from 'lucide-react'
import type { ExerciseMedia } from '../../../domain/models/ExerciseMedia'
import { MediaKind } from '../../../domain/enums/MediaKind'
import { MediaSource } from '../../../domain/enums/MediaSource'
import { youTubeEmbedUrl } from '../media'
import { ExerciseImage } from '../../../components/ExerciseImage'
import { UiText } from '../../../config/labels'

interface ExerciseMediaGalleryProps {
  readonly media: readonly ExerciseMedia[]
  readonly title: string
}

/**
 * Exercise media: an animated two-frame demo built from the dataset's
 * start/end photos (pausable), plus the curated video guide when one exists.
 */
export function ExerciseMediaGallery({ media, title }: ExerciseMediaGalleryProps) {
  const images = media.filter((item) => item.kind === MediaKind.Image).map((item) => item.url)
  const video = media.find((item) => item.kind === MediaKind.Video)
  const [paused, setPaused] = useState(false)

  if (images.length === 0 && !video) return null

  return (
    <div className="mb-6 flex flex-col gap-3">
      {images.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          <ExerciseImage images={images} alt={title} fit="contain" className="aspect-[4/3] w-full" paused={paused} />
          <span className="absolute start-3 top-3 rounded-full bg-zinc-900/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {UiText.demoLabel}
          </span>
          {images.length > 1 ? (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={UiText.playPauseDemo}
              className="absolute bottom-3 end-3 grid h-9 w-9 place-items-center rounded-full bg-zinc-900/70 text-white backdrop-blur transition hover:bg-zinc-900/90 active:scale-95"
            >
              {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
            </button>
          ) : null}
        </div>
      ) : null}

      {video ? <VideoItem item={video} title={title} /> : null}
    </div>
  )
}

function VideoItem({ item, title }: { item: ExerciseMedia; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
      <p className="flex items-center gap-1.5 px-3.5 pt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        <Video className="h-3.5 w-3.5 text-red-500" aria-hidden />
        {UiText.videoGuideLabel}
      </p>
      <div className="p-3">
        {item.source === MediaSource.YouTube ? (
          <div className="aspect-video overflow-hidden rounded-xl bg-zinc-100">
            <iframe
              src={youTubeEmbedUrl(item.url)}
              title={title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <video
            src={item.url}
            poster={item.thumbnailUrl}
            controls
            playsInline
            className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 object-cover"
          />
        )}
      </div>
    </div>
  )
}
