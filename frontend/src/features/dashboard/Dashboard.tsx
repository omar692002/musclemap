import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Dumbbell, Flame, Map, Pencil, Search, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SessionHeroCard } from '../workouts/SessionCard'
import { recommendedSessionFor } from '../../config/recommendation.config'
import { useWorkoutActivity } from './dashboardData'
import { useProfile } from '../onboarding/ProfileContext'
import { EmptyState } from '../../components/StateMessage'
import { AppRoutes } from '../../config/routes'
import {
  EXPERIENCE_LABELS,
  FITNESS_LEVEL_LABELS,
  PROFILE_GOAL_LABELS,
  UiText,
} from '../../config/labels'
import { getActiveLanguage } from '../../config/i18n'

/** Section label shared across the dashboard blocks. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 mt-6 text-xs font-semibold uppercase tracking-widest text-faint">{children}</h2>
  )
}

/** A single big-number stat tile (streak, this-week). */
function StatCard({ icon: Icon, value, label, hint, accent }: {
  icon: LucideIcon
  value: string
  label: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${accent ? 'bg-orange-500/10 text-orange-600' : 'bg-subtle text-muted'}`}
        aria-hidden
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
      <p className="text-xs font-medium text-faint">{label}</p>
      {hint ? <p className="mt-1 text-[11px] leading-tight text-faint">{hint}</p> : null}
    </div>
  )
}

/** One labelled numeric stat in the profile summary (age / height / weight). */
function ProfileStat({ value, unit, label }: { value: number | null; unit: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-ink">
        {value ?? '—'}
        {value != null ? <span className="ms-0.5 text-xs font-medium text-faint">{unit}</span> : null}
      </p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
    </div>
  )
}

/** Brand-tinted chip used for level / experience. */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-subtle px-2.5 py-1 text-xs font-semibold text-muted">
      {children}
    </span>
  )
}

/** A quick-action shortcut row (also reused by the signed-out home landing). */
export function QuickTile({ to, icon: Icon, title, hint }: { to: string; icon: LucideIcon; title: string; hint?: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-line/80 bg-surface p-4 shadow-sm transition hover:border-line-strong hover:shadow active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-600" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        {hint ? <span className="block truncate text-xs text-faint">{hint}</span> : null}
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-muted rtl:rotate-180"
        aria-hidden
      />
    </Link>
  )
}

/** Narrow weekday initials, Monday → Sunday, in the active language. */
function weekdayInitials(): string[] {
  const fmt = new Intl.DateTimeFormat(getActiveLanguage(), { weekday: 'narrow' })
  // 2024-01-01 is a Monday — anchor so the row is always Mon-first.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)))
}

/** Monday-based index of today (Mon = 0 … Sun = 6). */
function todayIndex(): number {
  return (new Date().getDay() + 6) % 7
}

/**
 * Personalized home for a signed-in, onboarded user (EM4): a goal-aware
 * recommended workout, streak / weekly-activity at a glance, a profile summary,
 * recent workouts, and quick actions. Session history is empty until EM6 wires
 * real tracking, so those sections show motivating empty states for now.
 */
export function Dashboard() {
  const { profile } = useProfile()
  const recommended = recommendedSessionFor(profile, new Date())
  const activity = useWorkoutActivity()
  const initials = weekdayInitials()
  const today = todayIndex()

  const goal = profile?.trainingGoal
  const level = profile?.fitnessLevel
  const experience = profile?.trainingExperience
  const frequency = profile?.weeklyFrequency

  return (
    <>
      <SectionHeading>{UiText.recommendedForYou}</SectionHeading>
      <SessionHeroCard session={recommended} />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <StatCard
          icon={Flame}
          accent
          value={String(activity.currentStreak)}
          label={UiText.statDayStreak}
          hint={activity.currentStreak === 0 ? UiText.streakEmptyHint : undefined}
        />
        <StatCard
          icon={CalendarDays}
          value={frequency != null ? `${activity.thisWeekCount}/${frequency}` : String(activity.thisWeekCount)}
          label={UiText.statThisWeek}
        />
      </div>

      <SectionHeading>{UiText.weeklyActivityTitle}</SectionHeading>
      <div className="flex justify-between gap-1.5 rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
        {initials.map((letter, i) => {
          const done = activity.weekDays[i]
          const isToday = i === today
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[11px] font-medium text-faint">{letter}</span>
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                  done
                    ? 'bg-orange-600 text-white'
                    : isToday
                      ? 'border-2 border-orange-500/40 text-orange-500'
                      : 'bg-subtle text-faint'
                }`}
                aria-hidden
              >
                {done ? '✓' : ''}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-faint">{UiText.yourProfile}</h2>
        <Link
          to={AppRoutes.profile}
          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-600"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          {UiText.editProfile}
        </Link>
      </div>
      <div className="mt-2.5 rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{UiText.goalLabel}</p>
        <p className="text-lg font-bold text-ink">{goal ? PROFILE_GOAL_LABELS[goal] : '—'}</p>
        {level || experience ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {level ? <Chip>{`${UiText.levelWord}: ${FITNESS_LEVEL_LABELS[level]}`}</Chip> : null}
            {experience ? <Chip>{`${UiText.experienceWord}: ${EXPERIENCE_LABELS[experience]}`}</Chip> : null}
          </div>
        ) : null}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
          <ProfileStat value={profile?.age ?? null} unit={UiText.yearsUnit} label={UiText.ageWord} />
          <ProfileStat value={profile?.heightCm ?? null} unit="cm" label={UiText.heightWord} />
          <ProfileStat value={profile?.weightKg ?? null} unit="kg" label={UiText.weightWord} />
        </div>
      </div>

      <SectionHeading>{UiText.recentWorkoutsTitle}</SectionHeading>
      {activity.recent.length === 0 ? (
        <EmptyState title={UiText.noRecentWorkouts} description={UiText.noRecentWorkoutsHint} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {activity.recent.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 rounded-2xl border border-line/80 bg-surface p-3.5 shadow-sm"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-subtle text-muted" aria-hidden>
                <Dumbbell className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{w.title}</span>
                <span className="block truncate text-sm text-faint">
                  {new Intl.DateTimeFormat(getActiveLanguage(), { month: 'short', day: 'numeric' }).format(
                    new Date(w.completedAt),
                  )}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      <SectionHeading>{UiText.quickActionsTitle}</SectionHeading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <QuickTile to={AppRoutes.progress} icon={TrendingUp} title={UiText.viewProgress} hint={UiText.viewProgressHint} />
        <QuickTile to={AppRoutes.program} icon={CalendarDays} title={UiText.buildYourOwn} hint={UiText.buildYourOwnHint} />
        <QuickTile to={AppRoutes.browser} icon={Search} title={UiText.browseAll} />
        <QuickTile to={AppRoutes.muscleMap} icon={Map} title={UiText.openMap} />
      </div>
    </>
  )
}
