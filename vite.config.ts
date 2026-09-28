import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const DAY = 60 * 60 * 24

export default defineConfig({
  plugins: [
    react(),
    // app instalable: manifest + service worker (la app arranca sin red y las fotos quedan en caché)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // el manifest se pide con las cookies: si no, en las previews protegidas de Vercel falla y no deja instalar
      useCredentials: true,
      manifest: {
        id: '/',
        name: 'FFI 6-0 · Inazuma Draft',
        short_name: 'FFI 6-0',
        description: 'Inazuma Eleven draft: roll teams, draft your eleven and win the FFI.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#06121c',
        theme_color: '#06121c',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['og.png'],
        runtimeCaching: [
          {
            // catálogo de Supabase: al instante desde la caché y se actualiza por detrás (lo nuevo, en el siguiente arranque)
            urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'catalog', expiration: { maxEntries: 400, maxAgeSeconds: 30 * DAY }, cacheableResponse: { statuses: [0, 200, 206] } },
          },
          {
            // fotos de jugadores (zukan) y de técnicas (wiki)
            urlPattern: ({ url }) => url.hostname === 'dxi4wb638ujep.cloudfront.net' || url.hostname === 'static.wikia.nocookie.net',
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 4000, maxAgeSeconds: 90 * DAY }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 30, maxAgeSeconds: 365 * DAY }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  // GitHub Pages sert le site sous /<repo>/ (VITE_BASE=/inazuma-draft/ en CI)
  base: process.env.VITE_BASE ?? '/',
})
