import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { UserProfile } from '../../domain/models/UserProfile'
import { emptyProfile } from '../../domain/models/UserProfile'
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
  OnboardingStep,
  ONBOARDING_STEPS,
  SKIPPABLE_STEPS,
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
import { MultiOptionGrid, NumberField, OptionGrid } from './OnboardingFields'

const { age: AGE, heightCm: HEIGHT, weightKg: WEIGHT } = OnboardingBounds

function inRange(value: number | null, min: number, max: number): boolean {
  return value != null && value >= min && value <= max
}

/** Whether the current step has the input it requires to advance. */
function isStepValid(step: OnboardingStep, draft: UserProfile): boolean {
  switch (step) {
    case OnboardingStep.Age:
      return inRange(draft.age, AGE.min, AGE.max)
    case OnboardingStep.Gender:
      return draft.gender != null
    case OnboardingStep.Measurements:
      return inRange(draft.heightCm, HEIGHT.min, HEIGHT.max) && inRange(draft.weightKg, WEIGHT.min, WEIGHT.max)
    case OnboardingStep.Level:
      return draft.fitnessLevel != null
    case OnboardingStep.Goal:
      return draft.trainingGoal != null
    case OnboardingStep.Frequency:
      return draft.weeklyFrequency != null
    case OnboardingStep.Experience:
    case OnboardingStep.Equipment:
    case OnboardingStep.Injuries:
      return true
  }
}

function questionFor(step: OnboardingStep): string {
  switch (step) {
    case OnboardingStep.Age:
      return UiText.ageQuestion
    case OnboardingStep.Gender:
      return UiText.genderQuestion
    case OnboardingStep.Measurements:
      return UiText.measurementsQuestion
    case OnboardingStep.Level:
      return UiText.levelQuestion
    case OnboardingStep.Experience:
      return UiText.experienceQuestion
    case OnboardingStep.Goal:
      return UiText.goalQuestion
    case OnboardingStep.Frequency:
      return UiText.frequencyQuestion
    case OnboardingStep.Equipment:
      return UiText.equipmentQuestion
    case OnboardingStep.Injuries:
      return UiText.injuriesQuestion
  }
}

/**
 * Premium onboarding (EM3): a mobile-first wizard that collects the user's
 * profile and persists it (backend when configured, else local). Gated behind
 * auth — signed-out users are bounced home. Pre-fills from any existing profile
 * so the same flow doubles as "edit profile".
 *
 * This outer component handles the auth gate and waits for the profile to load,
 * then mounts {@link OnboardingWizard} with the loaded profile as its initial
 * state — so the form needs no seeding effect.
 */
export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading, reload } = useProfile()

  // Auth gate: only signed-in users onboard. (When auth is disabled there is no
  // user concept and the flow is unreachable from the UI anyway.)
  useEffect(() => {
    if (isAuthEnabled() && !user) {
      navigate(AppRoutes.home, { replace: true })
    }
  }, [user, navigate])

  if (isAuthEnabled() && !user) return null
  if (loading || (user != null && profile == null)) {
    return <div className="mx-auto h-40 max-w-xl animate-pulse rounded-2xl bg-subtle" />
  }

  return <OnboardingWizard initial={profile ?? emptyProfile()} onComplete={reload} />
}

interface OnboardingWizardProps {
  readonly initial: UserProfile
  onComplete(): Promise<void>
}

