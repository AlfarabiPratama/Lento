/**
 * SwipeableListItem Component
 * 
 * List item with swipe-to-reveal actions (delete, archive, edit, etc.)
 * with haptic feedback and smooth animations
 * 
 * @example
 * <SwipeableListItem
 *   onSwipeLeft={() => handleDelete(item.id)}
 *   leftAction={{ icon: IconTrash, label: 'Delete', color: 'danger' }}
 *   onSwipeRight={() => handleArchive(item.id)}
 *   rightAction={{ icon: IconArchive, label: 'Archive', color: 'primary' }}
 * >
 *   <YourItemContent />
 * </SwipeableListItem>
 */

import { useState, useRef, ReactNode } from 'react'
import { IconTrash, IconArchive, IconCheck } from '@tabler/icons-react'
import { haptics } from '../../utils/haptics'

interface SwipeAction {
  icon?: React.ElementType
  label: string
  color: 'danger' | 'primary' | 'success' | 'warning'
  bgClass?: string
}

interface SwipeableListItemProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: SwipeAction
  rightAction?: SwipeAction
  threshold?: number
  disabled?: boolean
  className?: string
}

const colorClasses = {
  danger: 'bg-red-500 text-white',
  primary: 'bg-teal-600 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-amber-500 text-white',
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = { label: 'Delete', color: 'danger' },
  rightAction = { label: 'Complete', color: 'success' },
  threshold = 80,
  disabled = false,
  className = '',
}) => {
  const [offsetX, setOffsetX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [actionTriggered, setActionTriggered] = useState<'left' | 'right' | null>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const itemRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || disabled) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = currentX - startX.current
    const deltaY = currentY - startY.current

    // Only allow horizontal swipes (prevent vertical scroll interference)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()

      // Apply resistance as you swipe further
      const maxSwipe = 150
      const resistance = Math.min(Math.abs(deltaX), maxSwipe)
      const easedDelta = deltaX > 0 ? resistance * 0.8 : -resistance * 0.8

      setOffsetX(easedDelta)

      // Trigger haptic feedback when crossing threshold
      if (
        Math.abs(easedDelta) > threshold &&
        Math.abs(offsetX) <= threshold
      ) {
        haptics.medium()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!isSwiping || disabled) return

    const absOffsetX = Math.abs(offsetX)

    // Check if threshold is met
    if (absOffsetX > threshold) {
      if (offsetX > 0 && onSwipeRight) {
        // Swipe right
        setActionTriggered('right')
        haptics.success()
        
        // Animate item out
        setOffsetX(300)
        await new Promise(resolve => setTimeout(resolve, 300))
        onSwipeRight()
      } else if (offsetX < 0 && onSwipeLeft) {
        // Swipe left
        setActionTriggered('left')
        haptics.success()
        
        // Animate item out
        setOffsetX(-300)
        await new Promise(resolve => setTimeout(resolve, 300))
        onSwipeLeft()
      }
    } else {
      // Reset position if threshold not met
      setOffsetX(0)
      haptics.light()
    }

    setIsSwiping(false)
  }

  const LeftIcon = leftAction.icon || IconTrash
  const RightIcon = rightAction.icon || IconCheck

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Right action (revealed when swiping left) */}
      {onSwipeLeft && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center justify-end px-6 ${
            leftAction.bgClass || colorClasses[leftAction.color]
          }`}
          style={{
            width: Math.abs(Math.min(offsetX, 0)),
            opacity: Math.min(Math.abs(offsetX) / threshold, 1),
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <LeftIcon size={20} stroke={2} />
            <span className="text-xs font-medium whitespace-nowrap">
              {leftAction.label}
            </span>
          </div>
        </div>
      )}

      {/* Left action (revealed when swiping right) */}
      {onSwipeRight && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center justify-start px-6 ${
            rightAction.bgClass || colorClasses[rightAction.color]
          }`}
          style={{
            width: Math.max(offsetX, 0),
            opacity: Math.min(offsetX / threshold, 1),
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <RightIcon size={20} stroke={2} />
            <span className="text-xs font-medium whitespace-nowrap">
              {rightAction.label}
            </span>
          </div>
        </div>
      )}

      {/* Swipeable content */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-surface relative z-10 transition-transform duration-200"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Simplified delete-only swipeable item
 */
export const SwipeToDelete: React.FC<{
  onDelete: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
}> = ({ onDelete, children, className, disabled }) => {
  return (
    <SwipeableListItem
      onSwipeLeft={onDelete}
      leftAction={{
        icon: IconTrash,
        label: 'Hapus',
        color: 'danger',
      }}
      className={className}
      disabled={disabled}
    >
      {children}
    </SwipeableListItem>
  )
}

/**
 * Complete/Delete swipeable item for tasks/habits
 */
export const SwipeToCompleteOrDelete: React.FC<{
  onComplete: () => void
  onDelete: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
}> = ({ onComplete, onDelete, children, className, disabled }) => {
  return (
    <SwipeableListItem
      onSwipeRight={onComplete}
      rightAction={{
        icon: IconCheck,
        label: 'Selesai',
        color: 'success',
      }}
      onSwipeLeft={onDelete}
      leftAction={{
        icon: IconTrash,
        label: 'Hapus',
        color: 'danger',
      }}
      className={className}
      disabled={disabled}
    >
      {children}
    </SwipeableListItem>
  )
}

/**
 * Archive/Delete swipeable item
 */
export const SwipeToArchiveOrDelete: React.FC<{
  onArchive: () => void
  onDelete: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
}> = ({ onArchive, onDelete, children, className, disabled }) => {
  return (
    <SwipeableListItem
      onSwipeRight={onArchive}
      rightAction={{
        icon: IconArchive,
        label: 'Arsip',
        color: 'primary',
      }}
      onSwipeLeft={onDelete}
      leftAction={{
        icon: IconTrash,
        label: 'Hapus',
        color: 'danger',
      }}
      className={className}
      disabled={disabled}
    >
      {children}
    </SwipeableListItem>
  )
}
