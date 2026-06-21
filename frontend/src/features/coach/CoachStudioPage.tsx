import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { UserRole } from '../../domain/enums/UserRole'
import { CoachContentType } from '../../domain/enums/CoachContentType'
import type { CoachVideo, CoachVideoDraft } from '../../domain/models/CoachVideo'
import { AppRoutes } from '../../config/routes'
import { UiText, COACH_CONTENT_TYPE_LABELS } from '../../config/labels'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateMessage'
import { useAuth } from '../auth/AuthContext'
import {
  createContent,
  deleteContent,
  fetchMyContent,
  isCoachBackendReady,
  setContentPublished,
  updateContent,
} from './coachApi'

/** A blank draft for the "new content" form. */
const EMPTY_DRAFT: CoachVideoDraft = {
  contentType: CoachContentType.Technique,
  title: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  exerciseRef: '',
  muscleGroup: '',
  premium: false,
  durationSeconds: null,
}

/** Maps an existing item back to an editable draft (drops server-only fields). */
function toDraft(video: CoachVideo): CoachVideoDraft {
  return {
    contentType: video.contentType,
    title: video.title,
    description: video.description ?? '',
    videoUrl: video.videoUrl ?? '',
    thumbnailUrl: video.thumbnailUrl ?? '',
    exerciseRef: video.exerciseRef ?? '',
    muscleGroup: video.muscleGroup ?? '',
    premium: video.premium,
    durationSeconds: video.durationSeconds,
  }
}

