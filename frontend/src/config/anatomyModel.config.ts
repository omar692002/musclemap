/** The realistic 3D anatomy model (served from /public/models). */
export const AnatomyModelConfig = {
  /** Resolved against the deploy base path (sub-path hosting, e.g. GitHub Pages). */
  url: `${import.meta.env.BASE_URL}models/muscles.glb`,
  /** World height (scene units) to scale the fitted model to. Kept well within
   *  the visible frame (camera below) so the head and feet have clear margin. */
  targetHeight: 2.6,
  /** Required CC-BY-SA attribution, shown under the model. */
  attribution: 'Model: BodyParts3D / Z-Anatomy · CC BY-SA',
} as const
