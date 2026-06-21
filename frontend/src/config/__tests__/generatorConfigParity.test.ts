import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BUNDLED_GENERATOR_CONFIG } from '../generator.config'

/**
 * The backend serves the generator config as reference data; the frontend keeps
 * the bundled config as the offline source of truth + fallback. This guards the
 * two from drifting: the committed backend resource must deep-equal the bundled
 * config (regenerate the JSON if the config modules change).
 */
describe('generator config parity (backend resource ↔ bundled config)', () => {
  it('the served config.json matches BUNDLED_GENERATOR_CONFIG', () => {
    // From frontend/src/config/__tests__ up to the repo root, then into the
    // sibling backend module (frontend and backend are siblings in the monorepo).
    const path = resolve(
      __dirname,
      '../../../../backend/src/main/resources/generator/config.json',
    )
    const served = JSON.parse(readFileSync(path, 'utf8'))
    // toEqual is structural and key-order-insensitive; arrays stay order-sensitive.
    expect(served).toEqual(BUNDLED_GENERATOR_CONFIG)
  })
})
