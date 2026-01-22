/**
 * PWA Install Prompt Component
 * 
 * Best Practice: Tampilkan install prompt setelah user engage,
 * bukan langsung saat pertama buka
 */

import { useState, useEffect } from 'react'
import { IconX, IconDeviceMobile } from '@tabler/icons-react'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return // Already installed
    }

    // Check if user already dismissed
    const dismissed = localStorage.getItem('lento_pwa_install_dismissed')
    if (dismissed === 'permanent') return

    const tempDismissUntil = localStorage.getItem('lento_pwa_install_until')
    if (tempDismissUntil) {
      const dismissDate = new Date(tempDismissUntil)
      if (dismissDate > new Date()) return
    }

    // Best Practice PWA: Tangkap beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Tampilkan prompt setelah user engage (jangan langsung)
      const visitCount = parseInt(localStorage.getItem('lento_visit_count') || '0')
      const hasEngaged = localStorage.getItem('user_engaged') || visitCount >= 2
      
      if (hasEngaged) {
        setTimeout(() => setShowPrompt(true), 8000) // 8 detik delay
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    // Track engagement
    const engagementTimer = setTimeout(() => {
      localStorage.setItem('user_engaged', 'true')
    }, 30000) // 30 detik

    // Listen for install event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully')
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(engagementTimer)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`[PWA] Install prompt outcome: ${outcome}`)
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt')
    } else {
      console.log('[PWA] User dismissed the install prompt')
      // Set reminder untuk besok
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      localStorage.setItem('lento_pwa_install_until', tomorrow.toISOString())
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Dismiss sampai besok
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    localStorage.setItem('lento_pwa_install_until', tomorrow.toISOString())
  }

  const handleDismissPermanent = () => {
    setShowPrompt(false)
    localStorage.setItem('lento_pwa_install_dismissed', 'permanent')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl border-2 border-primary-500 z-50 animate-slide-up max-w-md mx-auto">
      <div className="p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          aria-label="Tutup"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <IconDeviceMobile className="w-12 h-12 text-primary-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              Install Lento
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Dapatkan akses cepat dan terima reminder bahkan saat offline!
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4 ml-15">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-green-500">✓</span>
            <span>Akses instan dari home screen</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-green-500">✓</span>
            <span>Bekerja offline</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-green-500">✓</span>
            <span>Push notifications</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Install Sekarang
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium"
          >
            Nanti
          </button>
        </div>

        <button
          onClick={handleDismissPermanent}
          className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2"
        >
          Jangan tanya lagi
        </button>
      </div>
    </div>
  )
}
