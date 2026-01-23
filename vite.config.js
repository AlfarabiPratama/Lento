import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (disabled for smaller bundle)
    sourcemap: false,
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        // Manual chunks for optimal code splitting
        manualChunks: (id) => {
          // Core React libraries (loaded on every page)
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }
          
          // Firebase (only loaded when auth/data features used)
          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }
          
          // UI icons (used across many pages)
          if (id.includes('@tabler/icons-react')) {
            return 'ui-vendor';
          }
          
          // Date utilities (used in calendar, habits, finance)
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          
          // Analytics & monitoring
          if (id.includes('@sentry') || id.includes('sentry')) {
            return 'analytics-vendor';
          }
          
          // Supabase (separate from firebase)
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'supabase-vendor';
          }
          
          // Common utilities shared across features
          if (id.includes('/src/lib/') && id.includes('/db.js')) {
            return 'common-db';
          }
          
          // Node modules (vendor chunks)
          if (id.includes('node_modules')) {
            return 'vendor-libs';
          }
        },
        // Optimize chunk file names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
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
