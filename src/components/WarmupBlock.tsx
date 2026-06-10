import { useState } from 'react'
import { Flame } from 'lucide-react'
import { UiText, WARMUP_STEPS } from '../config/labels'

/**
 * The standard warm-up checklist shown atop a training day / session.
 * Steps are tappable check-offs (session-local state — resets on leave).
 */
export function WarmupBlock() {
  const [done, setDone] = useState<ReadonlySet<number>>(new Set())

  const toggle = (index: number) =>
    setDone((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  return (
    <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
        <Flame className="h-3.5 w-3.5" aria-hidden />
        {UiText.warmupTitle}
      </p>
      <ul className="flex flex-col gap-1">
        {WARMUP_STEPS.map((step, index) => {
          const checked = done.has(index)
          return (
            <li key={step}>
              <label className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-0.5 text-sm text-zinc-600 transition hover:bg-amber-100/60">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(index)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                />
                <span className={checked ? 'text-zinc-400 line-through' : ''}>{step}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
