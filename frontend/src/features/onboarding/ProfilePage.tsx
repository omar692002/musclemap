import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, UserCog } from 'lucide-react'
import type { UserProfile } from '../../domain/models/UserProfile'
import { emptyProfile } from '../../domain/models/UserProfile'
import type { Gender } from '../../domain/enums/Gender'
import type { FitnessLevel } from '../../domain/enums/FitnessLevel'
import type { TrainingExperience } from '../../domain/enums/TrainingExperience'
import type { ProfileGoal } from '../../domain/enums/ProfileGoal'
import type { Equipment } from '../../domain/enums/Equipment'
import { AppRoutes } from '../../config/routes'
import { isAuthEnabled } from '../../config/auth.config'
import {
  UiText,
  GENDER_LABELS,
  FITNESS_LEVEL_LABELS,
  EXPERIENCE_LABELS,
  PROFILE_GOAL_LABELS,
  EQUIPMENT_LABELS,
} from '../../config/labels'
import {
  GENDER_OPTIONS,
  FITNESS_LEVEL_OPTIONS,
  EXPERIENCE_OPTIONS,
  PROFILE_GOAL_OPTIONS,
  EQUIPMENT_OPTIONS,
  FREQUENCY_OPTIONS,
  OnboardingBounds,
} from '../../config/onboarding.config'
import { useAuth } from '../auth/AuthContext'
import { useProfile } from './ProfileContext'
import { saveProfile } from './profileApi'

const { age: AGE, heightCm: HEIGHT, weightKg: WEIGHT } = OnboardingBounds

/**
 * Standard profile management screen (Scope 2): unlike the stepped onboarding
 * wizard, this shows every field with its current value on one page for direct
 * editing, with explicit Save / Cancel. Values load from the backend (via the
 * shared {@link useProfile}); saving persists through the same API and refreshes
 * the cached profile. Gated behind auth.
 */
export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading, reload } = useProfile()

  useEffect(() => {
    if (isAuthEnabled() && !user) navigate(AppRoutes.home, { replace: true })
  }, [user, navigate])

  if (isAuthEnabled() && !user) return null
  if (loading || (user != null && profile == null)) {
    return <div className="mx-auto mt-6 h-64 max-w-xl animate-pulse rounded-2xl bg-subtle" />
  }

  return <ProfileForm initial={profile ?? emptyProfile()} onSaved={reload} />
}

