# Mobile Gestures Implementation Guide

## Overview

Native-like mobile gestures implementation with pull-to-refresh, swipe-to-delete, and haptic feedback for an enhanced mobile experience.

**Last Updated:** January 23, 2026  
**Status:** ✅ Production Ready

---

## Features Implemented

✅ **Pull-to-Refresh** - Native-like pull gesture for refreshing content  
✅ **Swipe-to-Delete** - Swipe left to reveal delete action  
✅ **Swipe-to-Complete** - Swipe right for completion actions  
✅ **Haptic Feedback** - Vibration feedback for user actions  
✅ **Accessibility** - Respects `prefers-reduced-motion`  
✅ **Smooth Animations** - 60fps with resistance physics  

---

## Core Components

### 1. Pull-to-Refresh

**Location:** `src/components/ui/PullToRefresh.tsx`

Pull-down gesture to refresh content with visual feedback.

**Usage:**
```tsx
import { PullToRefresh } from '../components/ui/PullToRefresh'
import { haptics } from '../utils/haptics'

function MyPage() {
  const handleRefresh = async () => {
    await fetchLatestData()
    haptics.light()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <YourContent />
    </PullToRefresh>
  )
}
```

**Props:**
- `onRefresh: () => Promise<void>` - Async function called when refreshing
- `threshold?: number` - Pull distance to trigger (default: 80px)
- `maxPullDistance?: number` - Maximum pull distance (default: 120px)
- `disabled?: boolean` - Disable pull-to-refresh
- `className?: string` - Additional CSS classes

**Features:**
- Resistance effect (harder to pull as you go further)
- Visual spinner with rotation based on pull distance
- Only activates when at top of scroll
- Prevents interference with normal scrolling
- "Release to refresh" indicator when threshold met

**Implemented In:**
- ✅ Today page
- ✅ Habits page
- ✅ Books page
- ✅ Finance page

---

### 2. Swipeable List Items

**Location:** `src/components/ui/SwipeableListItem.tsx`

Swipe left/right to reveal hidden actions (delete, complete, archive).

**Usage:**

#### Basic Swipe-to-Delete
```tsx
import { SwipeToDelete } from '../components/ui/SwipeableListItem'

<SwipeToDelete onDelete={() => handleDelete(item.id)}>
  <YourItemContent />
</SwipeToDelete>
```

#### Complete or Delete
```tsx
import { SwipeToCompleteOrDelete } from '../components/ui/SwipeableListItem'

<SwipeToCompleteOrDelete
  onComplete={() => handleComplete(item.id)}
  onDelete={() => handleDelete(item.id)}
>
  <YourItemContent />
</SwipeToCompleteOrDelete>
```

#### Custom Actions
```tsx
import { SwipeableListItem } from '../components/ui/SwipeableListItem'
import { IconArchive, IconTrash } from '@tabler/icons-react'

<SwipeableListItem
  onSwipeRight={() => handleArchive(item.id)}
  rightAction={{
    icon: IconArchive,
    label: 'Arsip',
    color: 'primary'
  }}
  onSwipeLeft={() => handleDelete(item.id)}
  leftAction={{
    icon: IconTrash,
    label: 'Hapus',
    color: 'danger'
  }}
>
  <YourItemContent />
</SwipeableListItem>
```

**Props:**
- `onSwipeLeft?: () => void` - Action when swiping left
- `onSwipeRight?: () => void` - Action when swiping right
- `leftAction?: SwipeAction` - Config for left action
- `rightAction?: SwipeAction` - Config for right action
- `threshold?: number` - Swipe distance to trigger (default: 80px)
- `disabled?: boolean` - Disable swipe
- `className?: string` - Additional CSS classes

**SwipeAction Interface:**
```typescript
interface SwipeAction {
  icon?: React.ElementType
  label: string
  color: 'danger' | 'primary' | 'success' | 'warning'
  bgClass?: string // Custom background class
}
```

**Features:**
- Resistance effect as you swipe
- Haptic feedback at threshold and on trigger
- Smooth animations (60fps)
- Automatically animates item out after action
- Visual action preview with icon and label
- Opacity fade based on swipe distance

**Implemented In:**
- ✅ Journal entries (swipe-to-delete)
- ⏳ Habits list (pending)
- ⏳ Finance transactions (pending)

---

### 3. Swipe Gesture Hook

**Location:** `src/hooks/useSwipeGesture.ts`

Reusable hook for detecting swipe gestures.

**Usage:**
```tsx
import { useSwipeGesture } from '../hooks/useSwipeGesture'
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()
  
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => navigate('/next'),
    onSwipeRight: () => navigate('/prev'),
    threshold: 50,
    preventDefaultTouchMove: true
  })

  return (
    <div {...swipeHandlers}>
      Swipeable content
    </div>
  )
}
```

