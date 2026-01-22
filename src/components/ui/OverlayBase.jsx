import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * OverlayBase - Foundation for all modal overlays (Modal, Sheet, BottomSheet)
 * 
 * Implements the Lento Overlay Contract:
 * ✓ Focus trap (Tab/Shift+Tab stays inside)
 * ✓ Restore focus to trigger on close
 * ✓ Scroll lock (background doesn't scroll)
 * ✓ ESC to close
 * ✓ Proper ARIA (role="dialog", aria-modal, aria-labelledby)
 * ✓ Backdrop click to close (optional)
 * 
 * Based on WAI-ARIA APG Modal Dialog pattern
 */
export function OverlayBase({
    isOpen,
    onClose,
    children,
    labelId,          // ID of the title element for aria-labelledby
    descriptionId,    // Optional: ID for aria-describedby
    closeOnBackdrop = true,
    closeOnEsc = true,
    initialFocusRef,  // Optional: ref to element that should receive initial focus
    className = '',   // Additional classes for the backdrop
}) {
    const overlayRef = useRef(null)
    const triggerRef = useRef(null) // Stores the element that triggered the overlay

    // Store trigger element on open
    useEffect(() => {
        if (isOpen) {
            triggerRef.current = document.activeElement
        }
    }, [isOpen])

    // Scroll lock
    useEffect(() => {
        if (!isOpen) return

        const originalOverflow = document.body.style.overflow
        const originalPaddingRight = document.body.style.paddingRight

        // Calculate scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

        document.body.style.overflow = 'hidden'
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`
        }

        return () => {
            document.body.style.overflow = originalOverflow
            document.body.style.paddingRight = originalPaddingRight
        }
    }, [isOpen])

    // Focus management: initial focus + restore focus
    useEffect(() => {
        if (!isOpen) return

        // Move focus into overlay
        const focusTimer = setTimeout(() => {
            if (initialFocusRef?.current) {
                initialFocusRef.current.focus()
            } else if (overlayRef.current) {
                // Focus first focusable element
                const focusable = overlayRef.current.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                if (focusable) {
                    focusable.focus()
                } else {
                    // Fallback: focus the container itself
                    overlayRef.current.focus()
                }
            }
        }, 10)

        return () => {
            clearTimeout(focusTimer)
            // Restore focus to trigger when closing
            if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
                triggerRef.current.focus()
            }
        }
    }, [isOpen, initialFocusRef])

    // Focus trap
    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return

        // ESC to close
        if (e.key === 'Escape' && closeOnEsc) {
            e.preventDefault()
            e.stopPropagation()
            onClose()
            return
        }

        // Focus trap on Tab
        if (e.key === 'Tab' && overlayRef.current) {
            const focusableElements = overlayRef.current.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
            )

            if (focusableElements.length === 0) return

            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]

            if (e.shiftKey) {
                // Shift+Tab: if on first, go to last
                if (document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement.focus()
                }
            } else {
                // Tab: if on last, go to first
                if (document.activeElement === lastElement) {
                    e.preventDefault()
                    firstElement.focus()
                }
            }
        }
    }, [isOpen, closeOnEsc, onClose])

    // Add keydown listener
    useEffect(() => {
        if (!isOpen) return

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleKeyDown])

    // Handle backdrop click
    const handleBackdropClick = useCallback((e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose()
        }
    }, [closeOnBackdrop, onClose])

    if (!isOpen) return null

    return createPortal(
        <div
            className={`fixed inset-0 z-50 ${className}`}
            onClick={handleBackdropClick}
            role="presentation"
        >
            <div
                ref={overlayRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelId}
                aria-describedby={descriptionId}
                tabIndex={-1}
                className="contents"
            >
                {children}
            </div>
        </div>,
        document.body
    )
}

/**
 * useOverlay - Hook for overlay state management
 */
export function useOverlay(initialOpen = false) {
    const [isOpen, setIsOpen] = useState(initialOpen)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])
    const toggle = useCallback(() => setIsOpen(prev => !prev), [])

    return { isOpen, open, close, toggle, setIsOpen }
}

export default OverlayBase

