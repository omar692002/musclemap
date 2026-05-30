/** The realistic 3D anatomy model (served from /public/models). */
export const AnatomyModelConfig = {
  url: '/models/muscles.glb',
  /** World height (in the scene's units) to scale the fitted model to. */
  targetHeight: 3.4,
  /** Required CC-BY-SA attribution, shown under the model. */
  attribution: 'Model: BodyParts3D / Z-Anatomy · CC BY-SA',
} as const
