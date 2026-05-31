/** The training split a generated program is organised around. */
export enum SplitType {
  FullBody = 'FULL_BODY',
  UpperLower = 'UPPER_LOWER',
  PushPullLegs = 'PUSH_PULL_LEGS',
  /** Classic body-part / "bro" split: Chest+Triceps, Back+Biceps, Legs, Shoulders+Core. */
  BodyPart = 'BODY_PART',
}
