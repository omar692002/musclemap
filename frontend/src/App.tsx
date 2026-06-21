import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppRoutes } from './config/routes'
import { HomePage } from './features/workouts/HomePage'
import { SessionPage } from './features/workouts/SessionPage'
import { ExerciseBrowserPage } from './features/exercise-browser/ExerciseBrowserPage'
import { ExerciseDetailPage } from './features/exercise-browser/ExerciseDetailPage'
import { MuscleMapPage } from './features/muscle-map/MuscleMapPage'
import { ProgramGeneratorPage } from './features/program-generator/ProgramGeneratorPage'
import { AnalyticsPage } from './features/analytics/AnalyticsPage'
import { MuscleIntelPage } from './features/muscle-intel/MuscleIntelPage'
import { AdminPage } from './features/admin/AdminPage'
import { CoachStudioPage } from './features/coach/CoachStudioPage'
import { ContentLibraryPage } from './features/content/ContentLibraryPage'
import { SubscriptionPage } from './features/subscription/SubscriptionPage'
import { OnboardingPage } from './features/onboarding/OnboardingPage'
import { AuthPage } from './features/auth/AuthPage'
import { TopBar } from './components/TopBar'
import { BottomNav } from './components/BottomNav'
import { useAuth } from './features/auth/AuthContext'
import { isStaff } from './features/auth/roles'
import { useProfile } from './features/onboarding/ProfileContext'

/**
 * Mandatory onboarding gate. A signed-in *member* (not a coach/admin) who hasn't
 * completed their profile is funnelled straight into the onboarding wizard and
 * cannot reach the rest of the app until it's done — so the first thing a new
 * member sees after signing in is the profile form, not the session launcher.
 * Staff and already-onboarded users pass through untouched.
 */
function useMustOnboard(): boolean {
  const { user } = useAuth()
  const { profile, loading } = useProfile()
  return user != null && !isStaff(user) && !loading && profile != null && !profile.onboardingCompleted
}

/**
 * Application shell: a mobile-style top bar + bottom tab nav around the routed
 * screens. Home is a workout launcher; the exercise browser, body map, and plan
 * builder are the other tabs. Repositories are provided by main.tsx.
 */
function App() {
  const location = useLocation()
  const mustOnboard = useMustOnboard()
  // Allow only the wizard (and the auth screen) while onboarding is outstanding.
  const onboardingExempt =
    location.pathname === AppRoutes.onboarding || location.pathname === AppRoutes.login
  if (mustOnboard && !onboardingExempt) {
    return <Navigate to={AppRoutes.onboarding} replace />
  }
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <TopBar />
      {/* Keyed by path so each screen replays the entrance animation. */}
      <main key={location.pathname} className="flex-1 animate-fade-up">
        <Routes>
          <Route path={AppRoutes.home} element={<HomePage />} />
          <Route path={AppRoutes.session} element={<SessionPage />} />
          <Route path={AppRoutes.browser} element={<ExerciseBrowserPage />} />
          <Route path={AppRoutes.muscleMap} element={<MuscleMapPage />} />
          <Route path={AppRoutes.program} element={<ProgramGeneratorPage />} />
          <Route path={AppRoutes.progress} element={<AnalyticsPage />} />
          <Route path={AppRoutes.intel} element={<MuscleIntelPage />} />
          <Route path={AppRoutes.admin} element={<AdminPage />} />
          <Route path={AppRoutes.coach} element={<CoachStudioPage />} />
          <Route path={AppRoutes.content} element={<ContentLibraryPage />} />
          <Route path={AppRoutes.subscription} element={<SubscriptionPage />} />
          <Route path={AppRoutes.onboarding} element={<OnboardingPage />} />
          <Route path={AppRoutes.login} element={<AuthPage />} />
          <Route path={AppRoutes.exerciseDetail} element={<ExerciseDetailPage />} />
          <Route path="*" element={<Navigate to={AppRoutes.home} replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
