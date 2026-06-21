/**
 * The user's primary fitness objective, captured at onboarding. Distinct from
 * {@link TrainingGoal} (the generator's set/rep emphasis): this mirrors the
 * backend {@code com.musclemap.user.TrainingGoal} (user_profiles.training_goal)
 * and describes *why* the user trains.
 */
export enum ProfileGoal {
  BuildMuscle = 'BUILD_MUSCLE',
  LoseFat = 'LOSE_FAT',
  GainStrength = 'GAIN_STRENGTH',
  ImproveEndurance = 'IMPROVE_ENDURANCE',
  GeneralFitness = 'GENERAL_FITNESS',
}
