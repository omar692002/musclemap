/** The realistic 3D anatomy model (served from /public/models). */
export const AnatomyModelConfig = {
  url: '/models/muscles.glb',
  /** World height (scene units) to scale the fitted model to. Kept a touch
   *  shorter than the visible frame so the head and feet aren't clipped. */
  targetHeight: 2.8,
  /** Required CC-BY-SA attribution, shown under the model. */
  attribution: 'Model: BodyParts3D / Z-Anatomy · CC BY-SA',
} as const
