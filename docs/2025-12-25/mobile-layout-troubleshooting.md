# Mobile Layout Issues - Troubleshooting Guide

**Date:** 2025-12-25  
**Context:** Today page widget grid mobile responsiveness

## Problems Encountered

### 1. Content Cut Off by Bottom Navigation

**Symptom:** Widget content and FAB button were hidden behind the fixed bottom navigation bar on mobile devices.

**Root Cause:**

- Bottom navigation bar is `fixed` at bottom of screen (72px height)
- Main content area didn't have sufficient bottom padding to account for:
  - Navigation bar height
  - Safe area inset (iOS home indicator)
  - Breathing room for scrolling

**Solution:**

```jsx
// AppShell.jsx - Main content area
<main className="flex-1 min-h-0 overflow-y-auto pb-[calc(var(--bottom-nav-h)+var(--safe-area-bottom))] lg:pb-6">
```

```css
/* index.css - CSS variables */
:root {
  --bottom-nav-h: 72px;
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}
```

```jsx
// QuickCaptureFAB.jsx - FAB positioning
<button className="... bottom-[calc(var(--bottom-nav-h)+16px+env(safe-area-inset-bottom,0px))]">
```

---

### 2. Asymmetric Left/Right Padding

**Symptom:** Widget grid appeared to have more spacing on the left than the right, looking off-center.

**Root Cause (After Investigation with Browser Subagent):**
Grid was switching to 2-column layout at `480px` breakpoint, but the minimum required width was **500px**:

- 2 widgets @ ~230px each = 460px
- Gap between columns = 8px
- Container padding = 16px (left) + 16px (right) = 32px
- **Total = 500px**

On screens between **480px-499px** (many mobile devices), the content overflowed to the right, causing the right padding to be "cut off" and invisible, while the left padding remained visible.

**Investigation Method:**

```javascript
// Browser DevTools JavaScript inspection
const grid = document.querySelector('.grid.grid-cols-2');
const parent = grid.parentElement;
const rect = grid.getBoundingClientRect();

// Measured values at 500px viewport:
// - Grid width: 468px (2 × 230px + 8px gap)
// - Parent padding: 16px left + 16px right
// - Total needed: 500px
// Viewport: 375px-499px → overflow!
```

**Solution:**
Changed breakpoint from `min-[480px]` to `min-[520px]` to add safety margin:

```jsx
// TodayWidgetGrid.jsx
<div className="grid gap-2 sm:gap-4 grid-cols-1 min-[520px]:grid-cols-2">
```

**Why 520px?**

- Needed width: 500px
- Safety margin: 20px
- New breakpoint: 520px ensures no overflow

---

### 3. Viewport Height Issues (h-screen vs dvh)

**Symptom:** Content height calculations were incorrect on mobile, especially when address bar appears/disappears.

**Root Cause:**

- Traditional `100vh` includes address bar in calculation on mobile
- When address bar is visible, actual viewport is smaller
- This causes bottom content to be pushed below visible area

**Solution:**

```jsx
// Use dynamic viewport height (dvh)
<div className="min-h-[100dvh]">  // NOT min-h-screen

// Also ensure proper height cascade
html, body, #root { height: 100%; }
```

---

### 4. Flex Overflow Not Working (min-h-0)

**Symptom:** Scrolling didn't work properly inside flex containers; content overflowed instead.

**Root Cause:**
In CSS Flexbox, flex children have `min-height: auto` by default, which prevents them from shrinking below their content size. This breaks `overflow-y: auto`.

**Solution:**

```jsx
<main className="flex-1 min-h-0 overflow-y-auto ...">
```

**Critical**: `min-h-0` forces the flex child to allow scrolling.

---

### 5. Widget Readability on Mobile

**Symptom:** Widgets were too small and hard to read on mobile devices.

**Root Cause:**
Initial implementation made widgets "super compact" (p-2, text-tiny, 10-12px icons) to fit 4 widgets on small screens.

**Solution:**
Moderate size increase for better UX while maintaining compactness:

| Element | Before | After |
|---------|--------|-------|
| Padding | `p-2` (8px) | `p-3` (12px) |
| Text | `text-tiny` (11px) | `text-small` (13px) |
| Icons | 10-12px | 14px |
| Title | `text-tiny` | `text-small` |

