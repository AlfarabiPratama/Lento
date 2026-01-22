# Accessibility Implementation Guide
**Priority 1 - Color Blindness & Typography**

## Overview
This document covers the implementation of color blind accessibility features and typography validation for Lento. These features ensure the app remains usable for users with color vision deficiencies (8-10% of males, 0.5% of females) and maintains WCAG 2.1 AA standards for text readability.

---

## 🎨 Color Blind Accessibility

### Problem Statement
Lento's teal (#14b8a6) + amber (#f59e0b) color palette may appear similar to users with deuteranopia (green-blind) or protanopia (red-blind). Status indicators that rely solely on color create barriers for ~8-10% of male users.

### Solution Architecture

#### 1. Color Blind Simulator (`src/utils/colorBlindSimulator.ts`)

**Purpose:** Programmatically test colors using matrix transformations.

**Key Functions:**

```typescript
// Simulate color blindness
import { simulateColorBlindness } from '@/utils/colorBlindSimulator';

const teal = '#14b8a6';
const deuteranopia = simulateColorBlindness(teal, 'deuteranopia');
// Returns: #8b9f3a (brownish-yellow to deuteranopes)

// Test entire palette
import { testColorPalette } from '@/utils/colorBlindSimulator';
testColorPalette(); // Logs all colors in 3 simulations

// Validate contrast ratios
import { checkContrast } from '@/utils/colorBlindSimulator';
const result = checkContrast('#14b8a6', '#ffffff', 'AA');
// Returns: { passes: true, ratio: 4.73, required: 4.5 }
```

**Supported Types:**
- **Deuteranopia:** Green-blind (~6% of males) - Cannot distinguish red/green
- **Protanopia:** Red-blind (~2.5% of males) - Cannot distinguish red/green
- **Tritanopia:** Blue-blind (~0.001%) - Cannot distinguish blue/yellow

**Console Testing:**
```javascript
// Available in dev mode only
window.lentoColorBlind.test();          // Test all colors
window.lentoColorBlind.simulate(color, type);
window.lentoColorBlind.validate();      // Get issues report
window.lentoColorBlind.checkContrast(c1, c2);
```

#### 2. Status Pattern Indicators (`src/components/ui/StatusIndicator.tsx`)

**Purpose:** Provide visual patterns alongside colors so status is distinguishable without color perception.

**Components:**

##### Base Component: `<StatusIndicator>`
```jsx
import { StatusIndicator } from '@/components/ui/StatusIndicator';

<StatusIndicator 
  status="success"      // success | warning | error | info | neutral
  size="md"             // sm | md | lg
  showIcon={true}       // Shows ✓, ⚠, ✕, ℹ, ○
  showPattern={true}    // Adds SVG pattern overlay
  label="Completed"     // Optional text label
/>
```

**Visual Patterns:**
- **Success:** Green + ✓ + solid fill
- **Warning:** Amber + ⚠ + diagonal stripes
- **Error:** Red + ✕ + cross-hatch
- **Info:** Blue + ℹ + dots
- **Neutral:** Gray + ○ + no pattern

##### Habit Status: `<HabitStatus>`
```jsx
import { HabitStatus } from '@/components/ui/StatusIndicator';

<HabitStatus 
  completed={true}      // Shows green ✓ with solid pattern
  streak={7}            // Shows 🔥 7 badge
  size="md"
/>
```

**Usage in Habits.jsx:**
```jsx
// Before: Simple colored dot
<div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />

// After: Accessible status indicator
<HabitStatus completed={isCompleted} streak={habit.streak} />
```

##### Finance Indicator: `<FinanceIndicator>`
```jsx
import { FinanceIndicator } from '@/components/ui/StatusIndicator';

<FinanceIndicator 
  value={50000}         // Positive: green ↑ + solid
  showValue={true}      // Display formatted amount
  size="md"
/>

<FinanceIndicator 
  value={-25000}        // Negative: red ↓ + cross-hatch
  showValue={true}
/>
```

**Usage in Finance.jsx:**
```jsx
// Before: Color-only arrows
<span className={amount > 0 ? 'text-green-600' : 'text-red-600'}>
  {amount > 0 ? '↑' : '↓'} Rp{Math.abs(amount).toLocaleString()}
</span>

// After: Pattern + icon + color
<FinanceIndicator value={amount} showValue />
```

