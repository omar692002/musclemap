import type { ChangeEvent } from 'react'
import { Search } from 'lucide-react'
import { MuscleGroup } from '../../../domain/enums/MuscleGroup'
import { Equipment } from '../../../domain/enums/Equipment'
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, UiText } from '../../../config/labels'

interface FilterBarProps {
  readonly search: string
  readonly group: MuscleGroup | null
  readonly equipment: Equipment | null
  onSearchChange(value: string): void
  onGroupChange(value: MuscleGroup | null): void
  onEquipmentChange(value: Equipment | null): void
}

const SELECT_CLASS =
  'w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-500/60'

/** Search box + muscle-group and equipment dropdowns. Options come from enums. */
export function FilterBar({
  search,
  group,
  equipment,
  onSearchChange,
  onGroupChange,
  onEquipmentChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative sm:flex-1">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
          placeholder={UiText.searchPlaceholder}
          className={`${SELECT_CLASS} ps-9`}
          aria-label={UiText.searchPlaceholder}
        />
      </div>

      <select
        value={group ?? ''}
        onChange={(event) => onGroupChange((event.target.value || null) as MuscleGroup | null)}
        className={`${SELECT_CLASS} sm:w-auto`}
        aria-label={UiText.allGroups}
      >
        <option value="">{UiText.allGroups}</option>
        {Object.values(MuscleGroup).map((value) => (
          <option key={value} value={value}>
            {MUSCLE_GROUP_LABELS[value]}
          </option>
        ))}
      </select>

      <select
        value={equipment ?? ''}
        onChange={(event) => onEquipmentChange((event.target.value || null) as Equipment | null)}
        className={`${SELECT_CLASS} sm:w-auto`}
        aria-label={UiText.allEquipment}
      >
        <option value="">{UiText.allEquipment}</option>
        {Object.values(Equipment).map((value) => (
          <option key={value} value={value}>
            {EQUIPMENT_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  )
}
