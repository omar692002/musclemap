import { Routes, Route, Navigate } from 'react-router-dom'
import { AppRoutes } from './config/routes'
import { ExerciseBrowserPage } from './features/exercise-browser/ExerciseBrowserPage'
import { ExerciseDetailPage } from './features/exercise-browser/ExerciseDetailPage'
import { MuscleMapPage } from './features/muscle-map/MuscleMapPage'
import { ProgramGeneratorPage } from './features/program-generator/ProgramGeneratorPage'

/**
 * Application shell + routing. The exercise browser (M2) is the landing
 * screen; the muscle map (M3) and program generator (M4) mount as further
 * routes here. Repositories are provided by the composition root (main.tsx).
 */
function App() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-amber-50 via-orange-50 to-orange-100 text-slate-100">
      <Routes>
        <Route path={AppRoutes.browser} element={<ExerciseBrowserPage />} />
        <Route path={AppRoutes.muscleMap} element={<MuscleMapPage />} />
        <Route path={AppRoutes.program} element={<ProgramGeneratorPage />} />
        <Route path={AppRoutes.exerciseDetail} element={<ExerciseDetailPage />} />
        <Route path="*" element={<Navigate to={AppRoutes.browser} replace />} />
      </Routes>
    </div>
  )
}

export default App
