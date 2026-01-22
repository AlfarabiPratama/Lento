# Color Blind Accessibility Testing Guide

## Overview
This guide helps validate that Lento's teal + amber color palette remains accessible for users with color blindness (8-10% of males, ~0.5% of females).

## Testing Tools

### 1. **Color Blind Simulator Utility** ✅
Built-in tool for testing colors programmatically.

**Console Testing:**
```javascript
// Open browser console on dev server
window.lentoColorBlind.test();          // Test entire palette
window.lentoColorBlind.simulate('#14b8a6', 'deuteranopia'); // Test specific color
window.lentoColorBlind.validate();      // Get validation report
window.lentoColorBlind.checkContrast('#14b8a6', '#f59e0b'); // Check contrast ratio
```

**Expected Output:**
```
🎨 Lento Color Palette - Color Blindness Simulation
📦 TEAL
  🎯 default: #14b8a6
  ██ Original
  ██ deuteranopia #8b9f3a (simulated)
  ██ protanopia #7a9f4d
  ██ tritanopia #14b8c4
```

### 2. **Coblis Simulator** (External)
URL: https://www.color-blindness.com/coblis-color-blindness-simulator/

**Steps:**
1. Take screenshots of key Lento pages:
   - Today dashboard (habit list)
   - Finance page (positive/negative indicators)
   - Calendar (event types)
   - Settings (theme toggle)

2. Upload to Coblis and test for:
   - Protanopia (red-blind)
   - Deuteranopia (green-blind)
   - Tritanopia (blue-blind)

3. Validate that:
   - ✅ Teal and amber remain distinguishable
   - ✅ Status indicators (success/warning/error) are differentiable
   - ✅ No critical information lost

### 3. **Chromatic Plugin** (Firefox/Chrome)
Install: https://github.com/tmo-oss/color-blindness-emulation

**Benefits:**
- Real-time emulation while browsing
- Toggle between types quickly
- Test interactions (hover, focus states)

## Validation Checklist

### ✅ Critical Checks

#### 1. Habit Status Indicators
**Location:** `src/pages/Habits.jsx`

**Test:**
```jsx
// Original: Green checkmark vs gray circle
<HabitStatus completed={true} />   // Green ✓
<HabitStatus completed={false} />  // Gray ○

// With pattern indicators:
<HabitStatus completed={true} streak={7} /> // Green ✓ with solid fill + 🔥
```

**Validation:**
- [ ] Completed habits remain distinguishable from incomplete (icon + pattern)
- [ ] Streak indicators visible without color
- [ ] Touch targets ≥44px

#### 2. Finance Indicators
**Location:** `src/pages/Finance.jsx`

**Test:**
```jsx
// Original: Green (positive) vs Red (negative)
<FinanceIndicator value={50000} />   // Green ↑
<FinanceIndicator value={-50000} />  // Red ↓

// With patterns:
<FinanceIndicator value={50000} />   // Green ↑ + solid pattern
<FinanceIndicator value={-50000} />  // Red ↓ + cross-hatch pattern
```

**Validation:**
- [ ] Positive/negative amounts distinguishable (arrow + pattern)
- [ ] No reliance on green/red alone
- [ ] Contrast ratio ≥4.5:1 (WCAG AA)

#### 3. Budget Warnings
**Location:** `src/components/finance/BudgetCard.jsx`

**Test:**
```jsx
<BudgetWarning percentage={50} />  // Success (green)
<BudgetWarning percentage={85} />  // Warning (amber)
<BudgetWarning percentage={95} />  // Error (red)
```

**Validation:**
- [ ] All three states clearly different (icon + pattern + text)
- [ ] Pattern visible: solid / diagonal-stripes / cross-hatch
- [ ] Text labels present ("On track" / "Approaching limit" / "Over budget")

#### 4. Calendar Events
**Location:** `src/components/calendar/CalendarView.jsx`

**Test:**
```jsx
<CalendarEventStatus type="deadline" />  // Red ⏰
<CalendarEventStatus type="meeting" />   // Blue 👥
<CalendarEventStatus type="habit" />     // Green ✓
<CalendarEventStatus type="reminder" />  // Amber 🔔
```

