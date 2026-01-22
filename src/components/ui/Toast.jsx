import { IconCheck, IconX, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react'
import { useToast } from '../../contexts/ToastContext'

/**
 * Toast Component - Notification system
 * 
 * Best practices applied:
 * - Solid background (high contrast, better readability)
 * - Bottom-center position (thumb-zone friendly on mobile)
 * - Dark theme with white text (consistent visibility)
 * - Duration 3s for regular, 5s for actionable
 */
export function Toast({ toast }) {
    const { dismissToast } = useToast()

    // Dark solid backgrounds with white text for high contrast
    const typeConfig = {
        success: {
            icon: IconCheck,
            bgClass: 'bg-emerald-700',
            iconClass: 'text-emerald-200',
            textClass: 'text-white'
        },
        error: {
            icon: IconAlertCircle,
            bgClass: 'bg-red-700',
            iconClass: 'text-red-200',
            textClass: 'text-white'
        },
        warning: {
            icon: IconAlertCircle,
            bgClass: 'bg-amber-600',
            iconClass: 'text-amber-100',
            textClass: 'text-white'
        },
        info: {
            icon: IconInfoCircle,
            bgClass: 'bg-slate-700',
            iconClass: 'text-slate-300',
            textClass: 'text-white'
        }
    }

    const config = typeConfig[toast.type] || typeConfig.info
    const Icon = config.icon

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${config.bgClass} shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300`}
            role="alert"
            aria-live="polite"
        >
            <Icon size={20} stroke={2} className={`flex-shrink-0 ${config.iconClass}`} />

            <div className="flex-1 min-w-0">
                <p className={`text-body ${config.textClass}`}>
                    {toast.message}
                </p>
                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action.onClick()
                            dismissToast(toast.id)
                        }}
                        className="text-small font-medium text-white/80 hover:text-white underline mt-1"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                aria-label="Tutup"
            >
                <IconX size={16} stroke={2} className="text-white/70" />
            </button>
        </div>
    )
}

/**
 * ToastContainer - Renders all active toasts
 * Position: bottom-right (moved from bottom-center to avoid blocking FAB)
 */
export function ToastContainer() {
    const { toasts } = useToast()

    if (toasts.length === 0) return null

    return (
        <div
            className="fixed bottom-4 right-4 z-50 space-y-2 w-[calc(100%-2rem)] max-w-sm md:max-w-xs"
            style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    )
}

export default Toast

