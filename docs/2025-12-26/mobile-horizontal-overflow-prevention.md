# Mobile Layout: Preventing Horizontal Overflow

**Date**: 2025-12-26  
**Context**: Books page horizontal overflow causing button to be pushed off-screen

---

## Problem Summary

On mobile devices (390px viewport), the "Tambah Buku" button was invisible because the entire page content was **457px wide**, pushing the button off-screen to the right (X position: 421px).

### Visual Evidence

![Browser Debug Recording - Button Off-Screen](file:///C:/Users/Alfarabi/.gemini/antigravity/brain/7d531fd6-a7c0-4c5b-8913-bcdb68318b08/books_verify_fix_1766686727309.webp)

---

## Root Cause

### The Chain Reaction

1. **Wide Filter Buttons** (458px)
   - Filter row: `Semua (0) | TBR (0) | Reading (0) | Finished (0)`
   - Natural width of all buttons + gaps = 458px

2. **Parent Stretching**
   - Filter container had `overflow-x-auto` but NO width constraint
   - Instead of scrolling, it stretched its parent to 458px
   - Parent (`.space-y-6`) had no `width` constraint → expanded to fit child

3. **Button Displacement**
   - Header uses `flex justify-between`
   - Button positioned at far right of 458px container
   - 458px > 390px viewport → button invisible

4. **Why `overflow-x-hidden` Didn't Work**
   - Only hides the overflow visually
   - Doesn't prevent layout from stretching
   - Button still positioned at X=421px (in hidden area)

---

## The Solution (Proven by Browser Testing)

### 3 Critical Fixes

#### 1. Root Container: Force Width Constraint

**File**: `src/pages/Books.jsx`, `src/pages/BookDetail.jsx`

```jsx
// ❌ BEFORE - No width constraint
<div className="space-y-6">

// ✅ AFTER - Constrained to parent width
<div className="w-full min-w-0 space-y-6">
```

**Why This Works**:

- `w-full` → Container takes 100% of parent width (358px after padding)
- `min-w-0` → **Critical!** Allows flex children to shrink below content size
  - Default: `min-width: auto` prevents shrinking
  - With `min-w-0`: Children can shrink, enabling scroll

#### 2. Filter Container: Respect Parent Boundaries

**File**: `src/components/books/organisms/BooksList.jsx`

```jsx
// ❌ BEFORE - Stretches parent
<div className="flex gap-2 overflow-x-auto pb-2">

// ✅ AFTER - Scrolls within parent
<div className="flex gap-2 overflow-x-auto pb-2 w-full">
```

**Why This Works**:

- `w-full` → Container can't exceed parent width
- `overflow-x-auto` → Now triggers scroll instead of stretch
- Filter buttons scroll horizontally within viewport

#### 3. Header Layout: Flexible Text, Fixed Button

```jsx
<div className="flex items-center justify-between gap-3">
    <div className="min-w-0 flex-1">  {/* Can shrink if needed */}
        <h1>Library Buku</h1>
    </div>
    <button className="flex-shrink-0">  {/* Never shrinks */}
        <IconPlus />
    </button>
</div>
```

---

## How We Found This (Debugging Process)

### 1. Browser Subagent Investigation

Used automated browser testing to:

```javascript
// Measured actual dimensions
const root = document.querySelector('.space-y-6');
const header = document.querySelector('.flex.items-center.justify-between');
const button = document.querySelector('button[aria-label="Tambah Buku"]');

console.log({
    rootWidth: root.getBoundingClientRect().width,      // 457.5px ❌
    buttonPosition: button.getBoundingClientRect().x,   // 421px ❌
    viewportWidth: window.innerWidth                    // 390px ✅
});
```

**Finding**: Content was 67px wider than viewport!

### 2. Manual Fix Test

Applied inline styles to verify solution:

```javascript
root.style.width = '100%';
root.style.minWidth = '0';

// Result:
// - Root width: 358px (viewport - padding) ✅
// - Button visible at right edge ✅
```

### 3. Applied to Source Code

Translated proven inline styles to Tailwind classes and deployed.

---

## Prevention Checklist

Use this checklist when creating new pages to prevent horizontal overflow:

### ✅ Page Root Container

```jsx
// Always use these classes on page root:
<div className="w-full min-w-0 space-y-6">
```

- [ ] Has `w-full` to constrain to parent
- [ ] Has `min-w-0` to allow flex shrinking
- [ ] Never uses fixed widths (e.g., `w-96`)

### ✅ Horizontal Scrollable Elements

```jsx
// For filter rows, button groups, tabs:
<div className="flex gap-2 overflow-x-auto w-full">
```

- [ ] Has `w-full` to respect parent
- [ ] Has `overflow-x-auto` to enable scroll
- [ ] Children have `whitespace-nowrap` if text
- [ ] Children have `flex-shrink-0` if needed

### ✅ Header with Right-Aligned Button

```jsx
<div className="flex items-center justify-between">
    <div className="min-w-0 flex-1">  {/* Text container */}
        <h1>Title</h1>
    </div>
    <button className="flex-shrink-0">  {/* Button */}
        Icon/Text
    </button>
</div>
```

- [ ] Text container: `min-w-0 flex-1` (can shrink)
- [ ] Button: `flex-shrink-0` (never shrinks)
- [ ] Gap between elements: `gap-3` or similar

### ✅ Search Input

```jsx
<input className="w-full ..." />
```

- [ ] Always has `w-full` class
- [ ] Never has fixed width

### ✅ AppShell Integration

Check that AppShell provides:

- [ ] Padding wrapper: `px-4 py-5` on mobile
- [ ] Max width constraint: `lg:max-w-content`
- [ ] Bottom spacing: `pb-[calc(nav-height + safe-area)]`

Pages should NOT duplicate these - trust the AppShell!

---

## Debugging Similar Issues

If you encounter layout pushed off-screen on mobile:

### Step 1: Visual Inspection

```javascript
// Run in browser console
const root = document.querySelector('.space-y-6');
const wide = Array.from(document.querySelectorAll('*'))
    .filter(el => el.getBoundingClientRect().width > window.innerWidth);

console.log({
    viewport: window.innerWidth,
    rootWidth: root.getBoundingClientRect().width,
    wideElements: wide.map(el => ({
        tag: el.tagName,
        class: el.className,
        width: el.getBoundingClientRect().width
    }))
});
```

### Step 2: Check Computed Styles

In DevTools:

1. Inspect the "invisible" element
2. Check Computed → Position (is X > viewport width?)
3. Check parent elements for:
   - `width` or `max-width` missing
   - `min-width: auto` preventing shrink
   - `overflow-x: hidden` masking the problem

### Step 3: Test Manual Fix

```javascript
// Force constraints inline
const root = document.querySelector('.space-y-6');
root.style.width = '100%';
root.style.minWidth = '0';

// Check if problem fixed
const button = document.querySelector('button[aria-label="Tambah Buku"]');
console.log('Button visible:', button.getBoundingClientRect().x < window.innerWidth);
```

If manual fix works → Apply equivalent Tailwind classes in source.

---

## CSS Properties Explained

### `width: 100%` vs `max-width: 100%`

```css
/* width: 100% (w-full) */
.container { width: 100%; }
/* Forces element to exactly parent width */
/* Use for: Containers that should fill available space */

/* max-width: 100% (max-w-full) */
.container { max-width: 100%; }
/* Allows element to be smaller but caps at parent width */
/* Use for: Content that might be naturally narrower */
```

**For mobile layouts**: Use `w-full` to prevent stretch!

### `min-width: 0` (Critical for Flex!)

```css
/* Default flex child */
.flex-child { min-width: auto; }
/* Can't shrink below content size → causes overflow */

/* With min-w-0 */
.flex-child { min-width: 0; }
/* Can shrink below content → enables scroll */
```

**Why This Matters**:

- Flex items default to `min-width: auto`
- If child content is wide (e.g., 458px filters), parent expands
- With `min-w-0`, child can shrink → scroll works!

### `overflow-x-hidden` vs `overflow-x-auto`

```css
/* overflow-x: hidden */
.container { overflow-x: hidden; }
/* Clips content → Hides overflow visually */
/* Problem: Layout still stretched, content just invisible */

/* overflow-x: auto */
.container { overflow-x: auto; width: 100%; }
/* Enables scroll → Content scrolls within boundaries */
/* Solution: Prevents layout stretch */
```

**Best Practice**: Use `overflow-x-auto` + `w-full`, not `overflow-x-hidden`!

---

## Pattern Library

### Mobile-Safe Container Pattern

```jsx
function SafeMobilePage() {
    return (
        <div className="w-full min-w-0 space-y-6">
            {/* Header with button */}
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-h1 truncate">Long Title Can Truncate</h1>
                </div>
                <button className="flex-shrink-0 btn-primary">
                    <IconPlus />
                </button>
            </div>

            {/* Search (full width) */}
            <input className="w-full ..." />

            {/* Horizontal scroll filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full">
                <button className="whitespace-nowrap">Filter 1</button>
                <button className="whitespace-nowrap">Filter 2</button>
                {/* More buttons... */}
            </div>

            {/* Content */}
            <div className="space-y-4">
                {/* Items */}
            </div>
        </div>
    );
}
```

### Desktop Sidebar + Mobile Pattern

```jsx
function ResponsivePage() {
    return (
        // AppShell provides padding and constraints
        <div className="w-full min-w-0 space-y-6">
            {/* Desktop: Uses space, Mobile: Respects padding */}
            <div className="lg:max-w-content lg:mx-auto">
                {/* Content */}
            </div>
        </div>
    );
}
```

---

## Testing Checklist

Before deploying pages with horizontal content:

### Mobile Viewport Testing (Required!)

1. **Set viewport to 390px** (iPhone 12 Pro standard)
2. **Check right edge**:
   - [ ] All buttons visible
   - [ ] No horizontal scroll on page body
   - [ ] Filter buttons scroll within container

3. **Set viewport to 320px** (iPhone SE)
   - [ ] Still no page-level horizontal scroll
   - [ ] Buttons still visible

4. **Test on real device** (Critical!)
   - [ ] Open in mobile browser
   - [ ] Check all buttons clickable
   - [ ] No content cut off

### Browser Console Checks

```javascript
// Run on mobile viewport
console.log({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
});

// Should be:
// bodyWidth: 390 (or close to viewport)
// hasHorizontalScroll: false
```

---

## Quick Reference

### Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Button pushed off-screen | Wide child stretching parent | Add `w-full min-w-0` to parent |
| Horizontal page scroll | No width constraint | Add `w-full` to root container |
| Filter row too wide | No scroll container | Add `w-full overflow-x-auto` |
| Text not truncating | No min-width override | Add `min-w-0` to flex container |
| overflow-x-hidden not working | Hides but doesn't prevent stretch | Use `w-full` + `overflow-x-auto` instead |

### Essential Classes

```jsx
// Root page container
className="w-full min-w-0 space-y-6"

// Horizontal scroll container
className="flex gap-2 overflow-x-auto w-full"

// Flex header with button
<div className="flex items-center justify-between gap-3">
    <div className="min-w-0 flex-1"> {/* text */} </div>
    <button className="flex-shrink-0"> {/* button */} </button>
</div>

// Full-width input
className="w-full ..."
```

---

## Files Reference

**Fixed in this session:**

- `src/pages/Books.jsx` - Root: `w-full min-w-0`
- `src/pages/BookDetail.jsx` - Root: `w-full min-w-0`
- `src/components/books/organisms/BooksList.jsx` - Filter: `w-full`

**Working examples:**

- `src/pages/Fokus.jsx` - Simple page (no horizontal scroll elements)
- `src/pages/Space.jsx` - Uses negative margins for special layout
- `src/pages/Today.jsx` - Widget grid with proper constraints

---

## Summary

### The Golden Rules

1. **Always add `w-full min-w-0` to page root containers**

   ```jsx
   <div className="w-full min-w-0 space-y-6">
   ```

2. **Horizontal scroll elements need `w-full`**

   ```jsx
   <div className="flex overflow-x-auto w-full">
   ```

3. **Test on real mobile devices, not just emulator**

4. **When in doubt, measure in browser console**

   ```javascript
   el.getBoundingClientRect().width > window.innerWidth
   ```

### Key Learnings

- `overflow-x-hidden` hides problems, doesn't fix them
- `min-w-0` is the secret sauce for flex scroll containers
- Wide children (filter buttons, tabs) will stretch parents unless constrained
- AppShell handles padding - pages should trust it, not duplicate

---

**Last Updated**: 2025-12-26  
**Tested On**: Chrome 131, iPhone 12 Pro (390px), iPhone SE (320px)  
**Status**: ✅ Production-ready pattern
