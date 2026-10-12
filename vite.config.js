import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mind Palace',
        short_name: 'Mind Palace',
        description: 'Learn useful things. Keep them forever.',
        theme_color: '#23766f',
        background_color: '#f4f5f2',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Only the app's own files are cached. Supabase data and login are never cached.
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts-css' } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: /\/storage\/v1\/object\/public\/card-images\/.*/i, handler: 'CacheFirst', options: { cacheName: 'card-images', expiration: { maxEntries: 120, maxAgeSeconds: 2592000 }, cacheableResponse: { statuses: [0, 200] } } },
        ],
      },
    }),
  ],
})
