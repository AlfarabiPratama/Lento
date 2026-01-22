/**
 * Sentry Error Tracking Integration
 * 
 * Provides centralized error monitoring for production.
 * Opt-in: Only activates if VITE_SENTRY_DSN is set.
 * 
 * Setup:
 * 1. Create account at https://sentry.io (free for hobby)
 * 2. Create new React project
 * 3. Copy DSN and add to .env: VITE_SENTRY_DSN=your_dsn_here
 * 4. Deploy - errors will be reported automatically
 */

import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

/**
 * Initialize Sentry error tracking
 * Only runs in production and if DSN is configured
 */
export function initErrorTracking() {
    // Skip if no DSN or in development
    if (!SENTRY_DSN) {
        console.log('[Sentry] Disabled: No DSN configured')
        return false
    }

    if (import.meta.env.DEV) {
        console.log('[Sentry] Disabled: Development mode')
        return false
    }

    try {
        Sentry.init({
            dsn: SENTRY_DSN,
            environment: import.meta.env.MODE,

            // Performance monitoring (sample 10% of transactions)
            tracesSampleRate: 0.1,

            // Session replay for debugging (sample 10%)
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0, // 100% on errors

            // Ignore common non-actionable errors
            ignoreErrors: [
                // Network errors
                'Network request failed',
                'Failed to fetch',
                'Load failed',
                // Browser extensions
                'ResizeObserver loop',
                'Non-Error promise rejection',
                // User interruptions
                'AbortError',
            ],

            // Attach user context if available
            beforeSend(event) {
                // Add user info if logged in
                const userId = localStorage.getItem('lento.user.id')
                if (userId) {
                    event.user = { id: userId }
                }
                return event
            },
        })

        console.log('[Sentry] Initialized successfully')
        return true
    } catch (err) {
        console.error('[Sentry] Failed to initialize:', err)
        return false
    }
}

/**
 * Capture exception manually
 */
export function captureError(error, context = {}) {
    if (!SENTRY_DSN) return

    Sentry.captureException(error, {
        extra: context,
    })
}

/**
 * Set user context for error reports
 */
export function setUser(user) {
    if (!SENTRY_DSN) return

    Sentry.setUser(user ? {
        id: user.id,
        email: user.email,
    } : null)
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message, category = 'action', data = {}) {
    if (!SENTRY_DSN) return

    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
    })
}

/**
 * Sentry ErrorBoundary component wrapper
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary

export default {
    init: initErrorTracking,
    captureError,
    setUser,
    addBreadcrumb,
}
