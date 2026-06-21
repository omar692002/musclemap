import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { UserRole } from '../../domain/enums/UserRole'
import { AppRoutes } from '../../config/routes'
import { UiText, USER_ROLE_LABELS } from '../../config/labels'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateMessage'
import { useAuth } from '../auth/AuthContext'
import {
  fetchMetrics,
  fetchUsers,
  isAdminBackendReady,
  updateUserRole,
  updateUserStatus,
  type AdminMetrics,
  type AdminUser,
} from './adminApi'

/** One labelled number in the platform-metrics grid. */
function Metric({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
      <p className={`text-2xl font-extrabold tracking-tight ${tone ?? 'text-ink'}`}>{value}</p>
      <p className="text-xs font-medium text-faint">{label}</p>
    </div>
  )
}

function MetricsGrid({ metrics }: { metrics: AdminMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Metric label={UiText.adminMetricUsers} value={metrics.totalUsers} />
      <Metric label={UiText.adminMetricActive} value={metrics.enabledUsers} tone="text-emerald-600" />
      <Metric label={UiText.adminMetricLocal} value={metrics.localUsers} />
      <Metric label={UiText.adminMetricGoogle} value={metrics.googleUsers} />
      <Metric label={UiText.adminMetricProfiles} value={metrics.totalProfiles} />
      <Metric label={UiText.adminMetricPrograms} value={metrics.totalPrograms} />
      <Metric label={UiText.adminMetricSessions} value={metrics.totalSessions} />
      <Metric label={UiText.adminMetricCompleted} value={metrics.completedSessions} tone="text-orange-600" />
      <Metric label={UiText.adminMetricCoachVideos} value={metrics.coachVideos} />
      <Metric label={UiText.adminMetricPublished} value={metrics.publishedVideos} />
    </div>
  )
}

/** A single user row with role and enabled controls (disabled for the admin's own account). */
function UserRow({
  user,
  isSelf,
  busy,
  onRole,
  onToggle,
}: {
  user: AdminUser
  isSelf: boolean
  busy: boolean
  onRole: (role: UserRole) => void
  onToggle: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/80 bg-surface p-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
          {user.displayName || user.email}
          {isSelf ? (
            <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
              {UiText.adminYou}
            </span>
          ) : null}
        </p>
        <p className="truncate text-xs text-faint">{user.email}</p>
      </div>

      <select
        value={user.role}
        disabled={isSelf || busy}
        onChange={(e) => onRole(e.target.value as UserRole)}
        aria-label={UiText.adminColRole}
        className="rounded-lg border border-line bg-subtle px-2 py-1 text-xs font-semibold text-muted disabled:opacity-50"
      >
        {Object.values(UserRole).map((role) => (
          <option key={role} value={role}>
            {USER_ROLE_LABELS[role]}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={isSelf || busy}
        onClick={onToggle}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
          user.enabled
            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/15'
        }`}
      >
        {user.enabled ? UiText.adminEnabled : UiText.adminDisabled}
      </button>
    </div>
  )
}

/**
 * Admin Platform (EM9): platform-health metrics and user management (role +
 * enable/disable), reachable only by an ADMIN principal. Acts on the live API —
 * with no backend there is nothing to administer, so it shows an honest notice.
 * Non-admins are redirected home; the admin's own account controls are locked to
 * prevent a self-lockout (also guarded server-side).
 */
export function AdminPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const ready = isAdminBackendReady()
  // Seed loading from `ready`: with no backend there is nothing to fetch.
  const [loading, setLoading] = useState(ready)
  const [error, setError] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Async-only: setState lands in the promise callbacks, never synchronously
  // (keeps it safe to call straight from the mount effect).
  const runFetch = useCallback(() => {
    return Promise.all([fetchMetrics(), fetchUsers()])
      .then(([m, u]) => {
        setMetrics(m)
        setUsers(u)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Retry handler: an event callback may reset state synchronously.
  const reload = useCallback(() => {
    setLoading(true)
    setError(false)
    void runFetch()
  }, [runFetch])

  useEffect(() => {
    if (ready) void runFetch()
  }, [ready, runFetch])

  // Apply a user mutation, swap the returned record into the list, and refresh metrics.
  const mutate = useCallback(
    (id: string, action: () => Promise<AdminUser>) => {
      setBusyId(id)
      setError(false)
      action()
        .then((updated) => {
          setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
          return fetchMetrics().then(setMetrics).catch(() => undefined)
        })
        .catch(() => setError(true))
        .finally(() => setBusyId(null))
    },
    [],
  )

  // Non-admins never see this screen (route is also unlinked for them).
  if (user && user.role !== UserRole.Admin) {
    return <Navigate to={AppRoutes.home} replace />
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-orange-600" aria-hidden>
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{UiText.adminTitle}</h1>
          <p className="text-sm text-faint">{UiText.adminSubtitle}</p>
        </div>
      </header>

      {!ready ? (
        <EmptyState icon={ShieldCheck} title={UiText.adminUnavailable} description={UiText.adminUnavailableHint} />
      ) : loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : error && !metrics ? (
        <ErrorState title={UiText.adminLoadError} onRetry={reload} />
      ) : (
        <>
          {metrics ? (
            <section className="mb-5">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">
                {UiText.adminSectionPlatform}
              </h2>
              <MetricsGrid metrics={metrics} />
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">
              {UiText.adminSectionUsers}
            </h2>
            {error ? (
              <p className="mb-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600">
                {UiText.adminUpdateError}
              </p>
            ) : null}
            {users.length === 0 ? (
              <EmptyState title={UiText.adminNoUsers} />
            ) : (
              <div className="flex flex-col gap-2">
                {users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isSelf={!!user && user.email.toLowerCase() === u.email.toLowerCase()}
                    busy={busyId === u.id}
                    onRole={(role) => mutate(u.id, () => updateUserRole(u.id, role))}
                    onToggle={() => mutate(u.id, () => updateUserStatus(u.id, !u.enabled))}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
