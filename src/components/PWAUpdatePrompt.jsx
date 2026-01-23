import { useState, useEffect } from 'react'
import { IconX, IconDownload } from '@tabler/icons-react'

/**
 * PWA Update Notification
 * 
 * Features:
 * - Detect service worker updates
 * - Show update available banner
 * - Skip waiting and reload logic
 * - Version tracking
 * 
 * This component must be rendered in App.jsx to work
 */
export default function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState(null)

  useEffect(() => {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      return
    }

    // Get service worker registration
    navigator.serviceWorker.ready.then((registration) => {
      // Check if there's an update waiting
      if (registration.waiting) {
        console.log('PWA: Update available (waiting worker found)')
        setWaitingWorker(registration.waiting)
        setShowUpdatePrompt(true)
      }

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        console.log('PWA: Update found, installing new service worker')

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed, ready to activate
              console.log('PWA: New service worker installed, ready to activate')
              setWaitingWorker(newWorker)
              setShowUpdatePrompt(true)
            }
          })
        }
      })
    })

    // DON'T listen for controllerchange - it causes auto-reload
    // We'll manually reload only when user clicks Update button
  }, [])

  const handleUpdate = () => {
    if (!waitingWorker) {
      console.warn('PWA: No waiting worker available')
      return
    }

    console.log('PWA: User accepted update, activating new service worker')
    
    // Tell service worker to skip waiting and activate immediately
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    
    // Hide prompt first
    setShowUpdatePrompt(false)
    
    // Wait a moment for SW to activate, then reload
    setTimeout(() => {
      console.log('PWA: Reloading to use new service worker')
      window.location.reload()
    }, 500)
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
    
    // Track dismissal (user will see update on next visit)
    console.log('PWA: Update dismissed, will prompt again on next visit')
  }

  if (!showUpdatePrompt) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="bg-paper rounded-2xl shadow-xl border border-canvas-border p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-teal-600 rounded-xl flex items-center justify-center">
            <IconDownload className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-ink-900 mb-1">
              Update Tersedia
            </h3>
            <p className="text-small text-ink-muted mb-3">
              Versi baru Lento sudah siap. Update sekarang untuk fitur terbaru!
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
              >
                Update Sekarang
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-ink-muted hover:bg-canvas-100 rounded-lg transition-colors text-sm font-medium"
              >
                Nanti
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-canvas-100 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <IconX className="w-5 h-5 text-ink-muted" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Version display in settings
 */
export function AppVersion() {
  const [version, setVersion] = useState('Loading...')
  const [buildDate, setBuildDate] = useState(null)

  useEffect(() => {
    // Get version from package.json or build metadata
    const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
    const appBuildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString()
    
    setVersion(appVersion)
    setBuildDate(new Date(appBuildDate))
  }, [])

  return (
    <div className="text-small text-ink-muted">
      <div>Version {version}</div>
      {buildDate && (
        <div className="text-xs text-ink-400 mt-1">
          Build: {buildDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </div>
      )}
    </div>
  )
}
