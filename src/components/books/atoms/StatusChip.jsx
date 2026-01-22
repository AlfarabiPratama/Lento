import { getStatusConfig } from '../../../features/books/constants.js'

/**
 * StatusChip - Display book status with semantic colors
 */
export function StatusChip({ status, showIcon = false, className = '' }) {
    const config = getStatusConfig(status)
    const Icon = config.icon

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-tiny font-medium ${className}`}
            style={{
                backgroundColor: `var(--status-${status}-bg)`,
                color: `var(--status-${status}-text)`
            }}
        >
            {showIcon && <Icon size={14} stroke={2} />}
            <span>{config.shortLabel}</span>
        </span>
    )
}

export default StatusChip
