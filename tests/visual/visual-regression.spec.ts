import { test, expect } from '@playwright/test';

/**
 * Visual Regression Testing Configuration
 * 
 * These tests capture screenshots of key pages and components,
 * comparing them against baseline images to detect visual changes.
 * 
 * Run:
 * - Generate baseline: npm run test:visual:update
 * - Run comparison: npm run test:visual
 * - Review diffs: open playwright-report/index.html
 */

// Test configuration
const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1280, height: 720 }, // Desktop
} as const;

const THEMES = ['light', 'dark'] as const;

/**
 * Helper: Set theme via localStorage
 */
async function setTheme(page: any, theme: 'light' | 'dark') {
  await page.addInitScript((theme: string) => {
    localStorage.setItem('lento-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, theme);
}

/**
 * Helper: Wait for page to be ready (no skeleton loaders)
 */
async function waitForPageReady(page: any) {
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
  
  // Wait for skeleton loaders to disappear (max 3 seconds)
  await page.waitForSelector('[class*="animate-pulse"]', { 
    state: 'detached', 
    timeout: 3000 
  }).catch(() => {
    // It's ok if no skeleton loaders found
  });
  
  // Small delay for animations to settle
  await page.waitForTimeout(300);
}

/**
 * Helper: Hide dynamic content (dates, times, random data)
 */
async function hideDynamicContent(page: any) {
  await page.addStyleTag({
    content: `
      /* Hide elements with dynamic content */
      [data-testid="current-time"],
      [data-testid="last-sync"],
      .animate-spin,
      .animate-pulse,
      [class*="animate-"] {
        visibility: hidden !important;
      }
    `
  });
}

test.describe('Visual Regression - Core Pages', () => {
  // Test each viewport
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${viewportName} viewport`, () => {
      test.use({ viewport });

      // Test each theme
      for (const theme of THEMES) {
        test.describe(`${theme} theme`, () => {
          test.beforeEach(async ({ page }) => {
            await setTheme(page, theme);
          });

          test('Today page', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`today-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Habits page', async ({ page }) => {
            await page.goto('/habits');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`habits-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Calendar page', async ({ page }) => {
            await page.goto('/calendar');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`calendar-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Books page', async ({ page }) => {
            await page.goto('/books');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`books-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Journal page', async ({ page }) => {
            await page.goto('/journal');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`journal-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Finance page', async ({ page }) => {
            await page.goto('/more/finance');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`finance-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Goals page', async ({ page }) => {
            await page.goto('/more/goals');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`goals-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Space page', async ({ page }) => {
            await page.goto('/space');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`space-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Stats page', async ({ page }) => {
            await page.goto('/stats');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`stats-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('Settings page', async ({ page }) => {
            await page.goto('/settings');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`settings-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });

          test('More page', async ({ page }) => {
            await page.goto('/more');
            await waitForPageReady(page);
            await hideDynamicContent(page);
            
            await expect(page).toHaveScreenshot(`more-${viewportName}-${theme}.png`, {
              fullPage: true,
              animations: 'disabled',
            });
          });
        });
      }
    });
  }
});

test.describe('Visual Regression - Component States', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('Empty state - No habits', async ({ page }) => {
    // TODO: Setup test data to ensure empty state
    await page.goto('/habits');
    await waitForPageReady(page);
    
    // Check if empty state is visible
    const emptyState = page.locator('text=Belum ada kebiasaan');
    if (await emptyState.isVisible()) {
      await expect(page).toHaveScreenshot('habits-empty-state.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('Loading state - Habits skeleton', async ({ page }) => {
    // Intercept API to delay response
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    await page.goto('/habits');
    
    // Capture while loading (with skeletons)
    await page.waitForSelector('[class*="animate-pulse"]');
    await expect(page).toHaveScreenshot('habits-loading-state.png', {
      animations: 'disabled',
    });
  });

  test('Modal - Add habit sheet', async ({ page }) => {
    await page.goto('/habits');
    await waitForPageReady(page);
    
    // Click add button to open modal
    await page.click('button[aria-label*="Tambah"]');
    await page.waitForTimeout(300); // Wait for modal animation
    
    await expect(page).toHaveScreenshot('modal-add-habit.png', {
      animations: 'disabled',
    });
  });

  test('Color blind mode - All patterns', async ({ page }) => {
    await page.goto('/settings');
    await waitForPageReady(page);
    
    // Open color blind simulator
    const simulatorButton = page.locator('text=/Color Blind/i');
    if (await simulatorButton.isVisible()) {
      await simulatorButton.click();
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('color-blind-simulator.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Visual Regression - Responsive Breakpoints', () => {
  const BREAKPOINT_VIEWPORTS = {
    'mobile-small': { width: 320, height: 568 }, // iPhone SE (1st gen)
    'mobile': { width: 375, height: 667 }, // iPhone SE (2nd gen)
    'mobile-large': { width: 414, height: 896 }, // iPhone 11 Pro Max
    'tablet': { width: 768, height: 1024 }, // iPad
    'desktop-small': { width: 1024, height: 768 }, // Small laptop
    'desktop': { width: 1280, height: 720 }, // Desktop
    'desktop-large': { width: 1920, height: 1080 }, // Full HD
  } as const;

  for (const [breakpointName, viewport] of Object.entries(BREAKPOINT_VIEWPORTS)) {
    test(`Today page at ${breakpointName} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await waitForPageReady(page);
      await hideDynamicContent(page);
      
      await expect(page).toHaveScreenshot(`today-breakpoint-${breakpointName}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Visual Regression - Accessibility Features', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('Focus visible states', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    
    // Tab through interactive elements to show focus rings
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    
    await expect(page).toHaveScreenshot('focus-visible-states.png', {
      animations: 'disabled',
    });
  });

  test('High contrast mode', async ({ page }) => {
    // Enable forced colors (high contrast mode simulation)
    await page.emulateMedia({ forcedColors: 'active' });
    
    await page.goto('/');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('high-contrast-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Touch target indicators', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await waitForPageReady(page);
    
    // Add visual touch target overlays for testing
    await page.addStyleTag({
      content: `
        button, a, [role="button"] {
          outline: 2px dashed red !important;
          outline-offset: 2px !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('touch-target-indicators.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Component Library', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('Status indicators - All variants', async ({ page }) => {
    await page.goto('/habits');
    await waitForPageReady(page);
    
    // Wait for status indicators to render
    await page.waitForSelector('[data-status]', { timeout: 5000 }).catch(() => {});
    
    await expect(page).toHaveScreenshot('status-indicators-variants.png', {
      animations: 'disabled',
    });
  });

  test('Typography system', async ({ page }) => {
    await page.goto('/settings');
    await waitForPageReady(page);
    
    // Capture page with various text styles
    await expect(page).toHaveScreenshot('typography-system.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Color palette', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    
    // Add color swatches for visual reference
    await page.evaluate(() => {
      const colors = [
        '--lento-bg',
        '--lento-surface',
        '--lento-text',
        '--lento-muted',
        '--lento-primary',
        '--lento-success',
        '--lento-danger',
        '--lento-warning',
      ];
      
      const container = document.createElement('div');
      container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; display: flex; gap: 8px; z-index: 9999;';
      
      colors.forEach(color => {
        const swatch = document.createElement('div');
        const value = getComputedStyle(document.documentElement).getPropertyValue(color);
        swatch.style.cssText = `width: 40px; height: 40px; background: var(${color}); border: 1px solid black; border-radius: 4px;`;
        swatch.title = `${color}: ${value}`;
        container.appendChild(swatch);
      });
      
      document.body.appendChild(container);
    });
    
    await expect(page).toHaveScreenshot('color-palette.png', {
      animations: 'disabled',
    });
  });
});
