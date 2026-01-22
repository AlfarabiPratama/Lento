/**
 * Haptic Feedback Utility with Accessibility Support
 * Respects prefers-reduced-motion for inclusive user experience
 */

export const haptics = {
  /**
   * Check if vibration should be triggered
   * Respects user's motion preferences
   */
  shouldVibrate: (): boolean => {
    return (
      'vibrate' in navigator &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  },

  /**
   * Light haptic feedback (10ms)
   * Use for: Subtle confirmations, hover effects
   */
  light: (): void => {
    if (haptics.shouldVibrate()) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium haptic feedback (20ms)
   * Use for: Button taps, selections
   */
  medium: (): void => {
    if (haptics.shouldVibrate()) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy haptic feedback (30-10-30ms pattern)
   * Use for: Important actions, errors
   */
  heavy: (): void => {
    if (haptics.shouldVibrate()) {
      navigator.vibrate([30, 10, 30]);
    }
  },

  /**
   * Success haptic pattern (20-10-20ms)
   * Use for: Successful completion, achievements
   */
  success: (): void => {
    if (haptics.shouldVibrate()) {
      navigator.vibrate([20, 10, 20]);
    }
  },

  /**
   * Error haptic pattern (50-30-50ms)
   * Use for: Errors, warnings, failed actions
   */
  error: (): void => {
    if (haptics.shouldVibrate()) {
      navigator.vibrate([50, 30, 50]);
    }
  },

  /**
   * Notification haptic pattern (10-5-10-5-10ms)
   * Use for: Incoming notifications, reminders
   */
  notification: (): void => {
    if (haptics.shouldVibrate()) {
      navigator.vibrate([10, 5, 10, 5, 10]);
    }
  },
};

// Type definitions
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'notification';

/**
 * Trigger haptic feedback by type
 */
export const triggerHaptic = (type: HapticType): void => {
  haptics[type]();
};
