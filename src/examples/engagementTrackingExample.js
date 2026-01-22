/**
 * Example: Tracking User Engagement untuk Smart Permission Request
 * 
 * Integrate ke berbagai actions user untuk trigger permission prompt
 * pada timing yang tepat
 */

import { trackUserEngagement } from '../hooks/useSmartPermissionRequest'

// ==================== Example 1: Track Habit Creation ====================

// Di src/hooks/useHabits.js atau src/lib/habits.js
export async function createHabit(habitData) {
  // ... existing habit creation logic ...
  
  const newHabit = await db.habits.add(habitData)
  
  // Track engagement
  trackUserEngagement('habit_created')
  
  return newHabit
}

// ==================== Example 2: Track Habit Completion ====================

// Di src/hooks/useHabits.js
export function toggleHabitCheck(habitId) {
  // ... existing check logic ...
  
  const checked = !isChecked(habitId)
  
  if (checked) {
    // Track when user completes a habit
    trackUserEngagement('habit_completed')
  }
  
  return checked
}

// ==================== Example 3: Track Journal Writing ====================

// Di src/pages/Journal.jsx atau src/hooks/useJournals.js
export async function saveJournal(journalData) {
  // ... existing journal save logic ...
  
  const saved = await db.journals.add(journalData)
  
  // Track engagement
  trackUserEngagement('journal_written')
  
  return saved
}

// ==================== Example 4: Track Session Duration ====================

// Di src/App.jsx atau src/main.jsx
// Track setiap 1 menit user pakai app

import { useEffect } from 'react'
import { trackUserEngagement } from './hooks/useSmartPermissionRequest'

export function useSessionTracking() {
  useEffect(() => {
    const interval = setInterval(() => {
      trackUserEngagement('session_duration')
    }, 60000) // Setiap 1 menit
    
    return () => clearInterval(interval)
  }, [])
}

// Usage di App.jsx:
// function App() {
//   useSessionTracking()
//   return <YourAppContent />
// }

// ==================== Example 5: Manual Trigger ====================

// Jika ingin trigger permission prompt secara manual
// Misalnya dari Settings atau onboarding

import { useState } from 'react'
import { NotificationPermissionPrompt } from '../components/NotificationPermissionPrompt'

export function SettingsNotificationButton() {
  const [showPrompt, setShowPrompt] = useState(false)
  
  const handleEnableNotifications = () => {
    setShowPrompt(true)
  }
  
  return (
    <>
      <button onClick={handleEnableNotifications}>
        Enable Notifications
      </button>
      
      {showPrompt && (
        <NotificationPermissionPrompt 
          onClose={(granted) => {
            setShowPrompt(false)
            if (granted) {
              console.log('Notification permission granted!')
            }
          }}
        />
      )}
    </>
  )
}

// ==================== Example 6: Listen to Navigation from SW ====================

// Di src/App.jsx atau src/pages/[route].jsx
// Handle navigation dari notification click

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useNotificationNavigation() {
  const navigate = useNavigate()
  
  useEffect(() => {
    const handleSWMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE') {
        const route = event.data.route
        const data = event.data.data
        
        console.log('[App] Navigate from notification:', route, data)
        
        // Navigate ke route dari notification
        navigate(route)
        
        // Optional: Show related data
        // Misalnya highlight specific habit ID
        if (data?.entityId) {
          // Do something with entityId
        }
      }
    }
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage)
    }
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage)
      }
    }
  }, [navigate])
}

// Usage di App.jsx:
// function App() {
//   useNotificationNavigation()
//   return <YourAppContent />
// }
