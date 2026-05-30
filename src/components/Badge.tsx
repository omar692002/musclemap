import type { ReactNode } from 'react'

/** Visual tones for a Badge. Class strings centralised, never inlined ad hoc. */
export type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'accent'

const TONE_CLASSES: Readonly<Record<BadgeTone, string>> = {
  neutral: 'bg-slate-700/60 text-slate-200',
  primary: 'bg-sky-500/15 text-sky-300',
  secondary: 'bg-violet-500/15 text-violet-300',
  accent: 'bg-emerald-500/15 text-emerald-300',
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
