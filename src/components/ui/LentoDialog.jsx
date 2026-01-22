import { useEffect, useRef } from 'react'
import { IconX } from '@tabler/icons-react'

/**
 * LentoDialog - Desktop modal with enforced sizing
 * 
 * Rules:
 * - Min width: 280px
 * - Max width: 560px
 * - Close button: 48x48 tap target
 */
export function LentoDialog({
    open,
    title = 'Dialog',
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
        <div className="fixed inset-0 z-50" aria-hidden={!open}>
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 animate-fade-in"
                onClick={onClose}
                aria-label="Tutup dialog"
            />

            {/* Container */}
            <div className="relative z-10 flex min-h-full items-center justify-center p-4">
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    className={`
            w-full bg-[var(--lento-surface)] shadow-xl
            rounded-2xl border border-[var(--lento-border)]
            min-w-[280px] max-w-[480px]
            outline-none lento-focus animate-scale-in
            ${className}
          `}
                >
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--lento-border)]">
                        <h2 className="text-lg font-semibold text-[var(--lento-text)] truncate min-w-0">
                            {title}
                        </h2>

                        {/* Close - 48x48 tap target */}
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
                    <div className="px-6 py-4">{children}</div>

                    {/* Footer */}
                    {footer && (
                        <footer className="px-6 pb-6 pt-2">{footer}</footer>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LentoDialog
