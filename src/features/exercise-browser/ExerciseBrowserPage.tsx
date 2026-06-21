import { useState } from 'react'
import { X } from 'lucide-react'
import { useExerciseData } from './useExerciseData'
import { CardGridSkeleton } from '../../components/Skeleton'
import { useExerciseFilters } from './useExerciseFilters'
import { FilterBar } from './components/FilterBar'
import { ExerciseCard } from './components/ExerciseCard'
import { UiText } from '../../config/labels'
import { UiConfig } from '../../config/ui.config'
import { MUSCLE_HEAD_BY_ID } from '../../data/static/taxonomy/muscleHeads'
import type { MuscleHeadId } from '../../domain/enums/MuscleHeadId'

/** A removable "filtering by …" pill. */
function ActiveFilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 transition hover:bg-orange-500/15"
    >
      {UiText.muscleFilterLabel}: {label}
      <X className="h-3 w-3" aria-hidden />
      <span className="sr-only">{UiText.clearFilter}</span>
    </button>
  )
}

/** Landing screen: search/filter the catalog and tap through to detail. */
export function ExerciseBrowserPage() {
  const { exercises, muscleIndex, loading } = useExerciseData()
  const { search, group, equipment, muscle, head, results, setSearch, setGroup, setEquipment, setMuscle, setHead } =
    useExerciseFilters(exercises, muscleIndex)
  const [visibleCount, setVisibleCount] = useState<number>(UiConfig.browserPageSize)

  // Changing any filter resets paging so results start from the top. Done in
  // the handlers (not an effect) to avoid an extra render pass.
  const resetPaging = () => setVisibleCount(UiConfig.browserPageSize)
  const handleSearchChange = (value: string) => {
    setSearch(value)
    resetPaging()
  }
  const handleGroupChange = (value: typeof group) => {
    setGroup(value)
    resetPaging()
  }
  const handleEquipmentChange = (value: typeof equipment) => {
    setEquipment(value)
    resetPaging()
  }
  const clearMuscle = () => {
    setMuscle(null)
    resetPaging()
  }
  const clearHead = () => {
    setHead(null)
    resetPaging()
  }

  const muscleName = muscle ? muscleIndex.get(muscle)?.name ?? null : null
  const headName = head ? MUSCLE_HEAD_BY_ID.get(head as MuscleHeadId)?.name ?? null : null
  const visible = results.slice(0, visibleCount)
  const remaining = results.length - visible.length

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{UiText.navExercises}</h1>
      </header>

      <div className="mb-3">
        <FilterBar
          search={search}
          group={group}
          equipment={equipment}
          onSearchChange={handleSearchChange}
          onGroupChange={handleGroupChange}
          onEquipmentChange={handleEquipmentChange}
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-sm tabular-nums text-faint">
          {results.length} {UiText.exercisesWord}
        </span>
        {headName ? <ActiveFilterChip label={headName} onClear={clearHead} /> : null}
        {muscleName ? <ActiveFilterChip label={muscleName} onClear={clearMuscle} /> : null}
      </div>

      {loading ? (
        <CardGridSkeleton count={8} />
      ) : results.length === 0 ? (
        <p className="rounded-2xl border border-line/80 bg-surface p-6 text-center text-sm text-faint">
          {UiText.noResults}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} muscleIndex={muscleIndex} />
            ))}
          </div>

          {remaining > 0 ? (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + UiConfig.browserPageSize)}
                className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-muted shadow-sm transition hover:border-line-strong hover:bg-subtle active:scale-95"
              >
                {UiText.loadMore} ({remaining})
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
