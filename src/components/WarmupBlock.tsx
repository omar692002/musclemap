import { UiText, WARMUP_STEPS } from '../config/labels'

/** The standard warm-up checklist shown atop a training day / session. */
export function WarmupBlock() {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/60 p-2.5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-300">{UiText.warmupTitle}</p>
      <ul className="flex list-disc flex-col gap-0.5 ps-4 text-xs text-slate-400">
        {WARMUP_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </div>
  )
}