**Config:**
```typescript
interface SwipeConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number // default: 50px
  preventDefaultTouchMove?: boolean // default: false
}
```

**Returns:**
```typescript
interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}
```

**Features:**
- Detects horizontal and vertical swipes
- Configurable threshold
- Optional scroll prevention
- Dominant direction detection
- TypeScript support

---

### 4. Haptic Feedback

**Location:** `src/utils/haptics.ts`

Vibration patterns for user feedback.

**Usage:**
```typescript
import { haptics } from '../utils/haptics'

// Light tap (10ms) - subtle confirmations
haptics.light()

// Medium tap (20ms) - button presses
haptics.medium()

// Heavy tap (30-10-30ms) - important actions
haptics.heavy()

// Success pattern (20-10-20ms)
haptics.success()

// Error pattern (50-30-50ms)
haptics.error()

// Notification pattern (10-5-10-5-10ms)
haptics.notification()
```

**Features:**
- Respects `prefers-reduced-motion`
- Falls back gracefully on unsupported devices
- Multiple predefined patterns
- TypeScript support

**Accessibility:**
```typescript
// Automatically checks user preference
haptics.shouldVibrate() // false if prefers-reduced-motion: reduce
```

**When to Use:**
- ✅ Success actions (habit check-in, form submit)
- ✅ Error actions (failed submission, deletion)
- ✅ Button taps on primary actions
- ✅ Threshold crossing in gestures
- ❌ Every tiny interaction (overwhelming)
- ❌ Passive updates (data loading)

---

## Implementation Examples

### Pull-to-Refresh in Habits Page

**Location:** `src/pages/Habits.jsx`

```tsx
import { PullToRefresh } from '../components/ui/PullToRefresh'
import { haptics } from '../utils/haptics'

function Habits() {
  const handleRefresh = async () => {
    // Data already reactive via hooks
    await new Promise(resolve => setTimeout(resolve, 500))
    haptics.light()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        {/* Habits content */}
      </div>
    </PullToRefresh>
  )
}
```

### Swipe-to-Delete in Journal

**Location:** `src/pages/Journal.jsx`

```tsx
import { SwipeToDelete } from '../components/ui/SwipeableListItem'
import { haptics } from '../utils/haptics'

function Journal() {
  const { journals, remove } = useJournals()
  const { showToast } = useToast()

  const handleDeleteJournal = async (id) => {
    try {
      await remove(id)
      haptics.success()
      showToast('success', 'Jurnal dihapus')
    } catch (err) {
      haptics.error()
      showToast('error', 'Gagal menghapus jurnal')
    }
  }

  return (
    <div className="space-y-3">
      {journals.map((entry) => (
        <SwipeToDelete
          key={entry.id}
          onDelete={() => handleDeleteJournal(entry.id)}
        >
          <div className="card">
            {/* Journal entry content */}
          </div>
        </SwipeToDelete>
      ))}
    </div>
  )
}
```

### Haptic Feedback on Habit Check-in

**Location:** `src/pages/Habits.jsx`

```tsx
import { haptics } from '../utils/haptics'

const handleToggle = async (habitId) => {
  try {
    if (isChecked(habitId)) {
      await uncheck(habitId)
      showToast('info', `Check-in "${habit?.name}" dibatalkan`)
    } else {
      await checkIn(habitId)
      haptics.success() // ✨ Native-like feedback
      showToast('success', `✓ ${habit?.name} • Hari ini selesai!`)
    }
  } catch (err) {
    haptics.error()
    showToast('error', 'Gagal mengupdate check-in')
  }
}
```

---

## Best Practices

### Pull-to-Refresh

**DO:**
- ✅ Use for content that updates frequently (today, habits, finance)
- ✅ Keep threshold at 80px (thumb-friendly)
- ✅ Show clear "Release to refresh" indicator
- ✅ Provide haptic feedback on completion

**DON'T:**
- ❌ Use on modals or overlays
- ❌ Use on pages with critical forms (accidental refresh)
- ❌ Set threshold too low (accidental triggers)
- ❌ Make it mandatory (provide button alternative)

### Swipe Actions

**DO:**
- ✅ Swipe left for destructive actions (delete)
- ✅ Swipe right for positive actions (complete, archive)
- ✅ Show clear icon + label in revealed area
- ✅ Require threshold to prevent accidental triggers
- ✅ Animate item out after action
- ✅ Provide alternative (button) for desktop/accessibility

**DON'T:**
- ❌ Use for primary actions (make them visible)
- ❌ Hide critical functions only in swipe
- ❌ Use on nested scrollable containers
- ❌ Have opposite swipe directions for similar actions

### Haptic Feedback

**DO:**
- ✅ Use success pattern for positive completions
- ✅ Use error pattern for failures
- ✅ Use light feedback for subtle confirmations
- ✅ Respect `prefers-reduced-motion`
- ✅ Combine with visual feedback

