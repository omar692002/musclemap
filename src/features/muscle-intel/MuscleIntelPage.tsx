import { useEffect, useMemo, useState } from 'react'
import { Gauge } from 'lucide-react'
import type { WorkoutLog } from '../../domain/models/WorkoutLog'
import type { Exercise } from '../../domain/models/Exercise'
import { MuscleRole } from '../../domain/enums/MuscleRole'
import { TrainingStatus } from '../../domain/enums/TrainingStatus'
import { MuscleReadiness } from '../../domain/enums/MuscleReadiness'
import { computeMuscleIntel, type MuscleGroupIntel } from './muscleIntel'
import { useExerciseData } from '../exercise-browser/useExerciseData'
import { listWorkouts, readLocalWorkouts } from '../workouts/workoutApi'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/StateMessage'
import {
  UiText,
  MUSCLE_GROUP_LABELS,
  MUSCLE_ROLE_LABELS,
  TRAINING_STATUS_LABELS,
  MUSCLE_READINESS_LABELS,
  RECOVERY_ADVICE_LABELS,
} from '../../config/labels'

/** Seeds workout logs from the local cache, then refreshes from the backend (EM6 pattern). */
function useWorkoutLogs(): WorkoutLog[] {
  const [logs, setLogs] = useState<WorkoutLog[]>(readLocalWorkouts)
  useEffect(() => {
    let active = true
    listWorkouts()
      .then((l) => active && setLogs(l))
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])
  return logs
}

