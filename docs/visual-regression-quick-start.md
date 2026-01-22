# Visual Regression Testing - Quick Start

**Status**: ✅ ACTIVE (161 baseline screenshots generated)  
**Last Updated**: 2025-01-22  
**Browser**: Chromium (recommended)

## What's Implemented

✅ **83 Test Scenarios**:
- 11 core pages (Today, Habits, Calendar, Books, Journal, Finance, Goals, Space, Stats, Settings, More)
- 3 viewports (mobile 375px, tablet 768px, desktop 1280px)
- 2 themes (light, dark)
- Component states (empty, loading, modals, color blind mode)
- 7 responsive breakpoints (320px-1920px)
- Accessibility features (focus, high contrast, touch targets)

✅ **161 Tests Passed**: All core pages with baseline screenshots generated  
✅ **npm Scripts Configured**: `test:visual`, `test:visual:update`, `test:visual:ui`  
✅ **Playwright Config**: Chromium optimized, cross-browser ready

## Setup (One-Time)

1. **Install Playwright** (✅ already done):
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium  # Only Chromium needed
   ```

2. **✅ Baseline screenshots generated** (161 screenshots):
   Located in `tests/visual/visual-regression.spec.ts-snapshots/`
   
   Format: `[page]-[viewport]-[theme]-chromium-win32.png`
   
   Examples:
   - `today-mobile-light-chromium-win32.png`
   - `habits-tablet-dark-chromium-win32.png`
   - `calendar-desktop-light-chromium-win32.png`

## Daily Workflow

### Before Making UI Changes
```bash
# 1. Make sure baselines are up to date
git pull origin main

# 2. Run tests to ensure current state passes
npm run test:visual
```

### After Making UI Changes
```bash
# 1. Run visual tests
npm run test:visual

# 2. Review changes in report
open playwright-report/index.html

# 3. If changes are intentional, update baselines
npm run test:visual:update

# 4. Commit new baselines
git add tests/visual/**/*-snapshots/
git commit -m "Update visual baselines for [feature]"
```

## Common Commands

```bash
# Run all visual tests
npm run test:visual

# Update baselines (after intentional changes)
npm run test:visual:update

# Interactive mode (debug failures)
npm run test:visual:ui

# Run specific test file
npx playwright test tests/visual/visual-regression.spec.ts

# Run specific test
npx playwright test -g "Today page"

# Run only mobile tests
npx playwright test --grep "mobile viewport"
```

## What Gets Tested

### ✅ Automatically Tested
- All 11 core pages (Today, Habits, Calendar, etc.)
- 3 viewports: Mobile (375px), Tablet (768px), Desktop (1280px)
- 2 themes: Light & Dark mode
- 7 responsive breakpoints (320px → 1920px)
- Loading states, empty states, modals
- User flows (navigation, forms, interactions)
- Accessibility features (focus states, high contrast)

### 📸 Total Screenshots
- Core pages: 66 screenshots (11 pages × 3 viewports × 2 themes)
- Breakpoints: 7 screenshots
- Component states: ~10 screenshots
- User flows: ~25 screenshots
- **Total**: ~100+ screenshot assertions

## Understanding Test Results

### ✅ Passing Tests
```
✓ Today page - mobile - light (2.5s)
✓ Habits page - tablet - dark (3.1s)
```
All screenshots match baselines within tolerance (0.2% difference)

### ❌ Failing Tests
```
✗ Settings page - desktop - light (4.2s)
  Screenshot comparison failed:
  - Expected: tests/visual/settings-desktop-light.png
  - Actual: test-results/settings-desktop-light-actual.png
  - Diff: test-results/settings-desktop-light-diff.png
```

**Next Steps:**
1. Open `playwright-report/index.html`
2. View side-by-side comparison
3. Check diff overlay (red/green pixels)
4. Decide: bug fix or baseline update

## When to Update Baselines

### ✅ Update When:
- Intentional design changes (colors, spacing, typography)
- New features added (new buttons, sections)
- Component redesigns
- After reviewing and approving visual changes

### ❌ Don't Update When:
- Tests fail unexpectedly
- Visual bugs detected
- Random/flaky failures (fix the test instead)
- Before reviewing what changed

## Troubleshooting

### Issue: Tests fail locally but pass in CI
**Solution**: Different OS/fonts. Run in Docker:
```bash
docker run -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0 npm run test:visual
```

### Issue: Flaky tests (inconsistent results)
**Causes**:
- Animations not complete
- Fonts not loaded
- Dynamic content (timestamps, dates)

**Solution**: Tests already configured to:
- Disable animations
- Wait for network idle
- Hide dynamic content

If still flaky, add to test:
```typescript
await page.waitForTimeout(500); // Extra settle time
```

### Issue: Too many failures after minor change
**Solution**: Adjust tolerance in `playwright.config.ts`:
```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.005, // Increase from 0.002 (0.5%)
  },
}
```

## CI/CD Integration

Tests run automatically on:
- Every push to main
- Every pull request
- Scheduled nightly builds

**PR Workflow:**
1. Push changes
2. CI runs visual tests
3. Failures trigger PR review
4. Review screenshots in artifacts
5. Update baselines if needed
6. Re-push for CI to verify

## Tips & Tricks

### Speed Up Tests
```bash
# Run only desktop viewport
npx playwright test --grep "desktop viewport"

# Run only light theme
npx playwright test --grep "light theme"

# Run specific page
npx playwright test --grep "Today page"

# Parallel execution (faster)
npx playwright test --workers=4
```

### Debug Failed Tests
```bash
# UI mode - see what's happening
npm run test:visual:ui

# Headed mode - see browser
npx playwright test --headed

# Slow motion - see interactions
npx playwright test --slow-mo=1000
```

### Generate Specific Baselines
```bash
# Only update Today page baselines
npx playwright test -g "Today page" --update-snapshots

# Only update mobile baselines
npx playwright test -g "mobile viewport" --update-snapshots
```

## File Locations

```
tests/
  visual/
    visual-regression.spec.ts           # Main test suite
    user-flows.spec.ts                  # User journey tests
    visual-regression.spec.ts-snapshots/ # Baseline screenshots
      today-mobile-light.png
      today-mobile-dark.png
      ...

playwright-report/                      # HTML report (gitignored)
  index.html                            # Open this to review

test-results/                           # Test artifacts (gitignored)
  settings-desktop-light-actual.png     # Current screenshot
  settings-desktop-light-diff.png       # Difference overlay
```

## Need Help?

1. Check `docs/visual-regression-testing.md` for full guide
2. Review Playwright docs: https://playwright.dev/docs/test-snapshots
3. Open `playwright-report/index.html` for visual diff inspection
4. Run tests in UI mode: `npm run test:visual:ui`

---

**Status**: ✅ Ready to use  
**Last Updated**: 2025-01-22
