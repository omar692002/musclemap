import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Lock, PlayCircle, Video } from 'lucide-react'
import type { CoachVideo } from '../../domain/models/CoachVideo'
import { UiText, COACH_CONTENT_TYPE_LABELS } from '../../config/labels'
import { AppRoutes } from '../../config/routes'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateMessage'
import { fetchPublishedContent, isCoachBackendReady } from '../coach/coachApi'

/** A single published content card. Premium items are locked until the EM11 gate opens. */
function ContentCard({ video }: { video: CoachVideo }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-sm">
      <div className="relative aspect-video bg-subtle">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-faint">
            <Video className="h-10 w-10" aria-hidden />
          </div>
        )}
        {video.locked ? (
          <div className="absolute inset-0 grid place-items-center bg-black/45 text-white backdrop-blur-[2px]">
            <Lock className="h-7 w-7" aria-hidden />
          </div>
        ) : null}
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
        <h3 className="truncate text-sm font-semibold text-ink">{video.title}</h3>
        {video.coachName ? (
          <p className="mt-0.5 text-xs text-faint">
            {UiText.contentBy} {video.coachName}
          </p>
        ) : null}
        {video.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{video.description}</p>
        ) : null}
        {video.locked ? (
          <Link
            to={AppRoutes.subscription}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-orange-600"
          >
            <Crown className="h-3.5 w-3.5" aria-hidden />
            {UiText.contentUnlock}
          </Link>
        ) : video.videoUrl ? (
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-surface transition hover:opacity-90"
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
 * signed-in user can browse the content coaches have published. Premium items the
 * viewer isn't entitled to come back `locked` from the backend (EM11 gate, video
 * url withheld) and show an upgrade CTA instead of a watch link. Acts on the live
 * API; with no backend there is nothing to browse, so it shows an honest notice
 * (same pattern as the Admin platform and Coach Studio).
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
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-orange-600" aria-hidden>
          <Video className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{UiText.contentTitle}</h1>
          <p className="text-sm text-faint">{UiText.contentSubtitle}</p>
        </div>
      </header>

      {!ready ? (
        <EmptyState icon={Video} title={UiText.contentUnavailable} description={UiText.contentUnavailableHint} />
      ) : loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title={UiText.contentLoadError} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState icon={Video} title={UiText.contentEmpty} />
      ) : (
        <div className="grid animate-fade-up grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((video) => (
            <ContentCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
