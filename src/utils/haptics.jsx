/**
 * Haptic Feedback Utility
 * 
 * Provides tactile feedback for user interactions
 * Uses Vibration API with fallbacks
 */

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported() {
  return 'vibrate' in navigator
}

/**
 * Get user preference for haptic feedback
 */
function isHapticEnabled() {
  const pref = localStorage.getItem('lento.preferences.hapticFeedback')
  return pref === null ? true : pref === 'true' // Default enabled
}

/**
 * Haptic feedback patterns
 */
export const HapticPattern = {
  // Light tap - for button presses
  LIGHT: [10],
  
  // Medium tap - for selections
  MEDIUM: [20],
  
  // Success - for completions
  SUCCESS: [10, 50, 10],
  
  // Warning - for errors
  WARNING: [30, 100, 30],
  
  // Celebration - for achievements
  CELEBRATION: [10, 30, 10, 30, 10, 50, 10],
  
  // Milestone - for big achievements
  MILESTONE: [20, 50, 20, 100, 20, 50, 20]
}

/**
 * Trigger haptic feedback
 * 
 * @param {number|number[]} pattern - Vibration duration(s) in ms
 * @returns {boolean} Whether vibration was triggered
 */
export function triggerHaptic(pattern = HapticPattern.LIGHT) {
  // Check if enabled
  if (!isHapticEnabled()) {
    return false
  }

  // Check support
  if (!isHapticSupported()) {
    return false
  }

  try {
    // Trigger vibration
    navigator.vibrate(pattern)
    return true
  } catch (error) {
    console.warn('Haptic feedback failed:', error)
    return false
  }
}

/**
 * Stop all haptic feedback
 */
export function stopHaptic() {
  if (isHapticSupported()) {
    navigator.vibrate(0)
  }
}

/**
 * React hook for haptic feedback
 * 
 * @returns {function} triggerHaptic function
 */
export function useHaptic() {
  return triggerHaptic
}

/**
 * Haptic button wrapper
 * Adds haptic feedback to any button/interactive element
 * 
 * Usage:
 * <HapticButton pattern={HapticPattern.LIGHT} onClick={...}>
 *   Click me
 * </HapticButton>
 */
export function HapticButton({ 
  pattern = HapticPattern.LIGHT,
  onClick,
  children,
  ...props 
}) {
  const handleClick = (e) => {
    triggerHaptic(pattern)
    onClick?.(e)
  }

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  )
}

/**
 * Set user preference for haptic feedback
 */
export function setHapticPreference(enabled) {
  localStorage.setItem('lento.preferences.hapticFeedback', String(enabled))
}

export default {
  isSupported: isHapticSupported,
  trigger: triggerHaptic,
  stop: stopHaptic,
  patterns: HapticPattern,
  setPreference: setHapticPreference
}