**DON'T:**
- ❌ Vibrate on every interaction (annoying)
- ❌ Use heavy patterns for minor actions
- ❌ Ignore accessibility preferences
- ❌ Use as replacement for visual feedback

---

## Performance Considerations

### Touch Event Optimization

1. **Passive Listeners**
   ```typescript
   window.addEventListener('touchstart', handler, { passive: true })
   ```

2. **Prevent Only When Needed**
   ```typescript
   if (isHorizontalSwipe && deltaX > threshold / 2) {
     e.preventDefault() // Only prevent when swiping
   }
   ```

3. **CSS Transforms (GPU)**
   ```css
   transform: translateX(${offsetX}px); /* Hardware accelerated */
   ```

4. **RequestAnimationFrame for Smooth Updates**
   ```typescript
   requestAnimationFrame(() => {
     setOffsetX(calculatedOffset)
   })
   ```

### Bundle Impact

```
SwipeableListItem.tsx: ~6KB (minified + gzip: ~2KB)
PullToRefresh.tsx: ~4KB (minified + gzip: ~1.5KB)
useSwipeGesture.ts: ~2KB (minified + gzip: ~0.8KB)
haptics.ts: ~1KB (minified + gzip: ~0.4KB)
───────────────────────────────────────────────
Total: ~13KB (minified + gzip: ~4.7KB)
```

**Impact:** Minimal - less than 1% of total bundle size.

---

## Browser/Device Compatibility

### Pull-to-Refresh
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+
- ✅ Touch devices only (gracefully disabled on desktop)

### Swipe Gestures
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+
- ✅ Touch devices only

### Haptic Feedback (Vibration API)
- ✅ Android Chrome 60+
- ✅ Android Firefox 62+
- ❌ iOS Safari (no vibration API)
- ⚠️ Falls back gracefully on unsupported devices

**Note:** iOS devices don't support the Vibration API, but gestures still work without haptic feedback.

---

## Testing Checklist

### Pull-to-Refresh
- [ ] Pull from top → Refreshes content
- [ ] Pull from middle → Does nothing
- [ ] Pull < 80px → Snaps back
- [ ] Pull > 80px → Shows "Release to refresh"
- [ ] Release > 80px → Triggers refresh
- [ ] Spinner animates during refresh
- [ ] Works on all implemented pages

### Swipe-to-Delete
- [ ] Swipe left reveals delete action
- [ ] Swipe < threshold → Snaps back
- [ ] Swipe > threshold → Triggers delete
- [ ] Item animates out after delete
- [ ] Haptic feedback at threshold
- [ ] Opacity increases with swipe distance
- [ ] Works in journal entries

### Haptic Feedback
- [ ] Success haptic on habit check-in
- [ ] Error haptic on failed actions
- [ ] Light haptic on pull-to-refresh
- [ ] Medium haptic at swipe threshold
- [ ] No vibration if prefers-reduced-motion
- [ ] Falls back gracefully on iOS

### Accessibility
- [ ] Works with screen readers
- [ ] Alternative buttons visible on desktop
- [ ] Respects prefers-reduced-motion
- [ ] Touch targets ≥ 44px
- [ ] Visual feedback accompanies haptics

---

## Troubleshooting

### Pull-to-Refresh not working

**Check:**
1. Is window at top of scroll? (scrollY === 0)
2. Is component wrapped correctly?
3. Check browser console for errors
4. Try on actual mobile device (not just devtools)

### Swipe not triggering

**Check:**
1. Is threshold being met? (console.log offsetX)
2. Is there a parent scroll container interfering?
3. Check if disabled prop is set
4. Try reducing threshold for testing

### Haptic feedback not working

**Check:**
1. Device supports Vibration API? (iOS doesn't)
2. User has prefers-reduced-motion? (check settings)
3. Permission granted in browser?
4. Try on different browser/device

### Performance issues

**Check:**
1. Using CSS transforms (not left/top)?
2. Touch events set to passive where possible?
3. Too many items rendering? (virtualize list)
4. Animations at 60fps? (use Chrome DevTools)

---

## Future Enhancements

### Planned Features
- [ ] Long-press context menus
- [ ] Pinch-to-zoom for images
- [ ] Drag-and-drop reordering
- [ ] Swipe between pages (carousel)
- [ ] Shake-to-undo
- [ ] Double-tap actions

### Potential Improvements
- [ ] Undo toast after swipe-to-delete
- [ ] Customizable haptic patterns
- [ ] Gesture recorder for testing
- [ ] Visual gesture training on first use
- [ ] Analytics tracking for gesture usage

---

## Related Documentation

- [PWA Implementation Guide](./pwa-implementation-guide.md)
- [Form Validation Guide](./form-validation-guide.md)
- [UI/UX Improvement Roadmap](./ui-ux-improvement-roadmap.md)

---

**Contributors:** Lento Team  
**Version:** 1.0.0  
**License:** MIT
