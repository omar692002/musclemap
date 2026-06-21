import type { SplitType } from '../domain/enums/SplitType'
import type { TrainingGoal } from '../domain/enums/TrainingGoal'
import type { Weekday } from '../domain/enums/Weekday'
import type { ProgressionStrategy } from '../domain/enums/ProgressionStrategy'
import type { ProgressionStep } from '../domain/enums/ProgressionStep'
import type { OverloadCue } from '../domain/enums/OverloadCue'
import type { ExerciseMechanic } from '../domain/enums/ExerciseMechanic'
import {
  SPLIT_PATTERNS,
  GOAL_SCHEMES,
  WEEK_ORDER,
  WEEKLY_LAYOUTS,
  RecoveryConfig,
  ProgramConfig,
  type DayTemplate,
  type SetScheme,
} from './program.config'
import { STRATEGY_BY_GOAL, MESOCYCLE_BY_STRATEGY, OVERLOAD_CUE } from './progression.config'

/**
 * The tuning the program generator runs on, gathered into one serialisable
 * document (EM13, Phase 2). Previously these constants were read directly from
 * the config modules; bundling them here lets the backend own them as the single
 * source of truth (`GET /api/v1/generator/config`) while the generator keeps
 * working offline from {@link BUNDLED_GENERATOR_CONFIG} as a transparent fallback.
 *
 * Plain data only (no functions/icons): the same shape the API returns, so the
 * payload maps onto this type directly. Generation rules, not UI — the form
 * options and prefill still read the local config modules.
 */
export interface GeneratorConfig {
  readonly splitPatterns: Readonly<Record<SplitType, readonly DayTemplate[]>>
  readonly goalSchemes: Readonly<Record<TrainingGoal, { compound: SetScheme; isolation: SetScheme }>>
  readonly weekOrder: readonly Weekday[]
  readonly weeklyLayouts: Readonly<Record<number, readonly Weekday[]>>
  readonly strategyByGoal: Readonly<Record<TrainingGoal, ProgressionStrategy>>
  readonly mesocycleByStrategy: Readonly<Record<ProgressionStrategy, readonly ProgressionStep[]>>
  readonly overloadCue: Readonly<
    Record<ProgressionStrategy, Readonly<Record<ExerciseMechanic, OverloadCue>>>
  >
  readonly exercisesPerGroup: number
  readonly optimalGapDays: number
}

/**
 * The generator config assembled from the bundled config modules — the offline
 * default and the fallback when no backend is configured. Composes the existing
 * constants (no duplication), so the local modules stay the source of truth for
 * the static build.
 */
export const BUNDLED_GENERATOR_CONFIG: GeneratorConfig = {
  splitPatterns: SPLIT_PATTERNS,
  goalSchemes: GOAL_SCHEMES,
  weekOrder: WEEK_ORDER,
  weeklyLayouts: WEEKLY_LAYOUTS,
  strategyByGoal: STRATEGY_BY_GOAL,
  mesocycleByStrategy: MESOCYCLE_BY_STRATEGY,
  overloadCue: OVERLOAD_CUE,
  exercisesPerGroup: ProgramConfig.exercisesPerGroup,
  optimalGapDays: RecoveryConfig.optimalGapDays,
}
