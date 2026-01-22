import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initErrorTracking } from './lib/sentry'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { initPerformanceMonitoring } from './utils/performanceMonitor'

// Initialize error tracking (only in production with DSN)
initErrorTracking()

// Initialize performance monitoring (Core Web Vitals)
initPerformanceMonitoring()

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

// Best Practice PWA: Register Service Worker dengan lifecycle handling
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('[SW] Registered successfully')
  },
  onUpdate: (registration) => {
    // Tampilkan toast untuk update (akan di-handle di App.jsx)
    if (registration.waiting) {
      // Dispatch custom event untuk App.jsx
      window.dispatchEvent(new CustomEvent('sw-update', { detail: registration }))
    }
  }
})

