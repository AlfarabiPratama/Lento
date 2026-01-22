import { SEARCH_SCOPES, SCOPE_LABELS, SCOPE_ICONS } from '../../../features/search/constants'

/**
 * ScopeTabs - Horizontal tabs for search scope
 */
export function ScopeTabs({ value, onChange, className = '' }) {
    const scopes = Object.values(SEARCH_SCOPES)

    return (
        <div className={`flex gap-1 overflow-x-auto scrollbar-hide ${className}`}>
            {scopes.map((scope) => {
                const Icon = SCOPE_ICONS[scope]
                const isActive = value === scope

                return (
                    <button
                        key={scope}
                        onClick={() => onChange(scope)}
                        className={`
              inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
              text-small font-medium whitespace-nowrap
              transition-all
              ${isActive
                                ? 'bg-primary text-white'
                                : 'text-ink-muted hover:bg-paper-warm hover:text-ink'
                            }
            `}
                    >
                        {Icon && <Icon size={16} stroke={2} />}
                        <span>{SCOPE_LABELS[scope]}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default ScopeTabs