function ProfileForm({ initial, onSaved }: { initial: UserProfile; onSaved: () => Promise<void> }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<UserProfile>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(false)

  const patch = (next: Partial<UserProfile>) => {
    setDraft((current) => ({ ...current, ...next }))
    setSaved(false)
  }

  const toggleEquipment = (item: Equipment) =>
    setDraft((current) => {
      const has = current.availableEquipment.includes(item)
      return {
        ...current,
        availableEquipment: has
          ? current.availableEquipment.filter((value) => value !== item)
          : [...current.availableEquipment, item],
      }
    })

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initial), [draft, initial])

  const save = async () => {
    setSaving(true)
    setError(false)
    try {
      await saveProfile(draft)
      await onSaved()
      setSaved(true)
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-orange-600" aria-hidden>
          <UserCog className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{UiText.profileEditTitle}</h1>
          <p className="text-sm text-faint">{UiText.profileEditSubtitle}</p>
        </div>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-line/80 bg-surface p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label={UiText.ageWord}
            value={draft.age}
            min={AGE.min}
            max={AGE.max}
            onChange={(value) => patch({ age: value })}
          />
          <SelectField
            label={UiText.genderQuestion}
            value={draft.gender}
            options={GENDER_OPTIONS}
            label_={(value) => GENDER_LABELS[value]}
            onChange={(value) => patch({ gender: value as Gender | null })}
          />
          <NumberField
            label={UiText.heightLabel}
            value={draft.heightCm}
            min={HEIGHT.min}
            max={HEIGHT.max}
            onChange={(value) => patch({ heightCm: value })}
          />
          <NumberField
            label={UiText.weightLabel}
            value={draft.weightKg}
            min={WEIGHT.min}
            max={WEIGHT.max}
            onChange={(value) => patch({ weightKg: value })}
          />
          <SelectField
            label={UiText.levelQuestion}
            value={draft.fitnessLevel}
            options={FITNESS_LEVEL_OPTIONS}
            label_={(value) => FITNESS_LEVEL_LABELS[value]}
            onChange={(value) => patch({ fitnessLevel: value as FitnessLevel | null })}
          />
          <SelectField
            label={UiText.experienceQuestion}
            value={draft.trainingExperience}
            options={EXPERIENCE_OPTIONS}
            label_={(value) => EXPERIENCE_LABELS[value]}
            onChange={(value) => patch({ trainingExperience: value as TrainingExperience | null })}
          />
          <SelectField
            label={UiText.goalQuestion}
            value={draft.trainingGoal}
            options={PROFILE_GOAL_OPTIONS}
            label_={(value) => PROFILE_GOAL_LABELS[value]}
            onChange={(value) => patch({ trainingGoal: value as ProfileGoal | null })}
          />
          <SelectField
            label={UiText.frequencyQuestion}
            value={draft.weeklyFrequency != null ? String(draft.weeklyFrequency) : null}
            options={FREQUENCY_OPTIONS.map(String)}
            label_={(value) => `${value} ${UiText.frequencyUnit}`}
            onChange={(value) => patch({ weeklyFrequency: value ? Number(value) : null })}
          />
        </div>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-faint">{UiText.equipmentQuestion}</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {EQUIPMENT_OPTIONS.map((item) => {
              const selected = draft.availableEquipment.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleEquipment(item)}
                  aria-pressed={selected}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                    selected
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                      : 'border-line bg-subtle text-muted hover:border-line-strong'
                  }`}
                >
                  {EQUIPMENT_LABELS[item]}
                </button>
              )
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-faint">{UiText.injuriesQuestion}</span>
          <textarea
            value={draft.injuryLimitations ?? ''}
            placeholder={UiText.injuriesPlaceholder}
            rows={3}
            maxLength={2000}
            onChange={(event) => patch({ injuryLimitations: event.target.value || null })}
            className="mt-1 w-full resize-none rounded-xl border border-line bg-subtle px-3 py-2 text-sm text-ink outline-none transition focus:border-orange-500/40"
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
          {UiText.profileSaveError}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600">
          <Check className="h-3.5 w-3.5" aria-hidden />
          {UiText.profileSaved}
        </p>
      ) : null}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? UiText.savingProfile : UiText.profileSave}
        </button>
        <button
          type="button"
          onClick={() => navigate(AppRoutes.home)}
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-muted transition hover:bg-subtle"
        >
          {UiText.profileCancel}
        </button>
      </div>
    </div>
  )
}

/** A labelled numeric input that maps empty ↔ null. */
function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number | null
  min: number
  max: number
  onChange: (value: number | null) => void
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
        className="w-full rounded-xl border border-line bg-subtle px-3 py-2 text-sm text-ink outline-none transition focus:border-orange-500/40"
      />
    </Field>
  )
}

/** A labelled native select with a blank "—" option mapping to null. */
function SelectField<T extends string>({
  label,
  value,
  options,
  label_,
  onChange,
}: {
  label: string
  value: T | null
  options: readonly T[]
  label_: (value: T) => string
  onChange: (value: T | null) => void
}) {
  return (
    <Field label={label}>
      <select
        value={value ?? ''}
        onChange={(event) => onChange((event.target.value as T) || null)}
        className="w-full rounded-xl border border-line bg-subtle px-3 py-2 text-sm text-ink outline-none transition focus:border-orange-500/40"
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label_(option)}
          </option>
        ))}
      </select>
    </Field>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-faint">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
