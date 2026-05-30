import { useEffect, useState } from 'react'
import { AppConfig } from './config/app.config'
import { exerciseRepository } from './data/static/repositoryFactory'

/**
 * Application shell. Feature modules (exercise browser, muscle map,
 * program generator) will mount here in later milestones. For now it shows
 * a live count from the repository to prove the M1 data pipeline is wired.
 */
function App() {
  const [exerciseCount, setExerciseCount] = useState<number | null>(null)

  useEffect(() => {
    exerciseRepository.getAll().then((exercises) => setExerciseCount(exercises.length))
  }, [])

  return (
    <main className="min-h-dvh bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <img src="/icon.svg" alt="" className="h-20 w-20" />
      <h1 className="text-3xl font-bold tracking-tight">{AppConfig.name}</h1>
      <p className="max-w-sm text-slate-400">{AppConfig.description}</p>
      <span className="mt-2 rounded-full bg-sky-500/10 px-3 py-1 text-sm text-sky-400">
        M1 · {exerciseCount === null ? 'loading…' : `${exerciseCount} exercises loaded`}
      </span>
    </main>
  )
}

export default App
