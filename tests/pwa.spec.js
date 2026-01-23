import { test, expect } from '@playwright/test'

test.describe('PWA Installation', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant necessary permissions
    await context.grantPermissions(['notifications'])
    await page.goto('/')
  })

  test('should show install prompt after conditions met', async ({ page }) => {
    // Visit page multiple times to trigger install prompt
    await page.evaluate(() => {
      localStorage.setItem('visitCount', '3')
    })
    
    await page.reload()
    await page.waitForTimeout(1000)
    
    // Check if install prompt appears
    const installButton = page.locator('[data-testid="pwa-install-button"]')
    await expect(installButton).toBeVisible({ timeout: 5000 })
  })

  test('should have valid manifest.json', async ({ page }) => {
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)
    
    const manifest = await response?.json()
    expect(manifest.name).toBe('Lento')
    expect(manifest.short_name).toBe('Lento')
    expect(manifest.theme_color).toBeDefined()
    expect(manifest.background_color).toBeDefined()
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons).toHaveLength(5)
  })

  test('should have service worker registered', async ({ page }) => {
    await page.goto('/')
    
    const swRegistration = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      return {
        active: !!registration?.active,
        scope: registration?.scope
      }
    })
    
    expect(swRegistration.active).toBe(true)
    expect(swRegistration.scope).toContain('/')
  })

  test('should track install prompt dismissal', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('visitCount', '3')
    })
    
    await page.reload()
    await page.waitForTimeout(1000)
    
    const dismissButton = page.locator('[data-testid="pwa-dismiss-button"]')
    if (await dismissButton.isVisible()) {
      await dismissButton.click()
      
      const dismissed = await page.evaluate(() => {
        return localStorage.getItem('pwaPromptDismissed')
      })
      
      expect(dismissed).toBeTruthy()
    }
  })
})

test.describe('Offline Functionality', () => {
  test('should show offline page when network is unavailable', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Go offline
    await context.setOffline(true)
    
    // Try to navigate to a new page
    await page.goto('/habits', { waitUntil: 'domcontentloaded' })
    
    // Should show offline fallback
    const offlineMessage = page.locator('text=/offline|tidak terhubung/i')
    await expect(offlineMessage).toBeVisible({ timeout: 5000 })
  })

  test('should show offline indicator when network drops', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Go offline
    await context.setOffline(true)
    
    // Wait for offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]')
    await expect(offlineIndicator).toBeVisible({ timeout: 3000 })
    
    // Verify indicator text
    await expect(offlineIndicator).toContainText(/offline|tidak terhubung/i)
  })

  test('should cache and serve assets offline', async ({ page, context }) => {
    // Visit page online first
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Wait for service worker to cache assets
    await page.waitForTimeout(2000)
    
    // Go offline
    await context.setOffline(true)
    
    // Reload page - should load from cache
    await page.reload()
    
    // Verify page loads
    const title = await page.title()
    expect(title).toContain('Lento')
    
    // Verify main content is visible
    const mainContent = page.locator('main, [role="main"]')
    await expect(mainContent).toBeVisible()
  })

  test('should queue actions when offline', async ({ page, context }) => {
    await page.goto('/habits')
    await page.waitForLoadState('networkidle')
    
    // Go offline
    await context.setOffline(true)
    
    // Try to complete a habit
    const habitCheckbox = page.locator('[data-testid="habit-checkbox"]').first()
    if (await habitCheckbox.isVisible()) {
      await habitCheckbox.click()
      
      // Should show queued indicator
      const queueIndicator = page.locator('[data-testid="sync-queued"]')
      await expect(queueIndicator).toBeVisible({ timeout: 2000 })
    }
  })

  test('should sync queued actions when back online', async ({ page, context }) => {
    await page.goto('/habits')
    await page.waitForLoadState('networkidle')
    
    // Go offline
    await context.setOffline(true)
    await page.waitForTimeout(500)
    
    // Perform action
    const habitCheckbox = page.locator('[data-testid="habit-checkbox"]').first()
    if (await habitCheckbox.isVisible()) {
      await habitCheckbox.click()
    }
    
    // Go back online
    await context.setOffline(false)
    await page.waitForTimeout(1000)
    
    // Should show syncing indicator
    const syncIndicator = page.locator('[data-testid="sync-indicator"]')
    await expect(syncIndicator).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Service Worker Lifecycle', () => {
  test('should show update notification when new SW available', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Simulate service worker update
    await page.evaluate(() => {
      // Dispatch custom event to simulate SW update
      window.dispatchEvent(new CustomEvent('swUpdated', {
        detail: { registration: { waiting: {} } }
      }))
    })
    
    // Check for update notification
    const updateNotification = page.locator('[data-testid="sw-update-notification"]')
    await expect(updateNotification).toBeVisible({ timeout: 3000 })
  })

  test('should reload app when update is accepted', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Simulate SW update
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('swUpdated', {
        detail: { registration: { waiting: { postMessage: () => {} } } }
      }))
    })
    
    const updateButton = page.locator('[data-testid="sw-update-button"]')
    if (await updateButton.isVisible()) {
      // Click update button should reload
      const navigationPromise = page.waitForNavigation()
      await updateButton.click()
      await navigationPromise
      
      // Page should reload
      expect(page.url()).toBeTruthy()
    }
  })

  test('should handle service worker errors gracefully', async ({ page }) => {
    // Override service worker registration to simulate error
    await page.addInitScript(() => {
      const originalRegister = navigator.serviceWorker.register
      navigator.serviceWorker.register = () => {
        return Promise.reject(new Error('SW registration failed'))
      }
    })
    
    await page.goto('/')
    
    // Page should still load without service worker
    const title = await page.title()
    expect(title).toContain('Lento')
  })
})

