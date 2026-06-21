/**
 * How long the user has been training. Stored as a short string in the backend's
 * {@code user_profiles.training_experience} column (free text, max 40 chars);
 * these enum values are the canonical buckets the onboarding flow offers.
 */
export enum TrainingExperience {
  LessThanSixMonths = 'LT_6_MONTHS',
  SixToTwelveMonths = '6_12_MONTHS',
  OneToThreeYears = '1_3_YEARS',
  ThreePlusYears = '3_PLUS_YEARS',
}
