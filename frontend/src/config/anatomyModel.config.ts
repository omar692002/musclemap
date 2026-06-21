/** The realistic 3D anatomy model (served from /public/models). */
export const AnatomyModelConfig = {
  /** Resolved against the deploy base path (sub-path hosting, e.g. GitHub Pages). */
  url: `${import.meta.env.BASE_URL}models/muscles.glb`,
  /** World height (scene units) to scale the fitted model to. Kept well within
   *  the visible frame (camera below) so the figure has clear margin. */
  targetHeight: 2.6,
  /**
   * Replace the cranial (face/eye/jaw) and foot-intrinsic meshes with clean
   * neutral placeholders (a smooth head, simple feet). Flayed (skinless) the real
   * anatomy reads as unsettling "zombie" detail and isn't a trainable group; the
   * stand-ins are sized/placed from the originals' bounding boxes so the figure
   * still looks complete. The body's own region grouping makes the swap exact:
   * every such mesh sits under "Muscles of head" / "Cranial part of muscular
   * system" or "Muscles of foot".
   */
  hideExtremities: true,
  /** Required CC-BY-SA attribution, shown under the model. */
  attribution: 'Model: BodyParts3D / Z-Anatomy · CC BY-SA',
} as const
