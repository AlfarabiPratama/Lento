import { useState, useEffect } from 'react'

/**
 * useResponsive - Detect viewport size
 * 
 * Breakpoints:
 * - Mobile: < 1024px
 * - Desktop: >= 1024px
 */
export function useResponsive() {
    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window === 'undefined') return false
        return window.innerWidth >= 1024
    })

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return { isDesktop, isMobile: !isDesktop }
}

export default useResponsive
