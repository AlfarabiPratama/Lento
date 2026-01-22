/**
 * Safe Redirect Utility
 * 
 * Prevents open redirect vulnerabilities by sanitizing redirect URLs.
 * Only allows internal app paths (relative URLs starting with /).
 * 
 * SECURITY CRITICAL: OWASP warns that unvalidated redirects can be exploited for phishing.
 * Reference: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/04-Testing_for_Client-side_URL_Redirect
 * 
 * UPGRADE: Uses URL parser + allowlist validation (OWASP recommended approach)
 */

/**
 * Allowed routes for redirect (OWASP: prefer allowlist over denylist)
 * Exact matches or prefix patterns
 */
const ALLOWED_ROUTES = [
    '/',
    '/today',
    '/habits',
    '/journal',
    '/space',
    '/books',
    '/more',
    '/settings',
    '/auth',
    '/finance',
    '/fokus',
    '/goals',
]

/**
 * Allowed route prefixes (for dynamic routes like /space/note-id)
 */
const ALLOWED_PREFIXES = [
    '/space/',
    '/books/',
]

/**
 * Check if pathname is in allowlist
 */
function isAllowedRoute(pathname) {
    // Exact match
    if (ALLOWED_ROUTES.includes(pathname)) {
        return true
    }

    // Prefix match
    return ALLOWED_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

/**
 * Sanitize a redirect URL parameter
 * @param {string|null} next - The redirect URL from query params
 * @returns {string} - Safe internal path or default '/'
 */
export function sanitizeNext(next) {
    // Reject null, undefined, or non-string values
    if (!next || typeof next !== 'string') {
        return '/'
    }

    // Trim whitespace (防止 " /settings " 之类的 trick)
    next = next.trim()

    // Reject empty string after trim
    if (!next.length) {
        return '/'
    }

    // Block percent-encoded control characters (CRITICAL!)
    // These can bypass literal checks: %0a (newline), %0d (CR), %09 (tab), %00 (null)
    // Case-insensitive because %0A and %0a are equivalent
    if (/%0[ad09]/i.test(next)) {
        console.warn('Blocked percent-encoded control character in redirect:', next)
        return '/'
    }

    // Block control characters (newline, carriage return, tab, null byte)
    // These can be used in parsing tricks: "/\nhttps://evil.com"
    if (/[\n\r\t\0]/.test(next)) {
        return '/'
    }

    // Only allow paths starting with '/' (internal routes)
    if (!next.startsWith('/')) {
        return '/'
    }

    // Prevent protocol-relative URLs (e.g., //evil.com)
    if (next.startsWith('//')) {
        return '/'
    }

    // Prevent absolute URLs (http://, https://)
    if (next.includes('http://') || next.includes('https://')) {
        return '/'
    }

    // Additional safety: prevent javascript: protocol and data: URIs
    const lowerNext = next.toLowerCase()
    if (lowerNext.includes('javascript:') || lowerNext.includes('data:')) {
        return '/'
    }

    // ROBUST VALIDATION: Use URL parser to validate
    // This catches edge cases that string checks might miss
    try {
        // Parse as URL relative to current origin
        const url = new URL(next, window.location.origin)

        // Ensure origin matches (prevents tricks like "/\@evil.com")
        if (url.origin !== window.location.origin) {
            return '/'
        }

        // NORMALIZE PATH: Remove trailing slash for consistent allowlist matching
        // e.g., /settings/ -> /settings (unless it's root /)
        let pathname = url.pathname
        if (pathname.length > 1 && pathname.endsWith('/')) {
            pathname = pathname.slice(0, -1)
        }

        // ALLOWLIST VALIDATION (OWASP recommended approach)
        // Only allow known safe routes
        if (!isAllowedRoute(pathname)) {
            console.warn('Blocked non-allowlisted route:', pathname)
            return '/'
        }

        // Return sanitized pathname + search + hash
        // Use normalized pathname for consistency
        return pathname + url.search + url.hash
    } catch (error) {
        // URL parsing failed - not a valid URL
        console.warn('Invalid redirect URL:', next, error)
        return '/'
    }
}

export default sanitizeNext
