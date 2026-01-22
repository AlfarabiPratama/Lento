import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests
 * Tests for WCAG compliance and keyboard navigation
 */

test.describe('Homepage Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper document structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // First focused element should be visible
    const firstFocused = page.locator(':focus');
    await expect(firstFocused).toBeVisible();
    
    // Continue tabbing
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate with Enter
    await page.keyboard.press('Enter');
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast']) // We'll check manually
      .analyze();
    
    // Run color contrast check separately
    const contrastResults = await new AxeBuilder({ page })
      .include('body')
      .withRules(['color-contrast'])
      .analyze();
    
    expect(contrastResults.violations).toEqual([]);
  });
});

test.describe('Navigation Accessibility', () => {
  test('should have accessible navigation labels', async ({ page }) => {
    await page.goto('/');
    
    // Check bottom navigation
    const navLinks = page.locator('nav a, nav button');
    const count = await navLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      const text = await link.textContent();
      
      // Should have either visible text or aria-label
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test('should indicate current page in navigation', async ({ page }) => {
    await page.goto('/habits');
    
    // Check for aria-current or active state
    const activeLink = page.locator('nav [aria-current="page"], nav .active');
    await expect(activeLink).toHaveCount(1);
  });
});

test.describe('Form Accessibility', () => {
  test('should have properly labeled form inputs', async ({ page }) => {
    await page.goto('/');
    
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        // Check for associated label
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;
        
        // Should have label, aria-label, or aria-labelledby
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should show error messages accessibly', async ({ page }) => {
    await page.goto('/');
    
    // This is a placeholder - implement based on your forms
    // Example: trigger validation error and check for aria-describedby
  });
});

test.describe('Screen Reader Support', () => {
  test('should have descriptive page titles', async ({ page }) => {
    await page.goto('/');
    expect(await page.title()).toContain('Lento');
    
    await page.goto('/habits');
    expect(await page.title()).toContain('Habits');
    
    await page.goto('/finance');
    expect(await page.title()).toContain('Finance');
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/');
    
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    // Should have at least one live region for toast notifications
    expect(await liveRegions.count()).toBeGreaterThan(0);
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should have adequate touch targets', async ({ page }) => {
    await page.goto('/');
    
    // All interactive elements should be at least 44x44px (WCAG 2.1 Level AAA)
    const buttons = page.locator('button, a');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Minimum 44x44 for touch targets
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should support screen reader navigation on mobile', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
