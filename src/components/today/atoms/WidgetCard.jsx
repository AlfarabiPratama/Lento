import { IconChevronRight } from '@tabler/icons-react'

/**
 * WidgetCard - Base card component for Today widgets
 * Responsive: moderate size on mobile, normal on desktop
 * 
 * IMPORTANT: overflow-hidden + min-w-0 prevent text from
 * stretching the card in grid layouts
 */
export function WidgetCard({
    title,
    icon: Icon,
    iconColor = 'text-primary',
    iconBg = 'bg-primary/10',
    action,
    actionLabel = 'Buka',
    onAction,
    children,
    className = ''
}) {
    return (
        <div className={`card p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-hidden min-w-0 ${className}`}>
            {/* Header - responsive */}
            <div className="flex items-center justify-between gap-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={14} stroke={2} className={`${iconColor} sm:hidden`} />
                        <Icon size={18} stroke={2} className={`${iconColor} hidden sm:block`} />
                    </div>
                    <h3 className="text-small sm:text-h3 text-ink font-medium truncate">{title}</h3>
                </div>

                {onAction && (
                    <button
                        onClick={onAction}
                        className="text-tiny sm:text-small text-primary hover:underline flex items-center gap-0.5 flex-shrink-0"
                    >
                        <span>{actionLabel}</span>
                        <IconChevronRight size={12} stroke={2} className="hidden sm:block" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="text-small sm:text-body min-w-0">{children}</div>

            {/* Primary action button */}
            {action && (
                <div>{action}</div>
            )}
        </div>
    )
}

export default WidgetCard

