import { useEffect, useRef } from 'react'
import { IconX } from '@tabler/icons-react'

/**
 * LentoSheet - Mobile bottom sheet with enforced sizing
 * 
 * Rules:
 * - Max width: 640px
 * - Close button always visible (not just swipe)
 * - Drag handle optional
 */
export function LentoSheet({
    open,
    title = 'Sheet',
    onClose,
    children,
    footer,
    className = '',
}) {
    const panelRef = useRef(null)

    useEffect(() => {
        if (!open) return

        panelRef.current?.focus()

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 animate-fade-in"
                onClick={onClose}
                aria-label="Tutup"
            />

            {/* Sheet container */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-4">
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    className={`
            w-full bg-[var(--lento-surface)] shadow-2xl
            rounded-t-3xl border border-[var(--lento-border)]
            max-w-[var(--sheet-max-w)]
            outline-none lento-focus animate-slide-up
            max-h-[90vh] overflow-y-auto
            ${className}
          `}
                >
                    {/* Drag handle (visual only) */}
                    <div className="flex justify-center pt-3">
                        <div className="h-1.5 w-12 rounded-full bg-black/10" />
                    </div>

                    {/* Header */}
                    <header className="flex items-center justify-between px-5 py-3">
                        <h2 className="text-base font-semibold text-[var(--lento-text)]">
                            {title}
                        </h2>
                        {/* Close - 48x48 tap target (MANDATORY) */}
                        <button
                            onClick={onClose}
                            className="tap-target -mr-2 inline-flex items-center justify-center rounded-full hover:bg-black/5 lento-focus"
                            aria-label="Tutup"
                            type="button"
                        >
                            <IconX size={20} stroke={1.5} />
                        </button>
                    </header>

                    {/* Content */}
                    <div className="px-5 pb-4">{children}</div>

                    {/* Footer */}
                    {footer && (
                        <footer className="px-5 pb-5 pb-safe">{footer}</footer>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LentoSheet
