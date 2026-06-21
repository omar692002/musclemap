import { useEffect, useState } from 'react'
import { BUNDLED_GENERATOR_CONFIG, type GeneratorConfig } from '../../config/generator.config'
import { fetchGeneratorConfig } from '../../data/api/generatorConfigApi'

/**
 * The program-generator config, dual-path: starts from the bundled config (so
 * generation works instantly and offline) and swaps to the backend's copy once
 * it loads, when a backend is configured. Mirrors the catalogue's repository
 * fallback — the static deploy is unaffected.
 */
export function useGeneratorConfig(): GeneratorConfig {
  const [config, setConfig] = useState<GeneratorConfig>(BUNDLED_GENERATOR_CONFIG)

  useEffect(() => {
    let active = true
    fetchGeneratorConfig().then((loaded) => {
      if (active && loaded) setConfig(loaded)
    })
    return () => {
      active = false
    }
  }, [])

  return config
}
