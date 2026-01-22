import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{js,css,html,png,svg}'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Lento',
        short_name: 'Lento',
        description: 'Less rush. More rhythm.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAF9F6',
        theme_color: '#5B9A8B',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],

        // App Shortcuts (PWA)
        shortcuts: [
          {
            name: 'Tambah Pengeluaran',
            short_name: 'Expense',
            description: 'Catat pengeluaran cepat',
            url: '/quick/expense?utm_source=shortcut',
            icons: [{ src: '/shortcuts/expense-192.png', sizes: '192x192' }],
          },
          {
            name: 'Jurnal 1 Menit',
            short_name: 'Jurnal',
            description: 'Tulis 1 menit biar lega',
            url: '/quick/journal?utm_source=shortcut',
            icons: [{ src: '/shortcuts/journal-192.png', sizes: '192x192' }],
          },
          {
            name: 'Mulai Pomodoro',
            short_name: 'Fokus',
            description: 'Mulai fokus 25 menit',
            url: '/quick/pomodoro?utm_source=shortcut',
            icons: [{ src: '/shortcuts/pomodoro-192.png', sizes: '192x192' }],
          },
          {
            name: 'Quick Note',
            short_name: 'Note',
            description: 'Catatan cepat ke Space',
            url: '/quick/note?utm_source=shortcut',
            icons: [{ src: '/shortcuts/note-192.png', sizes: '192x192' }],
          },
        ],

        // Share Target (receive shared content from other apps)
        share_target: {
          action: '/receive-share',
          method: 'GET',
          enctype: 'application/x-www-form-urlencoded',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
        },
      },
    }),
  ],
})
