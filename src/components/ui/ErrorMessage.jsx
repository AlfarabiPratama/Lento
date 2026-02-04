/**
 * ErrorMessage Component
 * 
 * Accessible error message component with ARIA live regions
 * for screen reader announcements
 * 
 * Features:
 * - ARIA live region for dynamic error announcements
 * - Consistent error styling
 * - Icon support
 * - ID generation for aria-describedby
 * 
 * @example
 * <ErrorMessage id="email-error" error="Email tidak valid" />
 */

import { IconAlertCircle } from '@tabler/icons-react'

export function ErrorMessage({ id, error, className = '' }) {
    if (!error) return null

    return (
        <div
            id={id}
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-2 mt-1 text-sm text-red-600 dark:text-red-400 ${className}`}
        >
            <IconAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
        </div>
    )
}
