import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, GraduationCap, LogOut, ShieldCheck, UserCog, Video } from 'lucide-react'
import { isAuthEnabled, isBackendAuthEnabled } from '../../config/auth.config'
import { UserRole } from '../../domain/enums/UserRole'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { useAuth } from './AuthContext'
import { mountGoogleSignIn } from './googleIdentity'

/**
 * Top-bar auth controls: a labeled Google sign-in button when signed out, or
 * the user's avatar (tap → profile card) plus an explicit sign-out button when
 * signed in. Renders nothing when no Google client id is configured.
 */
export function UserMenu() {
  const { user, signIn, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const buttonHost = useRef<HTMLDivElement>(null)

  // Mount the GIS button whenever we're signed out.
  useEffect(() => {
    if (user || !isAuthEnabled() || !buttonHost.current) return
    void mountGoogleSignIn(buttonHost.current, signIn)
  }, [user, signIn])

  if (!isAuthEnabled()) return null

  if (!user) {
    return <div ref={buttonHost} className="h-8 overflow-hidden" aria-label={UiText.signIn} />
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
          <Link
            to={AppRoutes.onboarding}
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-subtle px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-subtle"
          >
            <UserCog className="h-3.5 w-3.5" aria-hidden />
            {UiText.editProfile}
          </Link>
          <Link
            to={AppRoutes.subscription}
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-subtle px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-subtle"
          >
            <Crown className="h-3.5 w-3.5" aria-hidden />
            {UiText.navSubscription}
          </Link>
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
