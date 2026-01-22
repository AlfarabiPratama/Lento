import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Critical User Flows
 */

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for main content
    await expect(page.locator('main')).toBeVisible();
    
    // Check for key elements
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display navigation', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Should have navigation links
    const links = nav.locator('a, button');
    expect(await links.count()).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to habits
    await page.click('text=Habits');
    await expect(page).toHaveURL(/.*habits/);
    
    // Navigate to finance
    await page.click('text=Finance');
    await expect(page).toHaveURL(/.*finance/);
    
    // Navigate back to home
    await page.click('text=Today');
    await expect(page).toHaveURL(/^\//);
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/habits');
    
    const activeLink = page.locator('nav [aria-current="page"], nav .active');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toContainText('Habits');
  });
});

test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Find dark mode toggle
    const darkModeToggle = page.locator('[aria-label*="dark"], [aria-label*="theme"]').first();
    
    if (await darkModeToggle.isVisible()) {
      // Get initial theme
      const htmlElement = page.locator('html');
      const initialTheme = await htmlElement.getAttribute('data-theme');
      
      // Toggle dark mode
      await darkModeToggle.click();
      
      // Wait for theme change
      await page.waitForTimeout(300);
      
      // Check theme changed
      const newTheme = await htmlElement.getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);
    }
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds on 4G
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good performance metrics', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Measure performance
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        load: nav.loadEventEnd - nav.loadEventStart,
        tti: nav.domInteractive - nav.fetchStart,
      };
    });
    
    // Assert performance budgets
    expect(metrics.tti).toBeLessThan(3000); // Time to Interactive < 3s
    expect(metrics.load).toBeLessThan(5000); // Page Load < 5s
  });
});

test.describe('Offline Support', () => {
  test('should show offline indicator when offline', async ({ page, context }) => {
    await page.goto('/');
    
    // Go offline
    await context.setOffline(true);
    
    // Wait for offline indicator
    await page.waitForTimeout(1000);
    
    // Should show offline message
    const offlineIndicator = page.locator('text=/offline/i');
    await expect(offlineIndicator).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
  });

  test('should work offline with cached content', async ({ page, context }) => {
    // First visit to cache content
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Reload page
    await page.reload();
    
    // Should still show content from cache
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Mobile Gestures', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should support pull-to-refresh', async ({ page }) => {
    await page.goto('/');
    
    // Get main content element
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Simulate pull-to-refresh gesture
    const box = await main.boundingBox();
    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + 10);
      await page.mouse.move(box.x + box.width / 2, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + 100, { steps: 10 });
      await page.mouse.up();
      
      // Wait for potential refresh
      await page.waitForTimeout(1000);
    }
  });
});
