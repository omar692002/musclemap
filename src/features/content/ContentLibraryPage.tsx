import { useCallback, useEffect, useState } from 'react'
import { Crown, PlayCircle, Video } from 'lucide-react'
import type { CoachVideo } from '../../domain/models/CoachVideo'
import { UiText, COACH_CONTENT_TYPE_LABELS } from '../../config/labels'
import { Skeleton } from '../../components/Skeleton'
import { fetchPublishedContent, isCoachBackendReady } from '../coach/coachApi'

/** A single published content card. */
function ContentCard({ video }: { video: CoachVideo }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="relative aspect-video bg-zinc-100">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-zinc-300">
            <Video className="h-10 w-10" aria-hidden />
          </div>
        )}
        <span className="absolute start-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
          {COACH_CONTENT_TYPE_LABELS[video.contentType]}
        </span>
        {video.premium ? (
          <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
            <Crown className="h-3 w-3" aria-hidden />
            {UiText.coachPremiumBadge}
          </span>
        ) : null}
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-zinc-900">{video.title}</h3>
        {video.coachName ? (
          <p className="mt-0.5 text-xs text-zinc-400">
            {UiText.contentBy} {video.coachName}
          </p>
        ) : null}
        {video.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{video.description}</p>
        ) : null}
        {video.videoUrl ? (
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-zinc-700"
          >
            <PlayCircle className="h-3.5 w-3.5" aria-hidden />
            {UiText.contentWatch}
          </a>
        ) : null}
      </div>
    </article>
  )
}

/**
 * Coach Content library (EM10): the consumer side of the Coach Platform — every
 * signed-in user can browse the content coaches have published. Premium items are
 * shown here with a badge; the actual premium access gate arrives in EM11. Acts on
 * the live API; with no backend there is nothing to browse, so it shows an honest
 * notice (same pattern as the Admin platform and Coach Studio).
 */
export function ContentLibraryPage() {
  const [items, setItems] = useState<CoachVideo[]>([])
  const ready = isCoachBackendReady()
  const [loading, setLoading] = useState(ready)
  const [error, setError] = useState(false)

  const runFetch = useCallback(() => {
    return fetchPublishedContent()
      .then((list) => {
        setItems(list)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    setError(false)
    void runFetch()
  }, [runFetch])

  useEffect(() => {
    if (ready) void runFetch()
  }, [ready, runFetch])

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-600" aria-hidden>
          <Video className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{UiText.contentTitle}</h1>
          <p className="text-sm text-zinc-400">{UiText.contentSubtitle}</p>
        </div>
      </header>

      {!ready ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-8 text-center">
          <Video className="mx-auto h-8 w-8 text-zinc-300" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-zinc-500">{UiText.contentUnavailable}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{UiText.contentUnavailableHint}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-semibold text-rose-700">{UiText.contentLoadError}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-3 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
          >
            {UiText.coachRetry}
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-6 text-center text-sm text-zinc-400">
          {UiText.contentEmpty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((video) => (
            <ContentCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
