import { useState, useEffect } from 'react'
import { IconDownload, IconX, IconDeviceMobile } from '@tabler/icons-react'

/**
 * PWAInstallPrompt - Prompt user to install app to home screen
 * 
 * Priority 2 Feature - Best Practice 2026: Offline-first PWA
 * 
 * Features:
 * - Captures beforeinstallprompt event
 * - Shows native install prompt on user action
 * - Remembers if user dismissed (localStorage)
 * - Auto-hides after successful install
 * 
 * Usage:
 *   import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
 *   
 *   <PWAInstallPrompt />
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed === 'true') {
      return
    }

    // Capture install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after 10 seconds (don't be annoying immediately)
      setTimeout(() => {
        setShowPrompt(true)
      }, 10000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      localStorage.removeItem('pwa-install-dismissed')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show native install prompt
    deferredPrompt.prompt()

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('✓ PWA installed successfully')
      setIsInstalled(true)
    } else {
      console.log('✗ PWA install declined')
    }

    // Clear prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    
    // Remind again in 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed')
    }, 7 * 24 * 60 * 60 * 1000)
  }

  // Don't show if installed or dismissed
  if (isInstalled || !showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-surface border-2 border-primary rounded-2xl shadow-2xl p-4">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-warm transition-all"
          aria-label="Dismiss"
        >
          <IconX size={18} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <IconDeviceMobile size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-h3 text-ink font-semibold mb-1">
              Install Lento
            </h3>
            <p className="text-small text-ink-muted">
              Add to home screen for offline access & faster performance
            </p>
          </div>
        </div>

        {/* Benefits */}
        <ul className="space-y-1 mb-4 pl-1">
          <li className="text-caption text-ink-muted flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-primary"></span>
            <span>✓ Track habits offline</span>
          </li>
          <li className="text-caption text-ink-muted flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-primary"></span>
            <span>✓ Faster loading</span>
          </li>
          <li className="text-caption text-ink-muted flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-primary"></span>
            <span>✓ Native app experience</span>
          </li>
        </ul>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <IconDownload size={18} />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 btn-secondary"
          >
            Later
          </button>
        </div>

        {/* Tip */}
        <p className="text-tiny text-ink-muted text-center mt-3">
          You can also install from browser menu
        </p>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
