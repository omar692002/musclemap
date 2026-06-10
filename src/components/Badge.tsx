import type { ReactNode } from 'react'

/** Visual tones for a Badge. Class strings centralised, never inlined ad hoc. */
export type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'accent'

const TONE_CLASSES: Readonly<Record<BadgeTone, string>> = {
  neutral: 'bg-zinc-100 text-zinc-600 border border-zinc-200/80',
  primary: 'bg-orange-50 text-orange-700 border border-orange-200/70',
  secondary: 'bg-violet-50 text-violet-700 border border-violet-200/70',
  accent: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
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
