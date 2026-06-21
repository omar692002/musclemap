import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Loader2, Lock, Mail, User } from 'lucide-react'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { isAuthEnabled, isBackendAuthEnabled } from '../../config/auth.config'
import { useAuth } from './AuthContext'
import { mountGoogleSignIn } from './googleIdentity'
import { AuthApiError, loginWithEmail, registerWithEmail } from './authApi'

type Mode = 'signin' | 'signup'

/**
 * Dedicated authentication screen: email/password sign-in and sign-up (backed by
 * the MuscleMap server) plus the Google button. When no backend is configured
 * the email form is disabled with a note and Google still works (it falls back
 * to a client-side session) — so the static deploy keeps a usable sign-in.
 */
export function AuthPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const googleHost = useRef<HTMLDivElement>(null)

  const backendReady = isBackendAuthEnabled()
  const googleReady = isAuthEnabled()

  // Already signed in → there's nothing to do here.
  useEffect(() => {
    if (user) navigate(AppRoutes.home, { replace: true })
  }, [user, navigate])

  // Mount the Google button (signing in routes home via the shared handler).
  useEffect(() => {
    if (user || !googleReady || !googleHost.current) return
    void mountGoogleSignIn(googleHost.current, (next) => {
      signIn(next)
      navigate(AppRoutes.home, { replace: true })
    })
  }, [user, googleReady, signIn, navigate])

  const isSignUp = mode === 'signup'

  // Turn an auth failure into a clear, actionable message. Internal sentinels map
  // to friendly copy; anything else is the backend's own validation / credentials
  // message (e.g. "Email already registered", "Password must be ≥ 8 characters"),
  // which we surface verbatim instead of a generic "something went wrong".
  function messageFor(err: unknown): string {
    if (!(err instanceof AuthApiError)) return UiText.authError
    switch (err.message) {
      case 'backend-required':
        return UiText.authBackendNote
      case 'network':
        return UiText.authNetworkError
      case 'login-failed':
      case 'register-failed':
        return UiText.authError
      default:
        return err.message
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy || !backendReady) return
    setBusy(true)
    setError(null)
    try {
      const session = isSignUp
        ? await registerWithEmail(email.trim(), password, name.trim() || email.trim())
        : await loginWithEmail(email.trim(), password)
      signIn(session.user)
      navigate(AppRoutes.home, { replace: true })
    } catch (err) {
      setError(messageFor(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="rounded-3xl border border-line/80 bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            aria-hidden
            className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-sm"
          >
            <Dumbbell className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            {isSignUp ? UiText.authSignUpTitle : UiText.authSignInTitle}
          </h1>
          <p className="mt-1 text-sm text-muted">{isSignUp ? UiText.authSignUpSub : UiText.authSignInSub}</p>
        </div>

        {/* Mode switch */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-subtle p-1">
          {(['signin', 'signup'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value)
                setError(null)
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                mode === value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
              aria-pressed={mode === value}
            >
              {value === 'signin' ? UiText.signIn : UiText.signUp}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isSignUp ? (
            <Field icon={<User className="h-4 w-4" aria-hidden />} label={UiText.nameLabel}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={!backendReady}
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                placeholder={UiText.nameLabel}
              />
            </Field>
          ) : null}

          <Field icon={<Mail className="h-4 w-4" aria-hidden />} label={UiText.emailLabel}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={!backendReady}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              placeholder="you@example.com"
            />
          </Field>

          <Field icon={<Lock className="h-4 w-4" aria-hidden />} label={UiText.passwordLabel}>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              disabled={!backendReady}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              placeholder="••••••••"
            />
          </Field>
          {isSignUp ? <p className="-mt-1 px-1 text-[11px] text-faint">{UiText.authPasswordHint}</p> : null}

          {error ? (
            <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          ) : null}

          {!backendReady ? (
            <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600">
              {UiText.authBackendNote}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || !backendReady}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {busy ? UiText.authBusy : isSignUp ? UiText.authSubmitSignUp : UiText.authSubmitSignIn}
          </button>
        </form>

        {googleReady ? (
          <>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs font-medium uppercase tracking-wide text-faint">{UiText.authDivider}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div ref={googleHost} className="flex justify-center" />
          </>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? 'signin' : 'signup')
            setError(null)
          }}
          className="mt-6 w-full text-center text-xs font-semibold text-orange-600 transition hover:text-orange-700"
        >
          {isSignUp ? UiText.authSwitchToSignIn : UiText.authSwitchToSignUp}
        </button>
      </div>
    </div>
  )
}

/** A labelled, icon-prefixed input shell shared by the auth fields. */
function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-line bg-subtle/50 px-3 py-2.5 text-muted focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400/40">
        {icon}
        {children}
      </span>
    </label>
  )
}
