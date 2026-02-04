/**
 * AnimatedStreakBadge - Pulsing flame icon for streak indicators
 * 
 * CSS-based animation for performance
 * Shows streak with animated flame effect
 */

import { IconFlame } from '@tabler/icons-react'

/**
 * AnimatedStreakBadge Component
 * 
 * @param {number} streak - Streak count
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} animate - Enable pulsing animation
 * @param {string} className - Additional classes
 */
export function AnimatedStreakBadge({ 
  streak, 
  size = 'md',
  animate = true,
  className = '' 
}) {
  if (!streak || streak === 0) return null

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  }

  // Milestone colors
  const getMilestoneStyle = () => {
    if (streak >= 100) {
      return {
        bg: 'bg-gradient-to-br from-purple-100 to-pink-100',
        text: 'text-purple-600',
        glow: 'shadow-purple-200'
      }
    }
    if (streak >= 30) {
      return {
        bg: 'bg-gradient-to-br from-orange-100 to-red-100',
        text: 'text-orange-600',
        glow: 'shadow-orange-200'
      }
    }
    if (streak >= 7) {
      return {
        bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
        text: 'text-orange-500',
        glow: 'shadow-yellow-200'
      }
    }
    return {
      bg: 'bg-warning/10',
      text: 'text-warning',
      glow: 'shadow-warning/20'
    }
  }

  const style = getMilestoneStyle()

  return (
    <div 
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        ${style.bg}
        ${animate ? 'animate-pulse-subtle' : ''}
        shadow-sm ${style.glow}
        ${className}
      `}
    >
      <IconFlame 
        size={iconSizes[size]} 
        className={`${style.text} ${animate ? 'animate-flicker' : ''}`}
      />
      <span className={`font-semibold ${style.text} ${sizeClasses[size]}`}>
        {streak} hari
      </span>
    </div>
  )
}

/**
 * StreakMilestone - Large milestone celebration badge
 * 
 * @param {number} streak - Streak milestone
 * @param {string} message - Celebration message
 */
export function StreakMilestone({ streak, message }) {
  return (
    <div className="text-center space-y-3 py-6">
      <div className="relative inline-block">
        {/* Glow effect */}
        <div className="absolute inset-0 animate-ping-slow">
          <IconFlame size={80} className="text-warning/30" />
        </div>
        
        {/* Main icon */}
        <IconFlame size={80} className="text-warning relative animate-flicker" />
      </div>
      
      <div className="space-y-1">
        <p className="text-3xl font-bold text-warning">
          {streak} Hari
        </p>
        <p className="text-base text-ink-muted">
          {message}
        </p>
      </div>
    </div>
  )
}

// Add custom animations to index.css or tailwind.config.js:
// @keyframes pulse-subtle {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.8; }
// }
// 
// @keyframes flicker {
//   0%, 100% { transform: scale(1); }
//   50% { transform: scale(1.1); }
// }
// 
// @keyframes ping-slow {
//   75%, 100% { transform: scale(2); opacity: 0; }
// }

export default AnimatedStreakBadge
