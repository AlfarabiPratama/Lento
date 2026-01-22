import { test, expect } from '@playwright/test';

/**
 * Critical User Flows - Visual Regression
 * 
 * Tests key user journeys to ensure visual consistency
 * across multi-step interactions.
 */

const VIEWPORT = { width: 1280, height: 720 };

test.describe('User Flow - Adding a Habit', () => {
  test.use({ viewport: VIEWPORT });

  test('Complete flow from empty to added', async ({ page }) => {
    await page.goto('/habits');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Empty state
    await expect(page).toHaveScreenshot('flow-habit-1-empty.png', {
      animations: 'disabled',
    });
    
    // Step 2: Open add modal
    await page.click('button[aria-label*="Tambah"]');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('flow-habit-2-modal-open.png', {
      animations: 'disabled',
    });
    
    // Step 3: Fill form
    await page.fill('input[name="title"]', 'Morning Exercise');
    await page.fill('textarea[name="description"]', 'Do 30 minutes of exercise');
    await expect(page).toHaveScreenshot('flow-habit-3-form-filled.png', {
      animations: 'disabled',
    });
    
    // Note: Step 4 (success) requires actual form submission and backend
  });
});

test.describe('User Flow - Reading Session', () => {
  test.use({ viewport: VIEWPORT });

  test('Book selection to Pomodoro timer', async ({ page }) => {
    await page.goto('/books');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Books list
    await expect(page).toHaveScreenshot('flow-reading-1-books-list.png', {
      animations: 'disabled',
    });
    
    // Step 2: Open quick log
    const quickLogButton = page.locator('text=/Log/i').first();
    if (await quickLogButton.isVisible()) {
      await quickLogButton.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('flow-reading-2-quick-log.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('User Flow - Theme Switching', () => {
  test.use({ viewport: VIEWPORT });

  test('Light to dark theme transition', async ({ page }) => {
    // Start in light mode
    await page.addInitScript(() => {
      localStorage.setItem('lento-theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Capture light mode
    await expect(page).toHaveScreenshot('flow-theme-1-light.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // Switch to dark mode
    await page.goto('/more');
    const darkModeToggle = page.locator('text=/Mode Malam/i');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition
      
      await expect(page).toHaveScreenshot('flow-theme-2-dark.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});

test.describe('User Flow - Calendar Navigation', () => {
  test.use({ viewport: VIEWPORT });

  test('Month to week to day view', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Month view
    await expect(page).toHaveScreenshot('flow-calendar-1-month.png', {
      animations: 'disabled',
    });
    
    // Step 2: Switch to week view
    const weekButton = page.locator('button:has-text("Week")');
    if (await weekButton.isVisible()) {
      await weekButton.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('flow-calendar-2-week.png', {
        animations: 'disabled',
      });
    }
    
    // Step 3: Click a day to open details
    const dayCell = page.locator('[data-testid="calendar-day"]').first();
    if (await dayCell.isVisible()) {
      await dayCell.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('flow-calendar-3-day-detail.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('User Flow - Quick Capture', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // Mobile

  test('FAB to capture modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Home with FAB visible
    await expect(page).toHaveScreenshot('flow-capture-1-home-fab.png', {
      animations: 'disabled',
    });
    
    // Step 2: Click FAB
    const fab = page.locator('button[aria-label*="Tambah"]').last();
    if (await fab.isVisible()) {
      await fab.click();
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('flow-capture-2-modal-open.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('User Flow - Settings Navigation', () => {
  test.use({ viewport: VIEWPORT });

  test('Tab switching in settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Step 1: General tab
    await expect(page).toHaveScreenshot('flow-settings-1-general.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // Step 2: Notifications tab
    const notifTab = page.locator('button[role="tab"]:has-text("Notifikasi")');
    if (await notifTab.isVisible()) {
      await notifTab.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('flow-settings-2-notifications.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
    
    // Step 3: Sync tab
    const syncTab = page.locator('button[role="tab"]:has-text("Sinkronisasi")');
    if (await syncTab.isVisible()) {
      await syncTab.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('flow-settings-3-sync.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});

test.describe('User Flow - Goal Creation', () => {
  test.use({ viewport: VIEWPORT });

  test('Empty state to goal form', async ({ page }) => {
    await page.goto('/more/goals');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Goals page
    await expect(page).toHaveScreenshot('flow-goal-1-list.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // Step 2: Click add button
    const addButton = page.locator('button:has-text("Tambah")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('flow-goal-2-form.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('User Flow - Finance Transaction', () => {
  test.use({ viewport: VIEWPORT });

  test('Add expense flow', async ({ page }) => {
    await page.goto('/more/finance');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Finance overview
    await expect(page).toHaveScreenshot('flow-finance-1-overview.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // Step 2: Open add transaction
    const addButton = page.locator('button[aria-label*="Tambah"]').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('flow-finance-2-add-modal.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('User Flow - Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Bottom nav tab switching', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Today tab
    await expect(page).toHaveScreenshot('flow-mobile-nav-1-today.png', {
      animations: 'disabled',
    });
    
    // Step 2: Habits tab
    await page.click('a[href="/habits"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('flow-mobile-nav-2-habits.png', {
      animations: 'disabled',
    });
    
    // Step 3: Calendar tab
    await page.click('a[href="/calendar"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('flow-mobile-nav-3-calendar.png', {
      animations: 'disabled',
    });
    
    // Step 4: More tab
    await page.click('a[href="/more"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('flow-mobile-nav-4-more.png', {
      animations: 'disabled',
    });
  });
});
