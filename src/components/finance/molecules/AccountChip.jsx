import { ACCOUNT_TYPES } from '../../../features/finance/constants'
import Money from '../atoms/Money'

/**
 * AccountChip - Horizontal scrollable chip for mobile
 * 
 * Shows: icon, name, balance (compact)
 */

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {'cash' | 'bank' | 'ewallet'} props.type
 * @param {number} props.balance
 * @param {boolean} [props.isActive]
 * @param {(id: string) => void} [props.onClick]
 * @param {(data: Object) => void} [props.onEdit]
 * @param {string} [props.provider]
 * @param {string} [props.className]
 */
function AccountChip({
    id,
    name,
    type,
    balance,
    isActive = false,
    onClick,
    onEdit,
    provider,
    className = '',
}) {
    const config = ACCOUNT_TYPES[type] || ACCOUNT_TYPES.cash

    let pressTimer = null

    const handleClick = onClick ? () => onClick(id) : undefined

    // Long-press for mobile editing
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
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={`
        flex flex-col items-center gap-1 
        px-3 py-2 rounded-xl min-w-[80px]
        border-2 transition-all shrink-0
        ${isActive
                    ? 'bg-primary-50 border-primary text-primary'
                    : 'bg-surface border-line text-ink hover:border-primary/30'
                }
        ${className}
      `}
            title={onEdit ? "Long-press untuk edit" : undefined}
        >
            <span className="text-lg">{config.icon}</span>
            <span className={`text-tiny font-medium truncate max-w-[70px] ${isActive ? 'text-primary' : 'text-ink'}`}>
                {name}
            </span>
            <span className={`text-caption tabular-nums ${isActive ? 'text-primary' : 'text-ink-muted'}`}>
                {new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    compactDisplay: 'short',
                    maximumFractionDigits: 1,
                }).format(balance)}
            </span>
        </button>
    )
}

/**
 * AddAccountChip - Chip for adding new account
 */
export function AddAccountChip({ onClick, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        flex flex-col items-center justify-center gap-1
        px-3 py-2 rounded-xl min-w-[60px] h-full
        border-2 border-dashed border-line
        text-ink-muted hover:border-primary hover:text-primary
        transition-all shrink-0
        ${className}
      `}
        >
            <span className="text-lg">+</span>
            <span className="text-tiny">Tambah</span>
        </button>
    )
}

export default AccountChip
