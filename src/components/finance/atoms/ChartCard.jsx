import { IconChevronDown } from '@tabler/icons-react'

/**
 * ChartCard - Reusable container for charts
 */
export function ChartCard({
    title,
    subtitle,
    icon: Icon,
    iconColor = 'text-primary',
    iconBg = 'bg-primary/10',
    children,
    className = ''
}) {
    return (
        <div className={`card p-4 ${className}`}>
            {/* Header */}
            {title && (
                <div className="flex items-center gap-2 mb-4">
                    {Icon && (
                        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                            <Icon size={18} stroke={2} className={iconColor} />
                        </div>
                    )}
                    <div>
                        <h3 className="text-h3 text-ink font-medium">{title}</h3>
                        {subtitle && <p className="text-small text-ink-muted">{subtitle}</p>}
                    </div>
                </div>
            )}

            {/* Content */}
            <div>{children}</div>
        </div>
    )
}

export default ChartCard