```jsx
// WidgetCard.jsx - responsive sizes
<div className="card p-3 sm:p-4 space-y-2 sm:space-y-3">
  <Icon size={14} className="sm:hidden" />  // mobile: 14px
  <Icon size={18} className="hidden sm:block" />  // desktop: 18px
</div>
```

---

## Best Practices to Prevent Similar Issues

### 1. Always Use Modern Viewport Units on Mobile

- ❌ `min-h-screen` or `100vh`
- ✅ `min-h-[100dvh]` (dynamic viewport height)

### 2. Fixed Bottom Elements Require Calculated Padding

```jsx
// Define heights as CSS variables
:root {
  --bottom-nav-h: 72px;
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}

// Use in calculations
pb-[calc(var(--bottom-nav-h)+var(--safe-area-bottom))]
```

### 3. Test Breakpoints with Actual Content Width

Don't just pick arbitrary breakpoints (480px, 640px). Calculate:

1. Measure total content width needed
2. Add padding/margins
3. Set breakpoint 10-20px higher for safety

### 4. Always Add min-h-0 to Scrollable Flex Children

```jsx
<div className="flex flex-col">
  <main className="flex-1 min-h-0 overflow-y-auto">
```

### 5. Mobile-First Responsive Design

```jsx
// Start with mobile sizes, scale up for desktop
className="text-small sm:text-body"  // 13px → 15px
className="p-3 sm:p-4"  // 12px → 16px
className="grid-cols-1 min-[520px]:grid-cols-2"  // 1 col → 2 col
```

### 6. Use Browser DevTools for Debugging

When layout looks asymmetric:

1. Open DevTools → Elements
2. Inspect computed styles (padding, margin, width)
3. Use box model visualization
4. Measure actual pixel positions with `getBoundingClientRect()`

### 7. Viewport Meta Tag Must Include viewport-fit

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

This enables `env(safe-area-inset-*)` to work on iOS devices with notches.

---

## Key Learnings

1. **Asymmetric padding is usually overflow, not actual padding difference**
   - Investigate if content width exceeds viewport
   - Check if elements are overflowing off-screen

2. **Safe areas matter on modern devices**
   - iPhone home indicator
   - Notches and rounded corners
   - Always use `env(safe-area-inset-*)` for fixed elements

3. **Breakpoints need breathing room**
   - Don't set breakpoint at exact minimum width
   - Add 10-20px safety margin

4. **Flex + Scroll requires min-h-0**
   - This is a common "gotcha" in flexbox layouts
   - Without it, overflow won't work as expected

5. **dvh is critical for mobile**
   - Accounts for browser chrome (address bar, etc.)
   - More accurate than vh on mobile devices

---

## Files Modified

1. `src/index.css` - Added CSS variables for nav height and safe area
2. `src/components/AppShell.jsx` - Fixed main content padding and viewport height
3. `src/components/capture/QuickCaptureFAB.jsx` - Repositioned FAB above bottom nav
4. `src/components/today/organisms/TodayWidgetGrid.jsx` - Changed breakpoint to 520px
5. `src/components/today/atoms/WidgetCard.jsx` - Increased mobile widget sizes
6. `src/components/today/widgets/*.jsx` - Updated all 4 widget components with better sizes

---

## Testing Checklist for Mobile Layouts

- [ ] Test on actual devices (iPhone SE, iPhone 13, Android phones)
- [ ] Test in Chrome DevTools mobile emulation (375px, 390px, 414px widths)
- [ ] Scroll to bottom and verify no content is cut off
- [ ] Check FAB/fixed elements don't overlap content
- [ ] Verify left and right padding appear equal
- [ ] Test portrait and landscape orientations
- [ ] Test with browser address bar visible and hidden
- [ ] Inspect computed styles in DevTools to verify actual values

---

## Resources

- [MDN: env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [MDN: Viewport units (dvh, svh, lvh)](https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport)
- [CSS Tricks: Flexbox min-height issue](https://css-tricks.com/flexbox-truncated-text/)
- [Web.dev: Safe area insets](https://web.dev/viewport-fit/)
