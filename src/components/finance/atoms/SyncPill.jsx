import { SYNC_STATES } from '../../../features/finance/constants'

/**
 * SyncPill - Display sync status indicator
 * 
 * States: synced, syncing, offline, error
 * Follows "calm technology" principle - quiet when synced
 */

/**
 * @param {Object} props
 * @param {'synced' | 'syncing' | 'offline' | 'error'} props.state
 * @param {string} [props.lastSyncedAt] - ISO date string
 * @param {number} [props.pendingCount] - Number of pending items
 * @param {() => void} [props.onClick]
 * @param {string} [props.className]
 */
function SyncPill({
    state = 'synced',
    lastSyncedAt,
    pendingCount = 0,
    onClick,
    className = ''
}) {
    const config = SYNC_STATES[state] || SYNC_STATES.synced
    const IconComponent = config.IconComponent

    // Synced state is quiet (minimal visibility)
    const isSynced = state === 'synced'

    // Base styles
    const baseClass = `
    inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-caption
    transition-all
    ${isSynced ? 'opacity-60 hover:opacity-100' : 'opacity-100'}
    ${onClick ? 'cursor-pointer hover:bg-paper-warm' : ''}
    ${config.colorClass}
    ${className}
  `

    const handleClick = onClick ? () => onClick() : undefined

    return (
        <button
            type="button"
            onClick={handleClick}
            className={baseClass}
            title={config.label}
            disabled={!onClick}
        >
            <IconComponent
                size={14}
                stroke={2}
                className={config.animate ? 'animate-spin' : ''}
            />

            {/* Show label for non-synced states */}
            {!isSynced && (
                <span className="text-caption">
                    {state === 'syncing' && pendingCount > 0
                        ? `${pendingCount}...`
                        : config.label
                    }
                </span>
            )}

            {/* Show pending count badge for offline */}
            {state === 'offline' && pendingCount > 0 && (
                <span className="bg-ink-muted text-white text-tiny px-1.5 rounded-full">
                    {pendingCount}
                </span>
            )}
        </button>
    )
}

export default SyncPill
