/**
 * The progressive-overload model a program follows over its 4-week mesocycle
 * (EM5). Chosen from the training goal: strength loads linearly, hypertrophy
 * uses double progression (reps then load), endurance adds reps and density.
 */
export enum ProgressionStrategy {
  LinearLoad = 'LINEAR_LOAD',
  DoubleProgression = 'DOUBLE_PROGRESSION',
  RepsAndDensity = 'REPS_AND_DENSITY',
}
