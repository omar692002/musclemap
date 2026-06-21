import type { ReactNode } from 'react'

/** Visual tones for a Badge. Class strings centralised, never inlined ad hoc. */
export type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'accent'

const TONE_CLASSES: Readonly<Record<BadgeTone, string>> = {
  neutral: 'bg-subtle text-muted border border-line',
  primary: 'bg-orange-500/10 text-orange-600 border border-orange-500/20',
  secondary: 'bg-violet-500/10 text-violet-600 border border-violet-500/25',
  accent: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25',
}

interface BadgeProps {
  readonly children: ReactNode
  readonly tone?: BadgeTone
}

/** Small rounded pill used for muscle groups, equipment, roles, etc. */
export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