##### Budget Warning: `<BudgetWarning>`
```jsx
import { BudgetWarning } from '@/components/ui/StatusIndicator';

<BudgetWarning 
  percentage={85}       // 0-100
  size="md"
/>
// Shows: ⚠ 85% used + "Approaching limit"
```

**Logic:**
- 0-69%: Success (green ✓ + "On track")
- 70-89%: Warning (amber ⚠ + "Approaching limit")
- 90-100%: Error (red ✕ + "Over budget")

##### Calendar Event Status: `<CalendarEventStatus>`
```jsx
import { CalendarEventStatus } from '@/components/ui/StatusIndicator';

<CalendarEventStatus 
  type="deadline"       // deadline | meeting | habit | reminder
  priority="high"       // high | medium | low
  size="sm"
/>
```

**Mapping:**
- Deadline: Red + ⏰ + cross-hatch
- Meeting: Blue + 👥 + dots
- Habit: Green + ✓ + solid
- Reminder: Amber + 🔔 + diagonal stripes

### Integration Checklist

**Phase 1: Core Pages (Current Sprint)**
- [ ] Replace habit dots in `src/pages/Habits.jsx` with `<HabitStatus>`
- [ ] Replace finance arrows in `src/pages/Finance.jsx` with `<FinanceIndicator>`
- [ ] Update budget cards with `<BudgetWarning>`
- [ ] Add `<CalendarEventStatus>` to calendar events

**Phase 2: Smaller Components (Next Sprint)**
- [ ] Stats page progress indicators
- [ ] Goal completion badges
- [ ] Quest status indicators
- [ ] Notification priority badges

### Testing Protocol

**Step 1: Automated Testing**
```bash
# Check contrast ratios
npm run test:a11y

# Visual regression (after Playwright setup)
npm run test:e2e -- --grep "color blind"
```

**Step 2: Manual Console Testing**
```javascript
// In browser console (dev mode)
window.lentoColorBlind.test();
// Should log all palette colors in 3 simulations

window.lentoColorBlind.validate();
// Should return array of issues (empty = pass)
```

**Step 3: External Simulator Testing**
1. Take screenshots of key pages
2. Upload to [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/)
3. Toggle between deuteranopia/protanopia/tritanopia
4. Verify all status indicators remain distinguishable

**Step 4: User Testing**
- Recruit 2-3 users with color blindness (r/colorblind, ColorblindFilter.com)
- Tasks:
  1. Complete a habit and identify the status change
  2. Find a negative transaction in Finance
  3. Identify an overbudget category
  4. Distinguish between calendar event types
- Success: All tasks completed without confusion

### Known Issues & Workarounds

**Issue 1: Teal + Amber Adjacent**
- **Problem:** When placed side-by-side, teal and amber appear similar to deuteranopes
- **Solution:** Never use color alone; always include icon or pattern
- **Example:** Budget pie chart should have labels, not just colors

**Issue 2: SVG Pattern Performance**
- **Problem:** Complex patterns may impact rendering on low-end devices
- **Solution:** `showPattern={false}` on mobile, rely on icons only
- **Implemented:** Auto-detects `@media (prefers-reduced-motion)`

**Issue 3: Dark Mode Pattern Visibility**
- **Problem:** Some patterns less visible on #121212 background
- **Solution:** Increase pattern opacity to 30% in dark mode
- **Status:** Implemented in `StatusIndicator.tsx`

---

## 📐 Typography Validation

### Problem Statement
Secondary text and labels may be too small for comfortable reading, especially on mobile devices. WCAG 2.1 requires minimum 13px for body text, but this isn't enforced in Lento's codebase.

### Solution: Typography Audit Script

#### Script: `scripts/audit-typography.js`

**Purpose:** Scan all JSX/TSX files for text size violations.

**What It Checks:**
1. Tailwind classes: `text-xs` (12px) usage outside of labels
2. Inline styles: `fontSize: 'Xpx'` below 13px
3. CSS values: `font-size: Xpx` in style blocks

**Usage:**
```bash
npm run audit:typography
```

**Sample Output:**
```
📐 Typography Audit Results

Files scanned: 87
Issues found: 12

❌ Errors (3):
1. src/pages/Finance.jsx:45
   fontSize 11px is below minimum 13px
   💡 Use CSS variable --text-body or --text-small instead
   📄 <div style={{fontSize: '11px'}}>Transaction details</div>...

⚠️  Warnings (9):
1. src/components/habits/HabitCard.jsx:23
   text-xs (12px) is below minimum 13px
   💡 Use text-sm (14px) or text-base (16px) instead

📊 Issues by file:
   5x src/pages/Finance.jsx
   3x src/components/habits/HabitCard.jsx
   2x src/pages/Today.jsx
   2x src/components/calendar/CalendarView.jsx
```

