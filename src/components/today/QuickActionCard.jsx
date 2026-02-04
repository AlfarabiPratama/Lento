/**
 * QuickActionCard - Reusable card component for 2x2 Quick Actions Grid
 * 
 * Features:
 * - Consistent design across all action cards
 * - 48x48 minimum tap target
 * - Progress indicators
 * - Loading states
 * - Accessible
 */

import { IconPlus } from '@tabler/icons-react'

/**
 * QuickActionCard Component
 * 
 * @param {string} title - Card title (e.g., "Kebiasaan")
 * @param {string} subtitle - Card subtitle/value (e.g., "2/5 selesai")
 * @param {string} icon - Icon component
 * @param {string} iconBg - Icon background color (e.g., "bg-orange-100")
 * @param {string} iconColor - Icon text color (e.g., "text-orange-600")
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} progressColor - Progress bar gradient (e.g., "from-orange-400 to-orange-500")
 * @param {string} badge - Optional badge text (e.g., "40%")
 * @param {string} footer - Optional footer text (e.g., "3 hari streak")
 * @param {function} onClick - Click handler
 * @param {function} onQuickAdd - Quick add action handler
 * @param {boolean} isLoading - Loading state
 * @param {ReactNode} skeleton - Skeleton component for loading
 */
export function QuickActionCard({
  title,
  subtitle,
  icon: Icon,
  iconBg = 'bg-primary/10',
  iconColor = 'text-primary',
  progress = null,
  progressColor = 'from-primary/60 to-primary',
  badge = null,
  footer = null,
  onClick,
  onQuickAdd = null,
  isLoading = false,
  skeleton = null,
  className = ''
}) {
  if (isLoading && skeleton) {
    return skeleton
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative group
        bg-surface border border-line rounded-2xl
        p-4
        hover:border-primary/30 hover:shadow-sm
        transition-all duration-200
        text-left
        w-full min-h-[140px]
        flex flex-col
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={iconColor} />
          </div>
          <div className="flex-1">
            <p className="text-tiny text-ink-muted">{title}</p>
            {badge && (
              <span className="inline-block mt-0.5 text-xs font-medium text-ink">{badge}</span>
            )}
          </div>
        </div>

        {/* Quick Add Button */}
        {onQuickAdd && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onQuickAdd()
            }}
            className="
              w-8 h-8 flex items-center justify-center 
              rounded-lg hover:bg-primary/10 
              transition-colors flex-shrink-0
            "
            aria-label={`Tambah ${title}`}
          >
            <IconPlus size={16} className="text-primary" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-base font-semibold text-ink mb-1">
          {subtitle}
        </p>
        {footer && (
          <p className="text-xs text-ink-muted">
            {footer}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== null && (
        <div className="mt-3">
          <div className="h-1.5 bg-base-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </button>
  )
}

/**
 * QuickActionCardSkeleton - Loading state for QuickActionCard
 */
export function QuickActionCardSkeleton() {
  return (
    <div className="bg-surface border border-line rounded-2xl p-4 min-h-[140px] animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-base-200" />
          <div className="space-y-1">
            <div className="h-3 w-16 bg-base-200 rounded" />
            <div className="h-3 w-10 bg-base-200 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-base-200" />
      </div>

      {/* Content */}
      <div className="space-y-2 mb-3">
        <div className="h-5 w-20 bg-base-200 rounded" />
        <div className="h-3 w-24 bg-base-200 rounded" />
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-base-200 rounded-full" />
    </div>
  )
}

export default QuickActionCard
