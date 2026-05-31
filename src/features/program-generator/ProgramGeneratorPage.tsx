import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Equipment } from '../../domain/enums/Equipment'
import { SplitType } from '../../domain/enums/SplitType'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { generateProgram } from './programGenerator'
import { ProgramControls } from './components/ProgramControls'
import { ProgramDayCard } from './components/ProgramDayCard'
import { VolumeReadout } from './components/VolumeReadout'
import { ProgramConfig } from '../../config/program.config'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'

/** M4: pick a split / days / equipment → a balanced week + volume readout. */
export function ProgramGeneratorPage() {
  const { exercises, muscleIndex, loading } = useExerciseData()
  const [split, setSplit] = useState<SplitType>(ProgramConfig.defaultSplit)
  const [days, setDays] = useState<number>(ProgramConfig.defaultDays)
  const [equipment, setEquipment] = useState<ReadonlySet<Equipment>>(new Set())

  const toggleEquipment = (value: Equipment) => {
    setEquipment((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const program = useMemo(
    () => generateProgram({ split, days, equipment }, exercises, muscleIndex),
    [split, days, equipment, exercises, muscleIndex],
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{UiText.programTitle}</h1>
        <Link to={AppRoutes.browser} className="text-sm text-sky-400 hover:text-sky-300">
          {UiText.backToBrowser}
        </Link>
      </header>
      <p className="mb-5 text-sm text-slate-400">{UiText.programHelp}</p>

      <div className="mb-6">
        <ProgramControls
          split={split}
          days={days}
          equipment={equipment}
          onSplitChange={setSplit}
          onDaysChange={setDays}
          onToggleEquipment={toggleEquipment}
          onClearEquipment={() => setEquipment(new Set())}
        />
      </div>

      {loading ? (
        <p className="text-slate-400">{UiText.loading}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {program.days.map((day) => (
              <ProgramDayCard key={day.label} day={day} />
            ))}
          </div>
          <VolumeReadout volumeByGroup={program.volumeByGroup} />
        </div>
      )}
    </div>
  )
}
