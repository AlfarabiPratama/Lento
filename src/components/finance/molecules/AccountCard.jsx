import { ACCOUNT_TYPES } from '../../../features/finance/constants'
import Money from '../atoms/Money'

/**
 * AccountCard - Full account card for desktop list
 * 
 * Shows: type icon, name, provider, balance
 */

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {'cash' | 'bank' | 'ewallet'} props.type
 * @param {string} [props.provider]
 * @param {number} props.balance
 * @param {boolean} [props.isActive]
 * @param {(id: string) => void} [props.onClick]
 * @param {(id: string) => void} [props.onEdit]
 * @param {string} [props.className]
 */
function AccountCard({
    id,
    name,
    type,
    provider,
    balance,
    isActive = false,
    onClick,
    onEdit,
    className = '',
}) {
    const config = ACCOUNT_TYPES[type] || ACCOUNT_TYPES.cash
    const IconComponent = config.IconComponent

    let pressTimer = null

    const handleClick = onClick ? () => onClick(id) : undefined
    
    const handleDoubleClick = (e) => {
        e.stopPropagation()
        if (onEdit) {
            onEdit({ id, name, type, provider, balance_cached: balance, opening_balance: balance })
        }
    }

    // Long-press for mobile
    const handleTouchStart = (e) => {
        if (!onEdit) return
        pressTimer = setTimeout(() => {
            e.preventDefault()
            onEdit({ id, name, type, provider, balance_cached: balance, opening_balance: balance })
        }, 500) // 500ms long-press
    }

    const handleTouchEnd = () => {
        if (pressTimer) {
            clearTimeout(pressTimer)
            pressTimer = null
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={`
        w-full text-left p-4 rounded-xl transition-all
        border-2 group
        ${isActive
                    ? 'bg-primary-50 border-primary'
                    : 'bg-surface border-line hover:border-primary/50'
                }
        ${className}
      `}
            title={onEdit ? "Double-click atau long-press untuk edit" : undefined}
        >
            <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center shrink-0
          ${isActive ? 'bg-primary/20' : 'bg-paper-warm'}
        `}>
                    <IconComponent
                        size={20}
                        stroke={1.5}
                        className={isActive ? 'text-primary' : 'text-ink-muted'}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className={`text-h3 font-medium truncate ${isActive ? 'text-primary' : 'text-ink'}`}>
                        {name}
                    </p>
                    <p className="text-caption text-ink-muted">
                        {config.label}
                        {provider && ` • ${provider}`}
                    </p>
                </div>

                {/* Balance */}
                <div className="text-right">
                    <Money
                        amount={balance}
                        size="lg"
                        className={isActive ? 'text-primary' : ''}
                    />
                </div>
            </div>
        </button>
    )
}

export default AccountCard
