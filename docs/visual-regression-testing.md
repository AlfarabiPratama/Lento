# Visual Regression Testing Guide

**Status**: ✅ Configured  
**Framework**: Playwright  
**Coverage**: 11 pages × 3 viewports × 2 themes = 66 baseline screenshots  
**Date**: 2025-01-22

## Overview

Visual regression testing automatically captures screenshots of your application and compares them against baseline images to detect unintended visual changes.

## Test Structure

### 1. Core Pages Testing (`visual-regression.spec.ts`)
Tests all major pages across multiple viewports and themes:

**Pages Covered (11):**
- Today (`/`)
- Habits (`/habits`)
- Calendar (`/calendar`)
- Books (`/books`)
- Journal (`/journal`)
- Finance (`/more/finance`)
- Goals (`/more/goals`)
- Space (`/space`)
- Stats (`/stats`)
- Settings (`/settings`)
- More (`/more`)

**Viewports (3):**
- Mobile: 375×667px (iPhone SE)
- Tablet: 768×1024px (iPad)
- Desktop: 1280×720px

**Themes (2):**
- Light mode
- Dark mode

**Total Screenshots**: 11 pages × 3 viewports × 2 themes = **66 baseline images**

### 2. Component States Testing
Tests specific UI states:
- Empty states (no data)
- Loading states (skeleton loaders)
- Modal dialogs
- Color blind simulator
- Error states

### 3. Responsive Breakpoints Testing
Tests critical breakpoints:
- Mobile Small: 320px (iPhone SE 1st gen)
- Mobile: 375px (iPhone SE 2nd gen)
- Mobile Large: 414px (iPhone 11 Pro Max)
- Tablet: 768px (iPad)
- Desktop Small: 1024px
- Desktop: 1280px
- Desktop Large: 1920px (Full HD)

### 4. Accessibility Features Testing
- Focus visible states (keyboard navigation)
- High contrast mode
- Touch target indicators

### 5. User Flows Testing (`user-flows.spec.ts`)
End-to-end visual testing of critical user journeys:
- Adding a habit
- Reading session (book → timer)
- Theme switching (light → dark)
- Calendar navigation (month → week → day)
- Quick capture (FAB → modal)
- Settings navigation (tab switching)
- Goal creation
- Finance transaction
- Mobile navigation (bottom nav)

## Commands

### Generate Baseline Screenshots
First time setup - creates reference images:
```bash
npm run test:visual:update
```

### Run Visual Regression Tests
Compare current UI against baselines:
```bash
npm run test:visual
```

### Interactive Mode
Debug and inspect screenshots visually:
```bash
npm run test:visual:ui
```

### Run All Tests (E2E + Visual + A11y)
```bash
npm run test:e2e
npm run test:a11y
npm run test:visual
```

## Configuration

### Screenshot Settings (`playwright.config.ts`)

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,           // Max different pixels allowed
    maxDiffPixelRatio: 0.002,     // Max 0.2% difference
    threshold: 0.2,                // Anti-aliasing tolerance
    fullPage: false,               // Per-test override
    animations: 'disabled',        // Stable screenshots
  },
}
```

### Dynamic Content Handling

The tests automatically:
- Hide skeleton loaders (wait for content)
- Disable animations for stable captures
- Hide dynamic timestamps/dates
- Wait for network idle state

## File Structure

```
tests/
  visual/
    visual-regression.spec.ts    # Core page testing
    user-flows.spec.ts           # User journey testing
  e2e/                           # End-to-end tests
  a11y/                          # Accessibility tests
playwright.config.ts             # Shared config
test-results/                    # Test output
playwright-report/               # HTML report
```

## Baseline Storage

Baselines stored in:
```
tests/visual/
  visual-regression.spec.ts-snapshots/
    today-mobile-light.png
    today-mobile-dark.png
    today-tablet-light.png
    ...
  user-flows.spec.ts-snapshots/
    flow-habit-1-empty.png
    flow-habit-2-modal-open.png
    ...
```

**Version Control:**
- ✅ Commit baseline screenshots to Git
- ✅ Review visual changes in PRs
- ✅ Update baselines after intentional UI changes

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run visual regression tests
        run: npm run test:visual
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Reviewing Changes

### When Tests Fail

1. **Check the diff images**:
   ```bash
   open playwright-report/index.html
   ```

2. **Review changes**:
   - Green/red overlay shows pixel differences
   - Side-by-side comparison available
   - Inspect expected vs actual vs diff

3. **If change is intentional**:
   ```bash
   npm run test:visual:update
   git add tests/visual/**/*-snapshots/
   git commit -m "Update visual baselines for [feature]"
   ```

4. **If change is unintentional**:
   - Fix the CSS/component issue
   - Re-run tests to verify fix

## Best Practices

### ✅ DO
- Update baselines after intentional design changes
- Commit baseline screenshots to Git
- Review visual diffs in PRs before merging
- Run tests locally before pushing
- Use consistent test data for stable screenshots
- Hide dynamic content (dates, times, random IDs)
- Wait for animations/transitions to complete

### ❌ DON'T
- Update baselines without reviewing changes
- Ignore failing visual tests
- Capture screenshots with random data
- Include timestamps or dynamic content
- Run tests with different screen resolutions locally vs CI
- Capture during animations or transitions

## Troubleshooting

### Tests are flaky (inconsistent failures)

**Causes:**
- Animations not disabled
- Fonts not loaded
- Network requests not settled
- Dynamic content (dates, times)

**Solutions:**
```typescript
// Wait for fonts to load
await page.waitForLoadState('networkidle');

// Disable animations
await page.addStyleTag({
  content: '*, *::before, *::after { animation: none !important; }'
});

// Hide dynamic content
await page.addStyleTag({
  content: '[data-testid="timestamp"] { visibility: hidden; }'
});
```

### Screenshots look different on CI vs local

**Cause**: Different OS, fonts, or rendering engines

**Solution**: Run tests in Docker with same environment as CI:
```bash
docker run -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0 npm run test:visual
```

### Large diff files bloating Git

**Solution**: Use Git LFS for screenshot storage:
```bash
git lfs track "tests/**/*.png"
git add .gitattributes
git commit -m "Track screenshots with Git LFS"
```

## Metrics & Coverage

### Current Coverage
- ✅ 11 core pages
- ✅ 3 viewports (mobile, tablet, desktop)
- ✅ 2 themes (light, dark)
- ✅ 7 responsive breakpoints
- ✅ 9 user flows
- ✅ Component states (empty, loading, modal)
- ✅ Accessibility features (focus, high contrast)

**Total Test Coverage**: ~100+ screenshot assertions

### Performance
- Average test duration: ~30-60 seconds per viewport/theme
- Full suite: ~10-15 minutes (parallel execution)
- Baseline generation: ~15-20 minutes (first time only)

## Next Steps

### Recommended Additions
1. **Component Library Testing**
   - Individual component screenshots
   - All button variants
   - Form input states
   - Card variations

2. **Error State Testing**
   - 404 page
   - Network errors
   - Form validation errors
   - API errors

3. **Integration with Chromatic/Percy**
   - Cloud-based visual testing
   - Automatic baseline management
   - PR integration with visual diffs

4. **Performance Budgets**
   - Screenshot size limits
   - Test execution time limits
   - Diff pixel thresholds per component

## Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)
- [Screenshot Testing Patterns](https://martinfowler.com/articles/visual-testing.html)

---

**Maintained by**: Lento Development Team  
**Last Updated**: 2025-01-22
