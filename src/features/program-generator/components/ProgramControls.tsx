import { SplitType } from '../../../domain/enums/SplitType'
import { Equipment } from '../../../domain/enums/Equipment'
import { ProgramConfig } from '../../../config/program.config'
import { SPLIT_LABELS, EQUIPMENT_LABELS, UiText } from '../../../config/labels'

interface ProgramControlsProps {
  readonly split: SplitType
  readonly days: number
  readonly equipment: ReadonlySet<Equipment>
  onSplitChange(value: SplitType): void
  onDaysChange(value: number): void
  onToggleEquipment(value: Equipment): void
  onClearEquipment(): void
}

const FIELD_CLASS =
  'w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 ' +
  'focus:outline-none focus:ring-2 focus:ring-sky-500'

function chipClass(active: boolean): string {
  return `rounded-full border px-3 py-1 text-xs transition ${
    active
      ? 'border-sky-500 bg-sky-500/20 text-sky-100'
      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
  }`
}

/** Split + days + equipment picker for the program generator. */
export function ProgramControls({
  split,
  days,
  equipment,
  onSplitChange,
  onDaysChange,
  onToggleEquipment,
  onClearEquipment,
}: ProgramControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {UiText.splitLabel}
          <select
            value={split}
            onChange={(event) => onSplitChange(event.target.value as SplitType)}
            className={FIELD_CLASS}
          >
            {Object.values(SplitType).map((value) => (
              <option key={value} value={value}>
                {SPLIT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {UiText.daysLabel}
          <select
            value={days}
            onChange={(event) => onDaysChange(Number(event.target.value))}
            className={FIELD_CLASS}
          >
            {ProgramConfig.dayOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-slate-400">{UiText.equipmentLabel}</span>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={onClearEquipment} className={chipClass(equipment.size === 0)}>
            {UiText.allEquipmentShort}
          </button>
          {Object.values(Equipment).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onToggleEquipment(value)}
              className={chipClass(equipment.has(value))}
            >
              {EQUIPMENT_LABELS[value]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
