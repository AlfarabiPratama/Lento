import { useEffect } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'

/**
 * ConfirmDialog - Reusable confirmation modal
 */
export function ConfirmDialog({
    open,
    title,
    message,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    variant = 'default', // 'default' | 'danger'
    onConfirm,
    onCancel,
    children
}) {
    // Close on Esc key
    useEffect(() => {
        if (!open) return

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onCancel()
            }
        }

        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [open, onCancel])

    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    if (!open) return null

    const variantConfig = {
        default: {
            icon: null,
            confirmClass: 'btn-primary'
        },
        danger: {
            icon: IconAlertTriangle,
            confirmClass: 'bg-danger hover:bg-danger/90 text-white px-4 py-2 rounded-lg font-medium transition-colors'
        }
    }

    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div
                className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description"
            >
                {/* Icon */}
                {Icon && (
                    <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
                        <Icon size={24} stroke={2} className="text-danger" />
                    </div>
                )}

                {/* Title */}
                <h3 id="dialog-title" className="text-h2 text-ink mb-2">
                    {title}
                </h3>

                {/* Message */}
                {message && (
                    <p id="dialog-description" className="text-body text-ink-muted mb-6">
                        {message}
                    </p>
                )}

                {/* Custom content */}
                {children && (
                    <div className="mb-6">
                        {children}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            onCancel()
                        }}
                        className={config.confirmClass}
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
