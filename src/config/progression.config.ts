import { TrainingGoal } from '../domain/enums/TrainingGoal'
import { ExerciseMechanic } from '../domain/enums/ExerciseMechanic'
import { ProgressionStrategy } from '../domain/enums/ProgressionStrategy'
import { ProgressionStep } from '../domain/enums/ProgressionStep'
import { OverloadCue } from '../domain/enums/OverloadCue'

/**
 * Progressive-overload configuration (EM5). The training goal selects an overload
 * model; that model drives both the per-exercise cue and the multi-week plan, so
 * the generator carries no hardcoded progression rules.
 */

/** Goal → overload model. */
export const STRATEGY_BY_GOAL: Readonly<Record<TrainingGoal, ProgressionStrategy>> = {
  [TrainingGoal.Strength]: ProgressionStrategy.LinearLoad,
  [TrainingGoal.Hypertrophy]: ProgressionStrategy.DoubleProgression,
  [TrainingGoal.Endurance]: ProgressionStrategy.RepsAndDensity,
}

/**
 * The per-exercise overload cue for a strategy, split by mechanic — heavy
 * compounds add load, isolation accessories chase reps first.
 */
export const OVERLOAD_CUE: Readonly<
  Record<ProgressionStrategy, Readonly<Record<ExerciseMechanic, OverloadCue>>>
> = {
  [ProgressionStrategy.LinearLoad]: {
    [ExerciseMechanic.Compound]: OverloadCue.AddLoadAtTopReps,
    [ExerciseMechanic.Isolation]: OverloadCue.AddRepThenLoad,
  },
  [ProgressionStrategy.DoubleProgression]: {
    [ExerciseMechanic.Compound]: OverloadCue.AddRepThenLoad,
    [ExerciseMechanic.Isolation]: OverloadCue.AddRepThenLoad,
  },
  [ProgressionStrategy.RepsAndDensity]: {
    [ExerciseMechanic.Compound]: OverloadCue.AddRepsCutRest,
    [ExerciseMechanic.Isolation]: OverloadCue.AddRepsCutRest,
  },
}

/** The overload cue for one exercise under a strategy. */
export function overloadCueFor(strategy: ProgressionStrategy, mechanic: ExerciseMechanic): OverloadCue {
  return OVERLOAD_CUE[strategy][mechanic]
}

/**
 * The 4-week mesocycle for each strategy: three progressive weeks then a deload.
 * Structured (steps, not prose) so the UI resolves labels through i18n.
 */
export const MESOCYCLE_BY_STRATEGY: Readonly<Record<ProgressionStrategy, readonly ProgressionStep[]>> = {
  [ProgressionStrategy.LinearLoad]: [
    ProgressionStep.Baseline,
    ProgressionStep.AddLoad,
    ProgressionStep.AddLoad,
    ProgressionStep.Deload,
  ],
  [ProgressionStrategy.DoubleProgression]: [
    ProgressionStep.Baseline,
    ProgressionStep.AddReps,
    ProgressionStep.AddLoadResetReps,
    ProgressionStep.Deload,
  ],
  [ProgressionStrategy.RepsAndDensity]: [
    ProgressionStep.Baseline,
    ProgressionStep.AddReps,
    ProgressionStep.CutRest,
    ProgressionStep.Deload,
  ],
}