/** The stateful wizard; its draft is seeded from {@link OnboardingWizardProps.initial}. */
function OnboardingWizard({ initial, onComplete }: OnboardingWizardProps) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<UserProfile>(initial)
  const [index, setIndex] = useState(0)
  const [saving, setSaving] = useState(false)

  const step = ONBOARDING_STEPS[index]
  const isLast = index === ONBOARDING_STEPS.length - 1
  const skippable = SKIPPABLE_STEPS.has(step)
  const valid = isStepValid(step, draft)
  const canProceed = skippable || valid
  const progress = Math.round(((index + 1) / ONBOARDING_STEPS.length) * 100)

  const primaryLabel = useMemo(() => {
    if (isLast) return UiText.finishOnboarding
    return skippable && !valid ? UiText.skipStep : UiText.nextStep
  }, [isLast, skippable, valid])

  const patch = (next: Partial<UserProfile>) => setDraft((current) => ({ ...current, ...next }))

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

  const goBack = () => (index === 0 ? navigate(-1) : setIndex((value) => value - 1))

  const goNext = async () => {
    if (!canProceed) return
    if (!isLast) {
      setIndex((value) => value + 1)
      return
    }
    setSaving(true)
    try {
      await saveProfile(draft)
      await onComplete()
      navigate(AppRoutes.home, { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-xl flex-col px-4 pb-6 pt-3">
      {/* Header: back + progress bar. */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label={UiText.backStep}
          className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm transition active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-10 text-end text-xs font-semibold text-faint">
          {index + 1}/{ONBOARDING_STEPS.length}
        </span>
      </div>

      {/* Question. */}
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">{questionFor(step)}</h1>
      {step === OnboardingStep.Equipment ? (
        <p className="mt-1 text-sm text-muted">{UiText.equipmentHint}</p>
      ) : null}

      {/* Step body. */}
      <div className="mt-6 flex-1">
        {step === OnboardingStep.Age ? (
          <NumberField
            value={draft.age}
            min={AGE.min}
            max={AGE.max}
            label={UiText.ageQuestion}
            onChange={(value) => patch({ age: value })}
          />
        ) : null}

        {step === OnboardingStep.Gender ? (
          <OptionGrid
            options={GENDER_OPTIONS}
            value={draft.gender}
            label={(value) => GENDER_LABELS[value]}
            onSelect={(value) => patch({ gender: value })}
          />
        ) : null}

        {step === OnboardingStep.Measurements ? (
          <div className="flex flex-col gap-4">
            <NumberField
              value={draft.heightCm}
              min={HEIGHT.min}
              max={HEIGHT.max}
              label={UiText.heightLabel}
              onChange={(value) => patch({ heightCm: value })}
            />
            <NumberField
              value={draft.weightKg}
              min={WEIGHT.min}
              max={WEIGHT.max}
              label={UiText.weightLabel}
              onChange={(value) => patch({ weightKg: value })}
            />
          </div>
        ) : null}

        {step === OnboardingStep.Level ? (
          <OptionGrid
            options={FITNESS_LEVEL_OPTIONS}
            value={draft.fitnessLevel}
            label={(value) => FITNESS_LEVEL_LABELS[value]}
            onSelect={(value) => patch({ fitnessLevel: value })}
          />
        ) : null}

        {step === OnboardingStep.Experience ? (
          <OptionGrid
            options={EXPERIENCE_OPTIONS}
            value={draft.trainingExperience}
            label={(value) => EXPERIENCE_LABELS[value]}
            onSelect={(value) => patch({ trainingExperience: value })}
          />
        ) : null}

        {step === OnboardingStep.Goal ? (
          <OptionGrid
            options={PROFILE_GOAL_OPTIONS}
            value={draft.trainingGoal}
            label={(value) => PROFILE_GOAL_LABELS[value]}
            onSelect={(value) => patch({ trainingGoal: value })}
          />
        ) : null}

        {step === OnboardingStep.Frequency ? (
          <div className="grid grid-cols-4 gap-2">
            {FREQUENCY_OPTIONS.map((days) => {
              const selected = draft.weeklyFrequency === days
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => patch({ weeklyFrequency: days })}
                  aria-pressed={selected}
                  className={`grid aspect-square place-items-center rounded-2xl border text-lg font-bold transition active:scale-95 ${
                    selected
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 shadow-sm'
                      : 'border-line bg-surface text-muted hover:border-line-strong'
                  }`}
                >
                  {days}
                </button>
              )
            })}
            <p className="col-span-4 mt-1 text-center text-xs font-medium text-faint">{UiText.frequencyUnit}</p>
          </div>
        ) : null}

        {step === OnboardingStep.Equipment ? (
          <MultiOptionGrid
            options={EQUIPMENT_OPTIONS}
            selected={draft.availableEquipment}
            label={(value) => EQUIPMENT_LABELS[value]}
            onToggle={toggleEquipment}
          />
        ) : null}

        {step === OnboardingStep.Injuries ? (
          <textarea
            value={draft.injuryLimitations ?? ''}
            placeholder={UiText.injuriesPlaceholder}
            rows={4}
            maxLength={2000}
            onChange={(event) => patch({ injuryLimitations: event.target.value || null })}
            className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3.5 text-base text-ink shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        ) : null}
      </div>

      {/* Footer: primary action. */}
      <button
        type="button"
        onClick={goNext}
        disabled={!canProceed || saving}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? UiText.savingProfile : primaryLabel}
      </button>
    </div>
  )
}
