import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Dumbbell, Layers, TrendingUp, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WorkoutLog } from '../../domain/models/WorkoutLog'
import type { BodyweightEntry } from '../../domain/models/BodyweightEntry'
import { computeAnalytics, type AnalyticsSummary } from './analytics'
import { BarChart, LineChart, type ChartPoint } from './charts'
import { listWorkouts, readLocalWorkouts } from '../workouts/workoutApi'
import { listBodyweight, logBodyweight, readLocalBodyweight } from './bodyweightApi'
import { useProfile } from '../onboarding/ProfileContext'
import { UiText } from '../../config/labels'
import { getActiveLanguage } from '../../config/i18n'

/** Local-date key (yyyy-mm-dd) of today, for a weigh-in's `recordedOn`. */
function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Parses a `yyyy-mm-dd` day key as a local date (avoids UTC off-by-one). */
function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function shortDate(date: Date): string {
  return new Intl.DateTimeFormat(getActiveLanguage(), { month: 'short', day: 'numeric' }).format(date)
}

/** Compact number, e.g. 12500 → "12.5K" (locale-aware). */
function compact(value: number): string {
  return new Intl.NumberFormat(getActiveLanguage(), { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

/**
 * Loads the user's workout logs + bodyweight entries, seeding synchronously from
 * the local cache (so the page paints immediately) then refreshing from the
 * backend when one is configured — same pattern as the EM6 dashboard hook.
 */
function useProgressData(): { logs: WorkoutLog[]; bodyweight: BodyweightEntry[]; reloadBodyweight: () => void } {
  const [logs, setLogs] = useState<WorkoutLog[]>(readLocalWorkouts)
  const [bodyweight, setBodyweight] = useState<BodyweightEntry[]>(readLocalBodyweight)

  useEffect(() => {
    let active = true
    listWorkouts().then((l) => active && setLogs(l)).catch(() => undefined)
    listBodyweight().then((b) => active && setBodyweight(b)).catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  const reloadBodyweight = () => {
    listBodyweight().then(setBodyweight).catch(() => undefined)
  }

  return { logs, bodyweight, reloadBodyweight }
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 mt-6 text-xs font-semibold uppercase tracking-widest text-zinc-400">{children}</h2>
  )
}

function StatTile({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-600" aria-hidden>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900">{value}</p>
      <p className="text-xs font-medium text-zinc-400">{label}</p>
    </div>
  )
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">{children}</div>
}

/** This-week summary with a volume delta vs last week. */
function WeeklySummary({ summary }: { summary: AnalyticsSummary }) {
  const { thisWeek, lastWeek } = summary
  const delta =
    lastWeek.volumeKg > 0 ? Math.round(((thisWeek.volumeKg - lastWeek.volumeKg) / lastWeek.volumeKg) * 100) : null
  const up = delta != null && delta >= 0
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{UiText.weeklySummaryTitle}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">
            {compact(thisWeek.volumeKg)} <span className="text-sm font-semibold text-zinc-400">{UiText.volumeUnitKg}</span>
          </p>
          <p className="text-xs text-zinc-400">
            {thisWeek.sessions} · {thisWeek.sets} {UiText.setsWord.toLowerCase()}
          </p>
        </div>
        {delta != null ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {up ? '+' : ''}
            {delta}% <span className="font-normal text-zinc-400">{UiText.vsLastWeek}</span>
          </span>
        ) : null}
      </div>
    </div>
  )
}

/** Inline bodyweight logger + evolution chart (always available). */
function BodyweightSection({ entries, onLogged }: { entries: BodyweightEntry[]; onLogged: () => void }) {
  const { profile } = useProfile()
  const latest = entries.length > 0 ? entries[entries.length - 1] : null
  const [saving, setSaving] = useState(false)

  // Pre-fill with the latest weigh-in, falling back to the onboarding weight.
  // Data loads asynchronously, so we adjust the input as the seed arrives using
  // React's render-phase state-adjustment pattern (no effect needed).
  const seed = latest?.weightKg ?? profile?.weightKg ?? null
  const [weight, setWeight] = useState(seed != null ? String(seed) : '')
  const [seedApplied, setSeedApplied] = useState(seed)
  if (seed !== seedApplied) {
    setSeedApplied(seed)
    setWeight(seed != null ? String(seed) : '')
  }

  const points: ChartPoint[] = entries.map((e) => ({ label: shortDate(parseDay(e.recordedOn)), value: e.weightKg }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    const value = Number.parseFloat(weight)
    if (!Number.isFinite(value) || value <= 0) return
    setSaving(true)
    try {
      await logBodyweight({ weightKg: value, recordedOn: todayIso(), note: null })
      onLogged()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-extrabold tracking-tight text-zinc-900">
          {latest ? `${latest.weightKg}` : '—'}
          {latest ? <span className="ms-1 text-sm font-semibold text-zinc-400">{UiText.volumeUnitKg}</span> : null}
        </p>
        {latest ? <span className="text-xs text-zinc-400">{shortDate(parseDay(latest.recordedOn))}</span> : null}
      </div>

      {points.length >= 2 ? (
        <div className="mt-3">
          <LineChart data={points} formatValue={(v) => `${v} ${UiText.volumeUnitKg}`} />
        </div>
      ) : (
        <p className="mt-2 text-xs text-zinc-400">{UiText.bodyweightEmptyHint}</p>
      )}

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={UiText.weightKgPlaceholder}
          aria-label={UiText.weightKgPlaceholder}
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 outline-none focus:border-orange-300 focus:bg-white"
        />
        <button
          type="submit"
          disabled={saving || weight.trim() === ''}
          className="shrink-0 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? UiText.savingWorkout : UiText.saveWord}
        </button>
      </form>
    </div>
  )
}

function PersonalRecords({ summary }: { summary: AnalyticsSummary }) {
  if (summary.prs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-6 text-center">
        <p className="text-sm font-semibold text-zinc-500">{UiText.noPrsYet}</p>
        <p className="mt-0.5 text-xs text-zinc-400">{UiText.noPrsYetHint}</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2.5">
      {summary.prs.map((pr) => (
        <div
          key={pr.exerciseRef}
          className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-sm"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600" aria-hidden>
            <Trophy className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-zinc-900">{pr.exerciseName}</span>
            <span className="block text-sm text-zinc-400">
              {pr.maxWeightKg} {UiText.volumeUnitKg} × {pr.repsAtBest} {UiText.repsWord.toLowerCase()}
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-sm font-bold text-zinc-900">
              {Math.round(pr.estimatedOneRepMaxKg)} {UiText.volumeUnitKg}
            </span>
            <span className="block text-[11px] text-zinc-400">{UiText.est1RmLabel}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Progress analytics (EM7): frequency, volume and PRs derived from the EM6
 * session history, plus a bodyweight-evolution chart you can log into. Bodyweight
 * is always available; the workout-derived analytics show an empty state until
 * the first session is tracked.
 */
export function AnalyticsPage() {
  const { logs, bodyweight, reloadBodyweight } = useProgressData()
  const summary = useMemo(() => computeAnalytics(logs), [logs])

  const volumeBars: ChartPoint[] = summary.weeks.map((w) => ({
    label: new Intl.DateTimeFormat(getActiveLanguage(), { day: 'numeric', month: 'numeric' }).format(w.weekStart),
    value: w.volumeKg,
  }))
  const frequencyBars: ChartPoint[] = summary.weeks.map((w) => ({
    label: new Intl.DateTimeFormat(getActiveLanguage(), { day: 'numeric', month: 'numeric' }).format(w.weekStart),
    value: w.sessions,
  }))

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-600" aria-hidden>
          <TrendingUp className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{UiText.analyticsTitle}</h1>
          <p className="text-sm text-zinc-400">{UiText.analyticsSubtitle}</p>
        </div>
      </header>

      {summary.hasData ? (
        <>
          <WeeklySummary summary={summary} />

          <div className="mt-3 grid grid-cols-3 gap-3">
            <StatTile icon={Dumbbell} value={String(summary.totalWorkouts)} label={UiText.statTotalWorkouts} />
            <StatTile icon={Layers} value={compact(summary.totalVolumeKg)} label={UiText.statTotalVolume} />
            <StatTile icon={Layers} value={String(summary.totalSets)} label={UiText.statTotalSets} />
          </div>

          <SectionHeading>{UiText.weeklyVolumeTitle}</SectionHeading>
          <ChartCard>
            <BarChart data={volumeBars} formatValue={(v) => `${compact(v)} ${UiText.volumeUnitKg}`} />
          </ChartCard>

          <SectionHeading>{UiText.weeklyFrequencyTitle}</SectionHeading>
          <ChartCard>
            <BarChart data={frequencyBars} />
          </ChartCard>

          <SectionHeading>{UiText.personalRecordsTitle}</SectionHeading>
          <PersonalRecords summary={summary} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-8 text-center">
          <Dumbbell className="mx-auto h-8 w-8 text-zinc-300" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-zinc-500">{UiText.noStatsYet}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{UiText.noStatsYetHint}</p>
        </div>
      )}

      <SectionHeading>{UiText.bodyweightTitle}</SectionHeading>
      <BodyweightSection entries={bodyweight} onLogged={reloadBodyweight} />
    </div>
  )
}