/** Create/edit form for a single content item. */
function ContentForm({
  initial,
  isEdit,
  busy,
  onSubmit,
  onCancel,
}: {
  initial: CoachVideoDraft
  isEdit: boolean
  busy: boolean
  onSubmit: (draft: CoachVideoDraft) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(initial)

  const set = <K extends keyof CoachVideoDraft>(key: K, value: CoachVideoDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim()) return
    onSubmit({ ...draft, title: draft.title.trim() })
  }

  const fieldClass =
    'mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-sm text-ink outline-none focus:border-orange-500/40'

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-ink">
        {isEdit ? UiText.coachFormEditTitle : UiText.coachFormNewTitle}
      </h2>

      <label className="block text-xs font-semibold text-muted">
        {UiText.coachFieldType}
        <select
          value={draft.contentType}
          onChange={(e) => set('contentType', e.target.value as CoachContentType)}
          className={fieldClass}
        >
          {Object.values(CoachContentType).map((type) => (
            <option key={type} value={type}>
              {COACH_CONTENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-xs font-semibold text-muted">
        {UiText.coachFieldTitle}
        <input
          type="text"
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
          required
          maxLength={200}
          className={fieldClass}
        />
      </label>

      <label className="mt-3 block text-xs font-semibold text-muted">
        {UiText.coachFieldDescription}
        <textarea
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className={fieldClass}
        />
      </label>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-muted">
          {UiText.coachFieldVideoUrl}
          <input type="url" value={draft.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} className={fieldClass} />
        </label>
        <label className="block text-xs font-semibold text-muted">
          {UiText.coachFieldThumbnailUrl}
          <input
            type="url"
            value={draft.thumbnailUrl}
            onChange={(e) => set('thumbnailUrl', e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          {UiText.coachFieldExercise}
          <input
            type="text"
            value={draft.exerciseRef}
            onChange={(e) => set('exerciseRef', e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          {UiText.coachFieldMuscle}
          <input
            type="text"
            value={draft.muscleGroup}
            onChange={(e) => set('muscleGroup', e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          {UiText.coachFieldDuration}
          <input
            type="number"
            min={0}
            value={draft.durationSeconds ?? ''}
            onChange={(e) => set('durationSeconds', e.target.value === '' ? null : Number(e.target.value))}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm font-medium text-muted">
        <input
          type="checkbox"
          checked={draft.premium}
          onChange={(e) => set('premium', e.target.checked)}
          className="h-4 w-4 rounded border-line-strong text-orange-600"
        />
        {UiText.coachFieldPremium}
      </label>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={busy || !draft.title.trim()}
          className="rounded-full bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
        >
          {isEdit ? UiText.coachFormSave : UiText.coachFormCreate}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full border border-line bg-subtle px-4 py-1.5 text-xs font-semibold text-muted transition hover:bg-subtle disabled:opacity-50"
        >
          {UiText.coachFormCancel}
        </button>
      </div>
    </form>
  )
}

/** A single library row: badges + publish / edit / delete controls. */
function ContentRow({
  video,
  busy,
  onTogglePublish,
  onEdit,
  onDelete,
}: {
  video: CoachVideo
  busy: boolean
  onTogglePublish: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/80 bg-surface p-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{video.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-subtle px-1.5 py-0.5 text-[10px] font-bold text-muted">
            {COACH_CONTENT_TYPE_LABELS[video.contentType]}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              video.published ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
            }`}
          >
            {video.published ? UiText.coachPublishedBadge : UiText.coachDraftBadge}
          </span>
          {video.premium ? (
            <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
              {UiText.coachPremiumBadge}
            </span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onTogglePublish}
        disabled={busy}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
          video.published
            ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/15'
            : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
        }`}
      >
        {video.published ? UiText.coachUnpublish : UiText.coachPublish}
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={busy}
        aria-label={UiText.coachEdit}
        title={UiText.coachEdit}
        className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-muted transition hover:bg-subtle disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        aria-label={UiText.coachDelete}
        title={UiText.coachDelete}
        className="grid h-8 w-8 place-items-center rounded-full border border-rose-500/30 bg-surface text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  )
}

/**
 * Coach Studio (EM10): a coach authors, publishes and manages their own content
 * (the platform's copyright-clean moat). Reachable only by a COACH or ADMIN
 * principal — others are redirected home (the route is also unlinked for them).
 * Acts on the live API; with no backend there is nothing to author, so it shows
 * an honest notice (same as the Admin platform).
 */
export function CoachStudioPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<CoachVideo[]>([])
  const ready = isCoachBackendReady()
  const [loading, setLoading] = useState(ready)
  const [error, setError] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  // `null` = form closed; '' sentinel via `editing` distinguishes create vs edit.
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CoachVideo | null>(null)
  const [saving, setSaving] = useState(false)

  const runFetch = useCallback(() => {
    return fetchMyContent()
      .then((list) => {
        setItems(list)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    setError(false)
    void runFetch()
  }, [runFetch])

  useEffect(() => {
    if (ready) void runFetch()
  }, [ready, runFetch])

  const openCreate = useCallback(() => {
    setEditing(null)
    setSaveError(false)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((video: CoachVideo) => {
    setEditing(video)
    setSaveError(false)
    setFormOpen(true)
  }, [])

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditing(null)
  }, [])

  // Save the form (create or update), then refresh the library.
  const save = useCallback(
    (draft: CoachVideoDraft) => {
      setSaving(true)
      setSaveError(false)
      const action = editing ? updateContent(editing.id, draft) : createContent(draft)
      action
        .then(() => runFetch())
        .then(() => closeForm())
        .catch(() => setSaveError(true))
        .finally(() => setSaving(false))
    },
    [editing, runFetch, closeForm],
  )

  // Apply a row mutation (publish toggle / delete), swap in the result, refresh.
  const mutate = useCallback(
    (id: string, action: () => Promise<unknown>) => {
      setBusyId(id)
      setError(false)
      action()
        .then(() => runFetch())
        .catch(() => setError(true))
        .finally(() => setBusyId(null))
    },
    [runFetch],
  )

  // Non-coaches never see this screen (route is also unlinked for them).
  if (user && user.role !== UserRole.Coach && user.role !== UserRole.Admin) {
    return <Navigate to={AppRoutes.home} replace />
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-orange-600" aria-hidden>
          <GraduationCap className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{UiText.coachTitle}</h1>
          <p className="text-sm text-faint">{UiText.coachSubtitle}</p>
        </div>
        {ready && !formOpen ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            {UiText.coachNewContent}
          </button>
        ) : null}
      </header>

      {!ready ? (
        <EmptyState icon={GraduationCap} title={UiText.coachUnavailable} description={UiText.coachUnavailableHint} />
      ) : (
        <>
          {formOpen ? (
            <div className="mb-5">
              {saveError ? (
                <p className="mb-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600">
                  {UiText.coachSaveError}
                </p>
              ) : null}
              <ContentForm
                initial={editing ? toDraft(editing) : EMPTY_DRAFT}
                isEdit={!!editing}
                busy={saving}
                onSubmit={save}
                onCancel={closeForm}
              />
            </div>
          ) : null}

          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : error && items.length === 0 ? (
            <ErrorState title={UiText.coachLoadError} onRetry={reload} />
          ) : items.length === 0 ? (
            <EmptyState icon={GraduationCap} title={UiText.coachEmpty} />
          ) : (
            <div className="flex flex-col gap-2">
              {error ? (
                <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600">{UiText.coachSaveError}</p>
              ) : null}
              {items.map((video) => (
                <ContentRow
                  key={video.id}
                  video={video}
                  busy={busyId === video.id}
                  onTogglePublish={() => mutate(video.id, () => setContentPublished(video.id, !video.published))}
                  onEdit={() => openEdit(video)}
                  onDelete={() => {
                    if (window.confirm(UiText.coachDeleteConfirm)) {
                      mutate(video.id, () => deleteContent(video.id))
                    }
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
