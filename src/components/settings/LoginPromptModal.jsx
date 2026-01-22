import { useEffect, useRef } from 'react'
import { IconX, IconCloud, IconBrandGoogle } from '@tabler/icons-react'

/**
 * LoginPromptModal - Modal prompting user to login for Sync
 * 
 * Follows Material Design dialog pattern: max 2 actions, clear primary/secondary.
 * A11y: role="dialog", focus trap, Esc to close, aria-label on X button.
 */
export function LoginPromptModal({
    isOpen,
    onClose,
    onSignIn,
    loading = false,
}) {
    const modalRef = useRef(null)
    const closeButtonRef = useRef(null)

    // Focus trap and Esc to close
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        // Focus the close button on open
        closeButtonRef.current?.focus()

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-prompt-title"
                aria-describedby="login-prompt-desc"
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                    w-[90vw] max-w-md bg-surface rounded-2xl shadow-lg p-6
                    animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Close button */}
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center
                        rounded-full text-ink-muted hover:text-ink hover:bg-paper-warm
                        transition-colors"
                    aria-label="Tutup"
                >
                    <IconX size={20} />
                </button>

                {/* Content */}
                <div className="text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <IconCloud size={32} className="text-primary" />
                    </div>

                    {/* Title */}
                    <h2 id="login-prompt-title" className="text-h2 text-ink mb-2">
                        Masuk untuk Sync
                    </h2>

                    {/* Description */}
                    <p id="login-prompt-desc" className="text-body text-ink-muted mb-6">
                        Sync & backup menjaga data tetap aman dan bisa dipakai di perangkat lain.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {/* Primary: Sign in */}
                        <button
                            onClick={onSignIn}
                            disabled={loading}
                            className="btn-primary flex items-center justify-center gap-3 w-full py-3"
                        >
                            <IconBrandGoogle size={20} />
                            <span>{loading ? 'Memproses...' : 'Masuk dengan Google'}</span>
                        </button>

                        {/* Secondary: Later */}
                        <button
                            onClick={onClose}
                            className="btn-ghost text-ink-muted hover:text-ink w-full py-2"
                        >
                            Nanti saja
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPromptModal
