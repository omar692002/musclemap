import type { Exercise } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'
import type { ProgramExercise } from '../../domain/models/WorkoutProgram'
import { ExerciseCategory } from '../../domain/enums/ExerciseCategory'
import { candidatesByGroup, pickExercises, compoundFirstSeeded } from '../program-generator/programGenerator'
import { TEMPLATE_BY_FOCUS } from '../../config/program.config'
import { SessionConfig, type WorkoutSession } from '../../config/sessions.config'
import { UiText, DAY_FOCUS_LABELS, MUSCLE_GROUP_LABELS } from '../../config/labels'

/** The exercises (with sets/reps) for a quick session, seeded for variety. */
export function sessionExercises(
  session: WorkoutSession,
  exercises: readonly Exercise[],
  muscleIndex: ReadonlyMap<string, Muscle>,
  seed: number,
): ProgramExercise[] {
  if (session.cardio) {
    return exercises
      .filter((exercise) => exercise.category === ExerciseCategory.Cardio)
      .sort((a, b) => compoundFirstSeeded(a, b, seed))
      .slice(0, SessionConfig.cardioCount)
      .map((exercise) => ({ exercise, sets: 1, reps: UiText.cardioDuration }))
  }
  const groups = session.focus ? TEMPLATE_BY_FOCUS[session.focus].groups : []
  const candidates = candidatesByGroup(exercises, new Set(), muscleIndex, seed)
  return pickExercises(groups, candidates, SessionConfig.goal, SessionConfig.perGroup, new Set())
}

/** The session's display title (focus label, or "Cardio"). */
export function sessionTitle(session: WorkoutSession): string {
  return session.cardio || !session.focus ? UiText.cardioTitle : DAY_FOCUS_LABELS[session.focus]
}

/** The session's subtitle: its muscle groups, or the cardio tagline. */
export function sessionSubtitle(session: WorkoutSession): string {
  if (session.cardio || !session.focus) return UiText.cardioSubtitle
  return TEMPLATE_BY_FOCUS[session.focus].groups.map((group) => MUSCLE_GROUP_LABELS[group]).join(' · ')
}
