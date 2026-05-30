import { createContext, useContext } from 'react'
import type { IExerciseRepository } from '../domain/repositories/IExerciseRepository'
import type { IMuscleRepository } from '../domain/repositories/IMuscleRepository'

/**
 * Dependency-inversion seam for the UI: components consume repository
 * *interfaces* through this context, never the concrete static factory.
 * The composition root (main.tsx) supplies the implementations, so swapping
 * in a remote source later is a one-line change there.
 */
export interface Repositories {
  readonly exerciseRepository: IExerciseRepository
  readonly muscleRepository: IMuscleRepository
}

export const RepositoryContext = createContext<Repositories | null>(null)

export function useRepositories(): Repositories {
  const repositories = useContext(RepositoryContext)
  if (!repositories) {
    throw new Error('useRepositories must be used within a RepositoryContext provider')
  }
  return repositories
}
