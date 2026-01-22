import { ACCOUNT_TYPES } from '../../../features/finance/constants'

/**
 * AccountBadge - Small badge showing account type
 * 
 * Shows icon + label for Cash/Bank/E-Wallet
 */

/**
 * @param {Object} props
 * @param {'cash' | 'bank' | 'ewallet'} props.type
 * @param {string} [props.provider] - E.g., "GoPay", "BCA"
 * @param {'sm' | 'md'} [props.size]
 * @param {boolean} [props.showLabel]
 * @param {string} [props.className]
 */
function AccountBadge({
    type,
    provider,
    size = 'sm',
    showLabel = true,
    className = ''
}) {
    const config = ACCOUNT_TYPES[type] || ACCOUNT_TYPES.cash
    const IconComponent = config.IconComponent

    const sizeClasses = {
        sm: 'text-tiny gap-1',
        md: 'text-small gap-1.5',
    }

    const iconSizes = {
        sm: 12,
        md: 14,
    }

    return (
        <span className={`
      inline-flex items-center px-1.5 py-0.5 rounded
      bg-paper-warm text-ink-muted
      ${sizeClasses[size]}
      ${className}
    `}>
            <IconComponent size={iconSizes[size]} stroke={2} />
            {showLabel && (
                <span>{provider || config.label}</span>
            )}
        </span>
    )
}

export default AccountBadge
