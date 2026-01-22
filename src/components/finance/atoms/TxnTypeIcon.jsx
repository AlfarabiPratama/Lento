import { TXN_TYPES } from '../../../features/finance/constants'

/**
 * TxnTypeIcon - Icon for transaction type
 * 
 * Income = green up arrow
 * Expense = red down arrow
 * Transfer = exchange arrows
 */

/**
 * @param {Object} props
 * @param {'income' | 'expense' | 'transfer'} props.type
 * @param {'sm' | 'md' | 'lg'} [props.size]
 * @param {boolean} [props.withBackground] - Show colored background circle
 * @param {string} [props.className]
 */
function TxnTypeIcon({
    type,
    size = 'md',
    withBackground = false,
    className = ''
}) {
    const config = TXN_TYPES[type] || TXN_TYPES.expense
    const IconComponent = config.IconComponent

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 24,
    }

    const bgSizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
    }

    if (withBackground) {
        return (
            <div className={`
        ${bgSizes[size]} rounded-lg flex items-center justify-center
        ${config.bgClass}
        ${className}
      `}>
                <IconComponent
                    size={iconSizes[size]}
                    stroke={2}
                    className={config.colorClass}
                />
            </div>
        )
    }

    return (
        <IconComponent
            size={iconSizes[size]}
            stroke={2}
            className={`${config.colorClass} ${className}`}
        />
    )
}

export default TxnTypeIcon
