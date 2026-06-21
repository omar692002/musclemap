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

/**
 * Application shell: a mobile-style top bar + bottom tab nav around the routed
 * screens. Home is a workout launcher; the exercise browser, body map, and plan
 * builder are the other tabs. Repositories are provided by main.tsx.
 */
function App() {
  const location = useLocation()
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
