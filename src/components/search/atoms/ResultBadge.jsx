import { SCOPE_ICONS, SCOPE_LABELS } from '../../../features/search/constants'

/**
 * ResultBadge - Module badge for search results
 */
export function ResultBadge({ module, className = '' }) {
    const Icon = SCOPE_ICONS[module]
    const label = SCOPE_LABELS[module]

    const colorMap = {
        space: 'bg-blue-100 text-blue-700',
        journal: 'bg-purple-100 text-purple-700',
        finance: 'bg-green-100 text-green-700',
        habit: 'bg-orange-100 text-orange-700',
        pomodoro: 'bg-pink-100 text-pink-700',
        book: 'bg-teal-100 text-teal-700',
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-md
        text-tiny font-medium
        ${colorMap[module] || 'bg-gray-100 text-gray-700'}
        ${className}
      `}
        >
            {Icon && <Icon size={12} stroke={2} />}
            <span>{label}</span>
        </span>
    )
}

export default ResultBadge
