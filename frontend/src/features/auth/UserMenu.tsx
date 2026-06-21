import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, GraduationCap, LogIn, LogOut, ShieldCheck, UserCog, Video } from 'lucide-react'
import { isAuthEnabled, isBackendAuthEnabled } from '../../config/auth.config'
import { UserRole } from '../../domain/enums/UserRole'
import { SubscriptionPlan } from '../../domain/enums/SubscriptionPlan'
import { AppRoutes } from '../../config/routes'
import { UiText, SUBSCRIPTION_PLAN_LABELS } from '../../config/labels'
import { useSubscription } from '../subscription/SubscriptionContext'
import { useAuth } from './AuthContext'
import { isStaff } from './roles'

/**
 * Top-bar auth controls: a "Sign in" button (→ the auth screen) when signed out,
 * or the user's avatar (tap → profile card) plus an explicit sign-out button
 * when signed in. Renders nothing when no sign-in method is configured.
 */
export function UserMenu() {
  const { user, signOut } = useAuth()
  const { isPremium } = useSubscription()
  const [open, setOpen] = useState(false)
  // Coaches/admins manage the platform: hide the member-only plan/profile/upsell.
  const member = !isStaff(user)

  if (!isAuthEnabled() && !isBackendAuthEnabled()) return null

  if (!user) {
    return (
      <Link
        to={AppRoutes.login}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted shadow-sm transition hover:bg-subtle active:scale-95"
      >
        <LogIn className="h-3.5 w-3.5" aria-hidden />
        {UiText.signIn}
      </Link>
    )
  }

  return (
    <div className="relative flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="block h-8 w-8 overflow-hidden rounded-full border border-line shadow-sm transition active:scale-95"
        aria-expanded={open}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center bg-orange-500/15 text-xs font-bold text-orange-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={signOut}
        aria-label={UiText.signOut}
        title={UiText.signOut}
        className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm transition hover:bg-subtle hover:text-muted active:scale-95"
      >
        <LogOut className="h-4 w-4" aria-hidden />
      </button>

      {open ? (
        <div className="absolute end-0 top-10 z-50 w-56 rounded-2xl border border-line bg-surface p-3 shadow-lg">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="truncate text-xs text-faint">{user.email}</p>
          {member ? (
            <span
              className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isPremium ? 'bg-amber-500/15 text-amber-600' : 'bg-subtle text-muted'
              }`}
            >
              {isPremium ? <Crown className="h-3 w-3" aria-hidden /> : null}
              {SUBSCRIPTION_PLAN_LABELS[isPremium ? SubscriptionPlan.Premium : SubscriptionPlan.Free]}
            </span>
          ) : null}
          {member ? (
            <Link
              to={AppRoutes.onboarding}
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-subtle px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-subtle"
            >
              <UserCog className="h-3.5 w-3.5" aria-hidden />
              {UiText.editProfile}
            </Link>
          ) : null}
          {member ? (
            <Link
              to={AppRoutes.subscription}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-subtle px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-subtle"
            >
              <Crown className="h-3.5 w-3.5" aria-hidden />
              {UiText.navSubscription}
            </Link>
          ) : null}
          {isBackendAuthEnabled() ? (
            <Link
              to={AppRoutes.content}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-subtle px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-subtle"
            >
              <Video className="h-3.5 w-3.5" aria-hidden />
              {UiText.navContent}
            </Link>
          ) : null}
          {user.role === UserRole.Coach || user.role === UserRole.Admin ? (
            <Link
              to={AppRoutes.coach}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-500/15"
            >
              <GraduationCap className="h-3.5 w-3.5" aria-hidden />
              {UiText.navCoach}
            </Link>
          ) : null}
          {user.role === UserRole.Admin ? (
            <Link
              to={AppRoutes.admin}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-500/15"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {UiText.navAdmin}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-subtle px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-subtle"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            {UiText.signOut}
          </button>
        </div>
      ) : null}
    </div>
  )
}
