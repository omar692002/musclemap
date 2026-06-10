/**
 * iOS-style segmented control: a pill group where the active segment is filled.
 * Generic over the option key so callers keep enum/string typing.
 */
export interface SegmentOption<T extends string> {
  readonly value: T
  readonly label: string
}

interface SegmentedControlProps<T extends string> {
  readonly options: readonly SegmentOption<T>[]
  readonly value: T
  onChange(value: T): void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-0.5" role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          className={`rounded-full px-3.5 py-1 text-sm font-medium transition ${
            option.value === value
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
