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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 animate-fade-in"
                onClick={onClose}
                role="presentation"
            />

            {/* Sheet panel - centered */}
            <div
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={{ maxWidth: '640px' }}
                className={`
          relative w-full bg-surface shadow-2xl
          rounded-2xl border border-line
          outline-none focus:outline-primary focus:outline-2 focus:outline-offset-2
          animate-scale-in
          max-h-[85vh] overflow-y-auto
          ${className}
        `}
            >
                {/* Header */}
                <header className="flex items-center justify-between px-5 py-4 border-b border-line">
                    <h2 className="text-base font-semibold text-ink">
                        {title}
                    </h2>
                    {/* Close - 48x48 tap target (MANDATORY) */}
                    <button
                        onClick={onClose}
                        className="min-w-[44px] min-h-[44px] -mr-2 inline-flex items-center justify-center rounded-full hover:bg-black/5 focus:outline-primary focus:outline-2 focus:outline-offset-2 transition-colors"
                        aria-label="Tutup"
                        type="button"
                    >
                        <IconX size={20} stroke={1.5} />
                    </button>
                </header>

                {/* Content */}
                <div className="px-5 py-4">{children}</div>

                {/* Footer */}
                {footer && (
                    <footer className="px-5 pb-5 border-t border-line pt-4">{footer}</footer>
                )}
            </div>
        </div>
    )
}

export default LentoSheet
