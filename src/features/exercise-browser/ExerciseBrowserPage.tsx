import { useState } from 'react'
import { useExerciseData } from './useExerciseData'
import { useExerciseFilters } from './useExerciseFilters'
import { FilterBar } from './components/FilterBar'
import { ExerciseCard } from './components/ExerciseCard'
import { UiText } from '../../config/labels'
import { UiConfig } from '../../config/ui.config'

/** Landing screen: search/filter the catalog and tap through to detail. */
export function ExerciseBrowserPage() {
  const { exercises, muscleIndex, loading } = useExerciseData()
  const { search, group, equipment, results, setSearch, setGroup, setEquipment } =
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

  const visible = results.slice(0, visibleCount)
  const remaining = results.length - visible.length

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{UiText.appName}</h1>
        <span className="text-sm text-slate-400">{results.length} exercises</span>
      </header>

      <div className="mb-5">
        <FilterBar
          search={search}
          group={group}
          equipment={equipment}
          onSearchChange={handleSearchChange}
          onGroupChange={handleGroupChange}
          onEquipmentChange={handleEquipmentChange}
        />
      </div>

      {loading ? (
        <p className="text-slate-400">{UiText.loading}</p>
      ) : results.length === 0 ? (
        <p className="text-slate-400">{UiText.noResults}</p>
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
                className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
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
