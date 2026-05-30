import { defineConfig } from 'vitest/config'

// Tests are pure domain/data logic (no DOM), so the node environment is
// enough. Kept separate from vite.config.ts to avoid loading the PWA plugin
// during the test run.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
