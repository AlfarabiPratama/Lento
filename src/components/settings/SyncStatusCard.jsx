import { IconRefresh } from '@tabler/icons-react'

/**
 * SyncStatusCard - Reusable card for displaying sync metrics
 * 
 * Props:
 * - label: Card title (e.g., "Last sync")
 * - value: Display value (string or number)
 * - variant: Visual style ('default' | 'success' | 'warning' | 'danger')
 * - subtitle: Optional subtitle text
 * - action: Optional action icon/button
 */
export function SyncStatusCard({
    label,
    value,
    variant = 'default',
    subtitle,
    action,
}) {
    const variantStyles = {
        default: 'border-line',
        success: 'border-success/20 bg-success/5',
        warning: 'border-warning/20 bg-warning/5',
        danger: 'border-danger/20 bg-danger/5',
    }

    const textStyles = {
        default: 'text-ink',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
    }

    return (
        <div className={`card p-4 border ${variantStyles[variant]}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-tiny text-ink-muted uppercase tracking-wide mb-1">
                        {label}
                    </p>
                    <p className={`text-h3 font-semibold ${textStyles[variant]} truncate`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-tiny text-ink-muted mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SyncStatusCard
