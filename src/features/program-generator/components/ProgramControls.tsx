import { SplitType } from '../../../domain/enums/SplitType'
import { Equipment } from '../../../domain/enums/Equipment'
import { TrainingGoal } from '../../../domain/enums/TrainingGoal'
import { ProgramConfig } from '../../../config/program.config'
import { SPLIT_LABELS, GOAL_LABELS, EQUIPMENT_LABELS, UiText } from '../../../config/labels'

interface ProgramControlsProps {
  readonly split: SplitType
  readonly days: number
  readonly goal: TrainingGoal
  readonly equipment: ReadonlySet<Equipment>
  onSplitChange(value: SplitType): void
  onDaysChange(value: number): void
  onGoalChange(value: TrainingGoal): void
  onToggleEquipment(value: Equipment): void
  onClearEquipment(): void
}

const FIELD_CLASS =
  'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-500/60'

function chipClass(active: boolean): string {
  return `rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
    active
      ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
  }`
}

/** Split + days + equipment picker for the program generator. */
export function ProgramControls({
  split,
  days,
  goal,
  equipment,
  onSplitChange,
  onDaysChange,
  onGoalChange,
  onToggleEquipment,
  onClearEquipment,
}: ProgramControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
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

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {UiText.goalLabel}
          <select
            value={goal}
            onChange={(event) => onGoalChange(event.target.value as TrainingGoal)}
            className={FIELD_CLASS}
          >
            {Object.values(TrainingGoal).map((value) => (
              <option key={value} value={value}>
                {GOAL_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
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
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{UiText.equipmentLabel}</span>
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
