import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UiText } from '../config/labels'

/** Compact circular back button used at the top of detail-style screens. */
export function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-sm transition hover:bg-subtle hover:text-ink active:scale-95"
      aria-label={UiText.back}
    >
      <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden />
    </button>
  )
}