/** Trims trailing zeros: 4 → "4", 2.5 → "2.5". */
function num(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/** Tailwind tone per training status (text / bg pairs for the badge). */
const STATUS_TONE: Readonly<Record<TrainingStatus, string>> = {
  [TrainingStatus.Untrained]: 'bg-subtle text-muted',
  [TrainingStatus.Undertrained]: 'bg-amber-500/10 text-amber-600',
  [TrainingStatus.Optimal]: 'bg-emerald-500/10 text-emerald-600',
  [TrainingStatus.Overtrained]: 'bg-rose-500/10 text-rose-600',
}

/** Bar/dot fill per training status. */
const STATUS_FILL: Readonly<Record<TrainingStatus, string>> = {
  [TrainingStatus.Untrained]: 'bg-line',
  [TrainingStatus.Undertrained]: 'bg-amber-400',
  [TrainingStatus.Optimal]: 'bg-emerald-500',
  [TrainingStatus.Overtrained]: 'bg-rose-500',
}

/** Dot colour per readiness. */
const READINESS_DOT: Readonly<Record<MuscleReadiness, string>> = {
  [MuscleReadiness.Ready]: 'bg-emerald-500',
  [MuscleReadiness.Recovering]: 'bg-amber-400',
  [MuscleReadiness.Fatigued]: 'bg-rose-500',
}

/** A muscle group's weekly volume against its MEV/MAV/MRV landmarks. */
function LandmarkBar({ intel }: { intel: MuscleGroupIntel }) {
  const { weeklyEffectiveSets: weekly, landmarks, trainingStatus } = intel
  const scaleMax = Math.max(landmarks.mrv * 1.15, weekly * 1.05, 1)
  const pct = (v: number) => `${Math.min(100, (v / scaleMax) * 100)}%`
  const markers = [landmarks.mev, landmarks.mav, landmarks.mrv]
  return (
    <div className="relative h-2.5 rounded-full bg-subtle">
      <div
        className={`absolute inset-y-0 start-0 rounded-full ${STATUS_FILL[trainingStatus]}`}
        style={{ width: pct(weekly) }}
      />
      {markers.map((m) => (
        <span
          key={m}
          className="absolute inset-y-0 w-px bg-surface/90"
          style={{ insetInlineStart: pct(m) }}
          aria-hidden
        />
      ))}
    </div>
  )
}

/** A thin recovery-progress bar tinted by readiness. */
function RecoveryBar({ intel }: { intel: MuscleGroupIntel }) {
  return (
    <div className="h-1.5 rounded-full bg-subtle">
      <div
        className={`h-full rounded-full ${READINESS_DOT[intel.readiness]}`}
        style={{ width: `${Math.round(intel.recoveryPct)}%` }}
      />
    </div>
  )
}

function lastTrainedLabel(intel: MuscleGroupIntel): string {
  if (intel.hoursSinceLast == null) return UiText.intelNotTrained
  const h = intel.hoursSinceLast
  const value = h >= 24 ? `${Math.round(h / 24)}${UiText.daysUnitShort}` : `${Math.max(1, Math.round(h))}${UiText.hoursUnitShort}`
  return `${UiText.intelLastTrained}: ${value}`
}

function GroupCard({ intel }: { intel: MuscleGroupIntel }) {
  const { roleBreakdown: roles } = intel
  return (
    <div className="rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${READINESS_DOT[intel.readiness]}`} aria-hidden />
          <span className="font-semibold text-ink">{MUSCLE_GROUP_LABELS[intel.group]}</span>
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONE[intel.trainingStatus]}`}>
          {TRAINING_STATUS_LABELS[intel.trainingStatus]}
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-lg font-extrabold tracking-tight text-ink">
          {num(intel.weeklyEffectiveSets)}{' '}
          <span className="text-xs font-semibold text-faint">{UiText.intelWeeklySets}</span>
        </p>
        <p className="text-[11px] text-faint">
          {UiText.intelMev} {intel.landmarks.mev} · {UiText.intelMav} {intel.landmarks.mav} · {UiText.intelMrv} {intel.landmarks.mrv}
        </p>
      </div>
      <div className="mt-1.5">
        <LandmarkBar intel={intel} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-faint">
        <span>
          <span className="font-semibold text-muted">{MUSCLE_READINESS_LABELS[intel.readiness]}</span> ·{' '}
          {Math.round(intel.recoveryPct)}% {UiText.intelRecovered}
        </span>
        <span>{lastTrainedLabel(intel)}</span>
      </div>
      <div className="mt-1.5">
        <RecoveryBar intel={intel} />
      </div>

      <p className="mt-3 text-[11px] text-faint">
        {UiText.intelRoleVolume}: {MUSCLE_ROLE_LABELS[MuscleRole.Primary]} {num(roles.primary)} ·{' '}
        {MUSCLE_ROLE_LABELS[MuscleRole.Secondary]} {num(roles.secondary)} ·{' '}
        {MUSCLE_ROLE_LABELS[MuscleRole.Stabilizer]} {num(roles.stabilizer)}
      </p>

      <p className="mt-2 rounded-lg bg-subtle px-2.5 py-1.5 text-xs font-medium text-muted">
        {RECOVERY_ADVICE_LABELS[intel.advice]}
      </p>
    </div>
  )
}

/**
 * Advanced Muscle Intelligence (EM8): per-muscle-group fatigue, recovery
 * readiness and weekly volume vs evidence-based landmarks (MEV/MAV/MRV), derived
 * from the EM6 workout history. Shows an honest empty state until the first
 * session is tracked.
 */
export function MuscleIntelPage() {
  const logs = useWorkoutLogs()
  const { exercises, muscleIndex, loading } = useExerciseData()

  const exerciseIndex = useMemo(
    () => new Map<string, Exercise>(exercises.map((e) => [e.id, e])),
    [exercises],
  )
  const summary = useMemo(
    () => computeMuscleIntel(logs, exerciseIndex, muscleIndex),
    [logs, exerciseIndex, muscleIndex],
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-orange-600" aria-hidden>
          <Gauge className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{UiText.intelTitle}</h1>
          <p className="text-sm text-faint">{UiText.intelSubtitle}</p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : summary.hasData ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
              <p className="text-2xl font-extrabold tracking-tight text-emerald-600">{summary.readyCount}</p>
              <p className="text-xs font-medium text-faint">{UiText.intelReadyCount}</p>
            </div>
            <div className="rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
              <p className="text-2xl font-extrabold tracking-tight text-rose-600">{summary.overtrainedCount}</p>
              <p className="text-xs font-medium text-faint">{UiText.intelAttentionCount}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {summary.groups.map((intel) => (
              <GroupCard key={intel.group} intel={intel} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon={Gauge} title={UiText.intelNoData} description={UiText.intelNoDataHint} />
      )}
    </div>
  )
}
