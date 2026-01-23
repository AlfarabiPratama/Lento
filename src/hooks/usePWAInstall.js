import { useState, useEffect } from 'react'

/**
 * Custom hook for PWA installation functionality
 * 
 * Handles:
 * - BeforeInstallPrompt event
 * - Install prompt display logic
 * - Installation state tracking
 * - Smart timing (don't spam users)
 * 
 * @returns {object} PWA install state and controls
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      // PWA is considered installed if display mode is standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSInstalled = window.navigator.standalone === true
      return isStandalone || isIOSInstalled
    }

    setIsInstalled(checkInstalled())

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired')
      
      // Prevent default browser install prompt
      e.preventDefault()
      
      // Store for later use
      setDeferredPrompt(e)
      setIsInstallable(true)

      // Smart prompt timing logic
      const installPromptData = getInstallPromptData()
      const shouldShowPrompt = shouldPromptInstall(installPromptData)

      if (shouldShowPrompt) {
        // Delay to avoid immediate popup (wait for user to interact first)
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000)
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      
      // Track install
      trackInstall()
      
      // Clear prompt data
      localStorage.removeItem('lento_install_prompt')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  /**
   * Trigger the install prompt
   */
  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn('PWA: No install prompt available')
      return false
    }

    // Show native install prompt
    deferredPrompt.prompt()

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice
    console.log(`PWA: Install prompt outcome: ${outcome}`)

    // Update tracking
    updateInstallPromptData({ 
      lastPromptDate: Date.now(),
      outcome,
    })

    // Hide our custom prompt
    setShowPrompt(false)

    // Clear deferred prompt
    setDeferredPrompt(null)
    setIsInstallable(false)

    return outcome === 'accepted'
  }

  /**
   * Dismiss the install prompt
   */
  const dismissPrompt = () => {
    setShowPrompt(false)
    
    // Track dismissal
    updateInstallPromptData({ 
      lastDismissDate: Date.now(),
      dismissCount: getInstallPromptData().dismissCount + 1,
    })
  }

  /**
   * Manually show prompt (called from settings or menu)
   */
  const showInstallPrompt = () => {
    if (isInstallable && !isInstalled) {
      setShowPrompt(true)
    }
  }

  return {
    // State
    isInstallable,
    isInstalled,
    showPrompt,
    
    // Actions
    promptInstall,
    dismissPrompt,
    showInstallPrompt,
    
    // Platform-specific guidance
    platform: getPlatform(),
  }
}

/**
 * Get install prompt tracking data from localStorage
 */
function getInstallPromptData() {
  try {
    const data = localStorage.getItem('lento_install_prompt')
    return data ? JSON.parse(data) : {
      visitCount: 0,
      dismissCount: 0,
      lastPromptDate: null,
      lastDismissDate: null,
      firstVisitDate: Date.now(),
    }
  } catch {
    return {
      visitCount: 0,
      dismissCount: 0,
      lastPromptDate: null,
      lastDismissDate: null,
      firstVisitDate: Date.now(),
    }
  }
}

/**
 * Update install prompt tracking data
 */
function updateInstallPromptData(updates) {
  const current = getInstallPromptData()
  const updated = { ...current, ...updates }
  localStorage.setItem('lento_install_prompt', JSON.stringify(updated))
}

/**
 * Determine if we should prompt user to install
 * 
 * Rules:
 * - Don't prompt on first visit (let user explore first)
 * - Don't prompt if dismissed in last 7 days
 * - Don't prompt if dismissed 3+ times
 * - Prompt after 2nd visit or after meaningful action
 */
function shouldPromptInstall(data) {
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000
  
  // Increment visit count
  data.visitCount++
  updateInstallPromptData({ visitCount: data.visitCount })
  
  // Rule 1: Don't prompt on first visit
  if (data.visitCount < 2) {
    return false
  }
  
  // Rule 2: Don't prompt if user dismissed 3+ times (they're not interested)
  if (data.dismissCount >= 3) {
    return false
  }
  
  // Rule 3: Don't prompt if dismissed in last 7 days
  if (data.lastDismissDate && (now - data.lastDismissDate) < 7 * dayInMs) {
    return false
  }
  
  // Rule 4: Don't prompt if already prompted in last 30 days
  if (data.lastPromptDate && (now - data.lastPromptDate) < 30 * dayInMs) {
    return false
  }
  
  return true
}

/**
 * Track successful install to analytics
 */
function trackInstall() {
  updateInstallPromptData({ 
    installed: true,
    installDate: Date.now(),
  })
  
  // Track to analytics (if available)
  if (window.gtag) {
    window.gtag('event', 'pwa_install', {
      event_category: 'engagement',
      event_label: 'PWA Installed',
    })
  }
}

/**
 * Detect user platform for install instructions
 */
function getPlatform() {
  const ua = navigator.userAgent.toLowerCase()
  
  if (ua.includes('iphone') || ua.includes('ipad')) {
    return 'ios'
  } else if (ua.includes('android')) {
    return 'android'
  } else if (ua.includes('mac')) {
    return 'macos'
  } else if (ua.includes('win')) {
    return 'windows'
  }
  
  return 'unknown'
}