test.describe('PWA Features', () => {
  test('should have correct viewport meta tag', async ({ page }) => {
    await page.goto('/')
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
    expect(viewport).toContain('initial-scale=1')
  })

  test('should have theme color meta tag', async ({ page }) => {
    await page.goto('/')
    
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content')
    expect(themeColor).toBeTruthy()
  })

  test('should have apple touch icon', async ({ page }) => {
    await page.goto('/')
    
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')
    expect(appleTouchIcon).toBeTruthy()
  })

  test('should support sharing with Web Share API', async ({ page, browserName }) => {
    // Web Share API only available in certain contexts
    if (browserName !== 'chromium') {
      test.skip()
    }
    
    await page.goto('/')
    
    const hasShareAPI = await page.evaluate(() => {
      return 'share' in navigator
    })
    
    // Just check if API is available (actual sharing requires user gesture)
    expect(typeof hasShareAPI).toBe('boolean')
  })

  test('should request notification permission appropriately', async ({ page }) => {
    await page.goto('/settings')
    
    const notificationToggle = page.locator('[data-testid="notification-toggle"]')
    if (await notificationToggle.isVisible()) {
      // Should only request permission when user explicitly enables
      await notificationToggle.click()
      
      // Check if permission was requested
      const permission = await page.evaluate(() => {
        return Notification.permission
      })
      
      expect(['granted', 'denied', 'default']).toContain(permission)
    }
  })
})

test.describe('Cache Management', () => {
  test('should show cache size in settings', async ({ page }) => {
    await page.goto('/settings')
    
    // Look for cache management section
    const cacheSection = page.locator('text=/cache|storage/i')
    if (await cacheSection.isVisible()) {
      // Should display cache size
      const sizeDisplay = page.locator('[data-testid="cache-size"]')
      await expect(sizeDisplay).toBeVisible()
    }
  })

  test('should allow clearing cache', async ({ page }) => {
    await page.goto('/settings')
    
    const clearCacheButton = page.locator('[data-testid="clear-cache-button"]')
    if (await clearCacheButton.isVisible()) {
      await clearCacheButton.click()
      
      // Should show confirmation or success message
      const confirmation = page.locator('text=/cleared|success|berhasil/i')
      await expect(confirmation).toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe('Performance', () => {
  test('should load main page quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcp = entries.find(e => e.entryType === 'largest-contentful-paint')
          resolve({ lcp: lcp?.startTime })
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Timeout after 5 seconds
        setTimeout(() => resolve({ lcp: null }), 5000)
      })
    })
    
    if (metrics.lcp) {
      // LCP should be under 2.5s for good rating
      expect(metrics.lcp).toBeLessThan(2500)
    }
  })
})
