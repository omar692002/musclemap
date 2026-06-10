/**
 * Exercise demo image. The free-exercise-db dataset ships two photos per
 * exercise — the start and end position of the movement — so when both are
 * present they are stacked and flipped on a CSS steps() loop, reading as a
 * looping GIF-style demo with zero extra assets or JS timers. A per-instance
 * negative animation delay desynchronises a grid of cards.
 */
interface ExerciseImageProps {
  readonly images: readonly string[]
  readonly alt: string
  /** Sizing/rounding for the frame; the component fills it. */
  readonly className?: string
  /** 'cover' for thumbnails, 'contain' for the detail hero. */
  readonly fit?: 'cover' | 'contain'
  /** Loop the two frames (true) or show only the first still (false). */
  readonly animate?: boolean
  readonly paused?: boolean
}

/** Deterministic per-image start offset so grids of demos don't flip in sync. */
function desyncDelayMs(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return -(Math.abs(hash) % 1800)
}

export function ExerciseImage({
  images,
  alt,
  className = '',
  fit = 'cover',
  animate = true,
  paused = false,
}: ExerciseImageProps) {
  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain'
  const [first, second] = images

  if (!first) return null

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <img src={first} alt={alt} loading="lazy" className={`absolute inset-0 h-full w-full ${fitClass}`} />
      {animate && second ? (
        <img
          src={second}
          alt=""
          loading="lazy"
          aria-hidden
          className={`absolute inset-0 h-full w-full animate-demo-frame ${fitClass}`}
          style={{
            animationDelay: `${desyncDelayMs(second)}ms`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      ) : null}
    </div>
  )
}
