import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { Equipment } from '../../domain/enums/Equipment'
import { RowListSkeleton } from '../../components/Skeleton'
import { SplitType } from '../../domain/enums/SplitType'
import { TrainingGoal } from '../../domain/enums/TrainingGoal'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { useProfile } from '../onboarding/ProfileContext'
import { generateProgram } from './programGenerator'
import { useGeneratorConfig } from './useGeneratorConfig'
import { ProgramControls } from './components/ProgramControls'
import { ProgramDayCard } from './components/ProgramDayCard'
import { VolumeReadout } from './components/VolumeReadout'
import { RecoveryReadout } from './components/RecoveryReadout'
import { ProgressionPlanCard } from './components/ProgressionPlanCard'
import { DEFAULT_PREFILL, prefillFromProfile } from '../../config/generatorProfile'
import { UiText } from '../../config/labels'

/** EM5: a recovery-aware, profile-tuned week + overload guidance + progression plan. */
export function ProgramGeneratorPage() {
  const { exercises, muscleIndex, loading } = useExerciseData()
  const generatorConfig = useGeneratorConfig()
  const { profile } = useProfile()
  const [split, setSplit] = useState<SplitType>(DEFAULT_PREFILL.split)
  const [days, setDays] = useState<number>(DEFAULT_PREFILL.days)
  const [goal, setGoal] = useState<TrainingGoal>(DEFAULT_PREFILL.goal)
  const [equipment, setEquipment] = useState<ReadonlySet<Equipment>>(DEFAULT_PREFILL.equipment)
  // Bumped by "Regenerate" to rotate exercise picks without changing inputs.
  const [seed, setSeed] = useState<number>(0)
  const [tuned, setTuned] = useState<boolean>(false)
  // Apply the profile prefill once, the first time an onboarded profile loads —
  // after that the controls are the user's to change.
  const prefilled = useRef(false)

  useEffect(() => {
    if (prefilled.current || !profile?.onboardingCompleted) return
    prefilled.current = true
    const prefill = prefillFromProfile(profile)
    setSplit(prefill.split)
    setDays(prefill.days)
    setGoal(prefill.goal)
    setEquipment(prefill.equipment)
    setTuned(true)
  }, [profile])

  const toggleEquipment = (value: Equipment) => {
    setEquipment((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const program = useMemo(
    () => generateProgram({ split, days, goal, equipment, seed }, exercises, muscleIndex, generatorConfig),
    [split, days, goal, equipment, seed, exercises, muscleIndex, generatorConfig],
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-1 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{UiText.programTitle}</h1>
        {tuned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-600">
            <Sparkles className="h-3 w-3" aria-hidden />
            {UiText.tunedToProfile}
          </span>
        )}
      </header>
      <p className="mb-5 text-sm text-muted">{UiText.programHelp}</p>

      <div className="mb-6 rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
        <ProgramControls
          split={split}
          days={days}
          goal={goal}
          equipment={equipment}
          onSplitChange={(value) => {
            setTuned(false)
            setSplit(value)
          }}
          onDaysChange={(value) => {
            setTuned(false)
            setDays(value)
          }}
          onGoalChange={(value) => {
            setTuned(false)
            setGoal(value)
          }}
          onToggleEquipment={toggleEquipment}
          onClearEquipment={() => setEquipment(new Set())}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-500/15 active:scale-95"
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
          <RecoveryReadout recovery={program.recovery} />
          <ProgressionPlanCard plan={program.progression} />
          <VolumeReadout volumeByGroup={program.volumeByGroup} />
        </div>
      )}
    </div>
  )
}
