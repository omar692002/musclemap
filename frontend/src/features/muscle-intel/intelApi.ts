import { AuthConfig } from '../../config/auth.config'
import { getStoredToken } from '../auth/authApi'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import type { TrainingStatus } from '../../domain/enums/TrainingStatus'
import type { MuscleReadiness } from '../../domain/enums/MuscleReadiness'
import type { RecoveryAdvice } from '../../domain/enums/RecoveryAdvice'

export interface VolumeLandmarks {
  readonly mev: number
  readonly mav: number
  readonly mrv: number
}

export interface RoleBreakdown {
  readonly primary: number
  readonly secondary: number
  readonly stabilizer: number
}

export interface MuscleGroupIntel {
  readonly group: MuscleGroup
  readonly weeklyEffectiveSets: number
  readonly roleBreakdown: RoleBreakdown
  readonly landmarks: VolumeLandmarks
  readonly trainingStatus: TrainingStatus
  readonly lastTrainedAt: string | null
  readonly hoursSinceLast: number | null
  readonly recoveryPct: number
  readonly readiness: MuscleReadiness
  readonly advice: RecoveryAdvice
}

export interface MuscleIntelSummary {
  readonly hasData: boolean
  readonly groups: readonly MuscleGroupIntel[]
  readonly overtrainedCount: number
  readonly undertrainedCount: number
  readonly readyCount: number
}

export async function fetchMuscleIntel(): Promise<MuscleIntelSummary> {
  const token = getStoredToken()
  if (!token) throw new Error('unauthenticated')
  const res = await fetch(`${AuthConfig.apiBaseUrl}/intel`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`intel fetch failed: ${res.status}`)
  return res.json() as Promise<MuscleIntelSummary>
}
