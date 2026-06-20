import type { CoachContentType } from '../enums/CoachContentType'

/**
 * A coach content item (EM10). Mirrors the backend `CoachVideoResponse`: the
 * authoring side (Coach Studio) sees drafts + published items it owns; the
 * consumer side (content library) only ever receives `published` items.
 */
export interface CoachVideo {
  readonly id: string
  readonly coachId: string
  readonly coachName: string | null
  readonly contentType: CoachContentType
  readonly title: string
  readonly description: string | null
  readonly videoUrl: string | null
  readonly thumbnailUrl: string | null
  readonly exerciseRef: string | null
  readonly muscleGroup: string | null
  readonly premium: boolean
  /**
   * Whether the premium gate is closed for the current viewer (EM11). When true,
   * `videoUrl` is withheld by the backend — a FREE user can't access the source.
   * Always false on the authoring side (a coach sees their own content in full).
   */
  readonly locked: boolean
  readonly published: boolean
  readonly durationSeconds: number | null
  readonly createdAt: string
  readonly updatedAt: string
}

/**
 * Editable fields of a coach content item (mirrors backend `CoachVideoRequest`).
 * `published` is deliberately absent — visibility is a separate toggle, so saving
 * an edit never silently publishes a draft.
 */
export interface CoachVideoDraft {
  readonly contentType: CoachContentType
  readonly title: string
  readonly description: string
  readonly videoUrl: string
  readonly thumbnailUrl: string
  readonly exerciseRef: string
  readonly muscleGroup: string
  readonly premium: boolean
  readonly durationSeconds: number | null
}
