import { IconCheck } from '@tabler/icons-react'

/**
 * FilterChip - Selectable filter chip
 */
export function FilterChip({
    label,
    selected = false,
    onClick,
    icon: Icon,
    className = '',
}) {
    return (
        <button
            onClick={onClick}
            className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-small font-medium whitespace-nowrap
        border transition-all
        ${selected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-paper-warm text-ink-muted border-line hover:border-primary/50 hover:text-ink'
                }
        ${className}
      `}
        >
            {selected && <IconCheck size={14} stroke={2.5} />}
            {Icon && !selected && <Icon size={14} stroke={2} />}
            <span>{label}</span>
        </button>
    )
}

export default FilterChip
