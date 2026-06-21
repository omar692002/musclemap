import type { GeneratorConfig } from '../../config/generator.config'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'

/**
 * Client for the program-generator config API (EM13, Phase 2). The backend owns
 * the generator's tuning as reference data (`GET /generator/config`) and returns
 * the same JSON shape as {@link GeneratorConfig}. Memoised one-shot fetch; any
 * failure (backend down/offline/not configured) resolves to `null` so the caller
 * falls back to the bundled config (never rejects).
 */

let configPromise: Promise<GeneratorConfig | null> | null = null

async function getConfig(): Promise<GeneratorConfig | null> {
  if (!isBackendAuthEnabled()) return null
  try {
    const res = await fetch(`${AuthConfig.apiBaseUrl}/generator/config`)
    if (!res.ok) return null
    return (await res.json()) as GeneratorConfig
  } catch {
    return null
  }
}

/** The generator config from the API, or `null` to fall back to the bundled config. */
export function fetchGeneratorConfig(): Promise<GeneratorConfig | null> {
  if (!configPromise) {
    configPromise = getConfig()
  }
  return configPromise
}