**Validation:**
- [ ] Event types distinguishable by icon (not just color)
- [ ] Patterns add secondary visual cue
- [ ] Text labels present

### ⚠️ Known Issues & Fixes

#### Issue 1: Teal + Amber Confusion
**Problem:** Teal (#14b8a6) and Amber (#f59e0b) appear similar to deuteranopes.

**Solution:** Always pair with icons or patterns.
```jsx
// ❌ Bad: Color alone
<div className="bg-teal-500">Success</div>

// ✅ Good: Icon + Color + Pattern
<StatusIndicator status="success" showIcon showPattern />
```

#### Issue 2: Status Dots Too Small
**Problem:** 8px dots rely entirely on color.

**Solution:** Minimum 16px with icon.
```jsx
// ❌ Bad: 8px colored dot
<div className="w-2 h-2 rounded-full bg-green-500" />

// ✅ Good: 16px with checkmark
<StatusIndicator status="success" size="sm" showIcon />
```

#### Issue 3: Chart Legend Colors
**Problem:** Line charts use color to distinguish series.

**Solution:** Add line patterns (solid, dashed, dotted).
```jsx
// ❌ Bad: Color-only legend
<Line stroke="#14b8a6" />

// ✅ Good: Color + Pattern
<Line stroke="#14b8a6" strokeDasharray="5,5" /> // Dashed
<Line stroke="#f59e0b" strokeDasharray="2,2" /> // Dotted
```

## Implementation Status

### ✅ Completed
- [x] Color blind simulator utility (`colorBlindSimulator.ts`)
- [x] Pattern indicator components (`StatusIndicator.tsx`)
- [x] Habit status with patterns (`HabitStatus`)
- [x] Finance indicators with patterns (`FinanceIndicator`)
- [x] Budget warnings with patterns (`BudgetWarning`)
- [x] Calendar event status (`CalendarEventStatus`)

### 🚧 To Integrate
- [ ] Replace colored dots in `Habits.jsx` with `<HabitStatus />`
- [ ] Replace finance arrows in `Finance.jsx` with `<FinanceIndicator />`
- [ ] Update budget cards with `<BudgetWarning />`
- [ ] Update calendar events with `<CalendarEventStatus />`

### 📋 Testing Workflow

**Step 1: Local Testing**
```bash
# Start dev server
npm run dev

# Open browser console
window.lentoColorBlind.test()  # Log palette simulations
window.lentoColorBlind.validate()  # Check for issues
```

**Step 2: Visual Testing**
1. Navigate to key pages (Today, Habits, Finance, Calendar)
2. Enable Chromatic plugin or use Coblis screenshots
3. Toggle between color blindness types
4. Verify all status indicators remain clear

**Step 3: Automated Testing**
```bash
# Run accessibility tests (includes color contrast checks)
npm run test:a11y
```

**Step 4: User Testing**
- Recruit 2-3 users with color blindness (r/colorblind, friends)
- Ask them to complete tasks:
  1. Check off a habit
  2. Identify positive vs negative transactions
  3. Find overbudget categories
  4. Distinguish calendar event types
- Document feedback

## Success Criteria

✅ **Pass:**
- All status indicators distinguishable without color
- Contrast ratios meet WCAG AA (4.5:1 normal text, 3:1 large text)
- No critical information lost in color blind simulations
- User testing confirms usability

❌ **Fail:**
- Teal and amber appear identical in simulations
- Status indicators rely solely on color
- Contrast ratios below WCAG AA
- Users struggle to complete tasks

## Resources
- [Color Blind Simulator (Coblis)](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [WCAG 2.1 Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Designing for Color Blindness](https://www.smashingmagazine.com/2016/06/improving-color-accessibility-for-color-blind-users/)
- [Chromatic Plugin](https://github.com/tmo-oss/color-blindness-emulation)

## Next Steps
1. ✅ Run `window.lentoColorBlind.test()` in console
2. 🚧 Take screenshots and test with Coblis
3. 🚧 Integrate `StatusIndicator` components into pages
4. 🚧 Run user testing with color-blind participants
5. 🚧 Document results and iterate

---
*Last Updated: January 22, 2026*
