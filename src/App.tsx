import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppRoutes } from './config/routes'
import { HomePage } from './features/workouts/HomePage'
import { SessionPage } from './features/workouts/SessionPage'
import { ExerciseBrowserPage } from './features/exercise-browser/ExerciseBrowserPage'
import { ExerciseDetailPage } from './features/exercise-browser/ExerciseDetailPage'
import { MuscleMapPage } from './features/muscle-map/MuscleMapPage'
import { ProgramGeneratorPage } from './features/program-generator/ProgramGeneratorPage'
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
    <div className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900">
      <TopBar />
      {/* Keyed by path so each screen replays the entrance animation. */}
      <main key={location.pathname} className="flex-1 animate-fade-up">
        <Routes>
          <Route path={AppRoutes.home} element={<HomePage />} />
          <Route path={AppRoutes.session} element={<SessionPage />} />
          <Route path={AppRoutes.browser} element={<ExerciseBrowserPage />} />
          <Route path={AppRoutes.muscleMap} element={<MuscleMapPage />} />
          <Route path={AppRoutes.program} element={<ProgramGeneratorPage />} />
          <Route path={AppRoutes.exerciseDetail} element={<ExerciseDetailPage />} />
          <Route path="*" element={<Navigate to={AppRoutes.home} replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
