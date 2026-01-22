/**
 * Smart Permission Request Hook
 * 
 * PWA UX Best Practice: Minta permission pada timing yang tepat,
 * setelah user engage dengan app (bukan langsung saat pertama buka)
 */

import { useState, useEffect } from 'react'

export function useSmartPermissionRequest() {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)

  useEffect(() => {
    checkPermissionStatus()
  }, [])

  async function checkPermissionStatus() {
    // Jangan tampilkan jika sudah granted atau denied
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return
    
    // Jangan tampilkan jika sudah pernah dismiss permanently
    const dismissed = localStorage.getItem('lento_notification_prompt_dismissed')
    if (dismissed === 'permanent') return
    
    // Check temporary dismiss (dismiss sampai besok)
    const tempDismissUntil = localStorage.getItem('lento_notification_prompt_until')
    if (tempDismissUntil) {
      const dismissDate = new Date(tempDismissUntil)
      if (dismissDate > new Date()) return
    }
    
    // Tunggu user engage dengan app (best practice PWA)
    const conditions = {
      hasCreatedHabit: localStorage.getItem('has_created_habit'),
      hasCompletedHabit: localStorage.getItem('has_completed_habit'),
      hasWrittenJournal: localStorage.getItem('has_written_journal'),
      visitCount: parseInt(localStorage.getItem('lento_visit_count') || '0'),
      hasUsedAppMinutes: parseInt(localStorage.getItem('lento_session_duration') || '0')
    }
    
    // Increment visit count
    localStorage.setItem('lento_visit_count', (conditions.visitCount + 1).toString())
    
    // Tampilkan prompt jika:
    // - Sudah 3 kali visit, ATAU
    // - Sudah buat habit/journal pertama, ATAU
    // - Sudah pakai app lebih dari 5 menit total
    const shouldShow = 
      conditions.visitCount >= 3 ||
      conditions.hasCreatedHabit ||
      conditions.hasWrittenJournal ||
      conditions.hasUsedAppMinutes >= 5
    
    if (shouldShow) {
      // Delay 5 detik agar tidak mengganggu langsung
      setTimeout(() => {
        setShouldShowPrompt(true)
      }, 5000)
    }
  }

  const handleDismiss = (option = 'temporary') => {
    setShouldShowPrompt(false)
    
    if (option === 'permanent') {
      // User click "Don't ask again"
      localStorage.setItem('lento_notification_prompt_dismissed', 'permanent')
    } else {
      // User click "Maybe later" - tanya lagi besok
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      localStorage.setItem('lento_notification_prompt_until', tomorrow.toISOString())
    }
  }

  const handleGranted = () => {
    setShouldShowPrompt(false)
    // Mark as granted so we don't show again
    localStorage.setItem('lento_notification_permission_granted', 'true')
  }

  return { 
    shouldShowPrompt, 
    handleDismiss, 
    handleGranted 
  }
}

/**
 * Track user engagement untuk smart prompt timing
 */
export function trackUserEngagement(action) {
  switch (action) {
    case 'habit_created':
      localStorage.setItem('has_created_habit', 'true')
      break
    case 'habit_completed':
      localStorage.setItem('has_completed_habit', 'true')
      break
    case 'journal_written':
      localStorage.setItem('has_written_journal', 'true')
      break
    case 'session_duration':
      // Track cumulative session duration
      const current = parseInt(localStorage.getItem('lento_session_duration') || '0')
      localStorage.setItem('lento_session_duration', (current + 1).toString())
      break
    default:
      break
  }
}
