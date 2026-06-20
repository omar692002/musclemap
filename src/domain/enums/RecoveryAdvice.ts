/**
 * The single recovery recommendation surfaced per muscle group (EM8), derived
 * from its {@link import('./TrainingStatus').TrainingStatus} and
 * {@link import('./MuscleReadiness').MuscleReadiness}.
 */
export enum RecoveryAdvice {
  /** Recovered and below target volume — train it soon. */
  AddVolume = 'ADD_VOLUME',
  /** Recovered and within the productive range — good to train. */
  GoodToTrain = 'GOOD_TO_TRAIN',
  /** Still recovering from the last session — rest before training again. */
  KeepResting = 'KEEP_RESTING',
  /** Weekly volume exceeds what's recoverable — ease off. */
  ReduceVolume = 'REDUCE_VOLUME',
}
