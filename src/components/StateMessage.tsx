import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { UiText } from '../config/labels'
import type { ReactNode } from 'react'

/**
 * Centred "nothing here yet" panel. Used for honest empty states across the app
 * so every screen reads consistently (icon → title → hint → optional action).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex animate-pop-in flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center ${className}`}
    >
      {Icon && (
        <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-subtle text-faint">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

/**
 * Centred error panel with an optional retry. Announced politely to assistive
 * tech (`role="status"`). Defaults to the generic copy when none is supplied.
 */
export function ErrorState({
  title = UiText.errorTitle,
  description = UiText.genericError,
  onRetry,
  className = '',
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="status"
      className={`flex animate-pop-in flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-10 text-center ${className}`}
    >
      <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-500">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="max-w-xs text-sm text-muted">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line bg-subtle px-4 py-2 text-sm font-semibold text-ink transition hover:border-line-strong"
        >
          <RotateCw className="h-4 w-4" aria-hidden />
          {UiText.retry}
        </button>
      )}
    </div>
  )
}