**Exit Codes:**
- `0`: No errors (warnings OK)
- `1`: Errors found (blocks CI/CD)

#### Fluid Typography (Already Implemented)

**Location:** `src/index.css`

```css
:root {
  /* Fluid scaling with clamp() */
  --text-body: clamp(0.9375rem, 2vw, 1rem);     /* 15px → 16px */
  --text-small: clamp(0.875rem, 1.5vw, 0.9375rem); /* 14px → 15px */
  --text-caption: 0.75rem;                       /* 12px (labels only) */
}
```

**Benefits:**
- ✅ Scales smoothly across all screen sizes
- ✅ No breakpoint management needed
- ✅ Maintains WCAG 13px minimum on mobile
- ✅ Larger on desktop for better readability

**Usage:**
```jsx
// ❌ Bad: Hardcoded size
<p className="text-sm">Some text</p>

// ✅ Good: Use CSS variable
<p style={{ fontSize: 'var(--text-body)' }}>Some text</p>

// ✅ Better: Tailwind utility (if mapped)
<p className="text-body">Some text</p>
```

### Integration Checklist

**Phase 1: Fix Critical Violations**
- [ ] Run `npm run audit:typography`
- [ ] Fix all errors (fontSize < 13px)
- [ ] Replace inline styles with CSS variables
- [ ] Validate on iPhone SE (smallest modern screen)

**Phase 2: Tailwind Mapping**
- [ ] Add custom utilities in `tailwind.config.js`:
  ```js
  theme: {
    extend: {
      fontSize: {
        body: 'var(--text-body)',
        small: 'var(--text-small)',
        caption: 'var(--text-caption)',
      }
    }
  }
  ```
- [ ] Replace `text-sm` with `text-small` across codebase
- [ ] Replace `text-base` with `text-body`

**Phase 3: Mobile Testing**
- [ ] Test on iPhone SE (375x667)
- [ ] Test on Samsung A12 (720x1600)
- [ ] Validate minimum 44px touch targets
- [ ] Check readability at arm's length

### CI/CD Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Checks

on: [pull_request]

jobs:
  typography-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run audit:typography
      # Fails if errors found (exit code 1)
```

---

## 📊 Success Metrics

### Color Blindness
- [ ] All status indicators have non-color cues (icon + pattern)
- [ ] Contrast ratios ≥4.5:1 (WCAG AA normal text)
- [ ] Contrast ratios ≥3:1 (WCAG AA large text)
- [ ] Zero critical issues in `validatePalette()` output
- [ ] User testing: 100% task completion rate

### Typography
- [ ] Zero errors in `npm run audit:typography`
- [ ] All body text ≥15px on mobile, ≥16px on desktop
- [ ] All touch targets ≥44x44px
- [ ] Lighthouse accessibility score ≥95
- [ ] User testing: "Easy to read" rating ≥4/5

---

## 🚀 Next Steps

### Immediate (This Week)
1. ✅ Create color blind simulator utility
2. ✅ Create pattern indicator components
3. ✅ Create typography audit script
4. 🚧 Run typography audit and fix critical errors
5. 🚧 Integrate `<StatusIndicator>` into Habits page
6. 🚧 Test with Coblis simulator

### Short-term (Next Week)
7. Integrate into Finance and Calendar pages
8. Recruit color-blind users for testing
9. Add CI/CD check for typography
10. Document findings in accessibility statement

### Long-term (Next Month)
11. Add pattern indicators to charts/graphs
12. Create accessibility settings page
13. Add high-contrast mode option
14. Publish accessibility audit results

---

## 📚 Resources

**Color Blindness:**
- [Coblis Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [Chromatic Plugin](https://github.com/tmo-oss/color-blindness-emulation)
- [WCAG 2.1 Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

**Typography:**
- [WCAG 2.1 Text Size](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)
- [Fluid Typography Guide](https://css-tricks.com/snippets/css/fluid-typography/)
- [Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

**Testing:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse Accessibility](https://web.dev/lighthouse-accessibility/)

---

*Last Updated: January 22, 2026*  
*Implementation Status: Pattern components ready, integration pending*
