import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Equipment } from '../../domain/enums/Equipment'
import { RowListSkeleton } from '../../components/Skeleton'
import { SplitType } from '../../domain/enums/SplitType'
import { TrainingGoal } from '../../domain/enums/TrainingGoal'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { generateProgram } from './programGenerator'
import { ProgramControls } from './components/ProgramControls'
import { ProgramDayCard } from './components/ProgramDayCard'
import { VolumeReadout } from './components/VolumeReadout'
import { ProgramConfig } from '../../config/program.config'
import { UiText } from '../../config/labels'

/** M4: pick a split / days / equipment → a balanced week + volume readout. */
export function ProgramGeneratorPage() {
  const { exercises, muscleIndex, loading } = useExerciseData()
  const [split, setSplit] = useState<SplitType>(ProgramConfig.defaultSplit)
  const [days, setDays] = useState<number>(ProgramConfig.defaultDays)
  const [goal, setGoal] = useState<TrainingGoal>(ProgramConfig.defaultGoal)
  const [equipment, setEquipment] = useState<ReadonlySet<Equipment>>(new Set())
  // Bumped by "Regenerate" to rotate exercise picks without changing inputs.
  const [seed, setSeed] = useState<number>(0)

  const toggleEquipment = (value: Equipment) => {
    setEquipment((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const program = useMemo(
    () => generateProgram({ split, days, goal, equipment, seed }, exercises, muscleIndex),
    [split, days, goal, equipment, seed, exercises, muscleIndex],
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{UiText.programTitle}</h1>
      </header>
      <p className="mb-5 text-sm text-zinc-500">{UiText.programHelp}</p>

      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <ProgramControls
          split={split}
          days={days}
          goal={goal}
          equipment={equipment}
          onSplitChange={setSplit}
          onDaysChange={setDays}
          onGoalChange={setGoal}
          onToggleEquipment={toggleEquipment}
          onClearEquipment={() => setEquipment(new Set())}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            {UiText.regenerate}
          </button>
        </div>
      </div>

      {loading ? (
        <RowListSkeleton count={4} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {program.days.map((day) => (
              <ProgramDayCard key={day.index} day={day} />
            ))}
          </div>
          <VolumeReadout volumeByGroup={program.volumeByGroup} />
        </div>
      )}
    </div>
  )
}
