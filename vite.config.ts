import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { AppConfig } from './src/config/app.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        // The 3D anatomy model is large — keep it out of the precache and
        // instead cache it on first use so the app installs/loads fast but the
        // model still works offline once viewed.
        globIgnores: ['**/models/*.glb'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.glb'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'anatomy-models',
              expiration: { maxEntries: 4 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: AppConfig.name,
        short_name: AppConfig.shortName,
        description: AppConfig.description,
        theme_color: AppConfig.themeColor,
        background_color: AppConfig.backgroundColor,
        display: 'standalone',
        start_url: AppConfig.startUrl,
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
