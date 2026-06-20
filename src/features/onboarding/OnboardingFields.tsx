import { Check } from 'lucide-react'

/**
 * Shared, mobile-first form controls for the onboarding wizard. Big tap targets,
 * single- and multi-select option grids, and a clamped number field. Kept
 * generic (typed over the option value) so each step just passes its vocabulary
 * + a label resolver.
 */

interface OptionGridProps<T extends string> {
  readonly options: readonly T[]
  readonly value: T | null
  readonly label: (value: T) => string
  onSelect(value: T): void
}

/** Single-select list of pill buttons. */
export function OptionGrid<T extends string>({ options, value, label, onSelect }: OptionGridProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={selected}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-start text-sm font-semibold transition active:scale-[0.99] ${
              selected
                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <span>{label(option)}</span>
            {selected ? <Check className="h-4 w-4" aria-hidden /> : null}
          </button>
        )
      })}
    </div>
  )
}

interface MultiOptionGridProps<T extends string> {
  readonly options: readonly T[]
  readonly selected: readonly T[]
  readonly label: (value: T) => string
  onToggle(value: T): void
}

/** Multi-select grid of chips (used for the equipment step). */
export function MultiOptionGrid<T extends string>({ options, selected, label, onToggle }: MultiOptionGridProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const on = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={on}
            className={`flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-3 text-start text-sm font-semibold transition active:scale-[0.99] ${
              on
                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <span className="truncate">{label(option)}</span>
            {on ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
          </button>
        )
      })}
    </div>
  )
}

interface NumberFieldProps {
  readonly value: number | null
  readonly min: number
  readonly max: number
  readonly label: string
  readonly placeholder?: string
  onChange(value: number | null): void
}

/** A single numeric input with a floating label; empty clears the value. */
export function NumberField({ value, min, max, label, placeholder, onChange }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => {
          const raw = event.target.value
          onChange(raw === '' ? null : Number(raw))
        }}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base font-semibold text-zinc-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </label>
  )
}
