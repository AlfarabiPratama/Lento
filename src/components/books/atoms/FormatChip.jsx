import { getFormatConfig } from '../../../features/books/constants.js'

/**
 * FormatChip - Display book format
 */
export function FormatChip({ format, showLabel = true, className = '' }) {
    const config = getFormatConfig(format)
    const Icon = config.icon

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-paper-warm text-ink-muted text-tiny ${className}`}>
            <Icon size={14} stroke={2} />
            {showLabel && <span>{config.label}</span>}
        </span>
    )
}

export default FormatChip
