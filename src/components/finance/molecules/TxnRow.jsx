import TxnTypeIcon from '../atoms/TxnTypeIcon'
import Money from '../atoms/Money'
import AccountBadge from '../atoms/AccountBadge'
import { IconX } from '@tabler/icons-react'

/**
 * TxnRow - Single transaction row in list
 * 
 * Shows: type icon, title, meta, amount
 * Supports: click, hover delete
 */

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {'income' | 'expense' | 'transfer'} props.type
 * @param {string} props.title - Category or merchant name
 * @param {string} [props.note]
 * @param {number} props.amount
 * @param {string} props.date - ISO date string
 * @param {string} props.accountName
 * @param {'cash' | 'bank' | 'ewallet'} [props.accountType]
 * @param {string} [props.toAccountName] - For transfer
 * @param {'synced' | 'pending' | 'failed'} [props.syncStatus]
 * @param {(id: string) => void} [props.onClick]
 * @param {(id: string) => void} [props.onDelete]
 * @param {string} [props.className]
 */
function TxnRow({
    id,
    type,
    title,
    note,
    amount,
    date,
    accountName,
    accountType = 'cash',
    toAccountName,
    syncStatus = 'synced',
    onClick,
    onDelete,
    className = '',
}) {
    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }

    const isTransfer = type === 'transfer'
    const displayTitle = isTransfer
        ? `${accountName} → ${toAccountName}`
        : title || 'Transaksi'

    const handleClick = onClick ? () => onClick(id) : undefined
    const handleDelete = onDelete ? (e) => {
        e.stopPropagation()
        onDelete(id)
    } : undefined

    return (
        <div
            className={`
        flex items-center gap-3 p-3 rounded-xl
        bg-surface border border-line
        transition-all group
        ${onClick ? 'cursor-pointer hover:border-primary/30' : ''}
        ${className}
      `}
            onClick={handleClick}
            role={onClick ? 'button' : undefined}
        >
            {/* Icon */}
            <TxnTypeIcon type={type} size="md" withBackground />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-small text-ink font-medium truncate">
                        {displayTitle}
                    </span>
                    {/* Pending indicator */}
                    {syncStatus === 'pending' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" title="Menunggu sync" />
                    )}
                    {syncStatus === 'failed' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Gagal sync" />
                    )}
                </div>
                <div className="flex items-center gap-2 text-caption text-ink-muted">
                    <span>{formatDate(date)}</span>
                    <span>•</span>
                    <AccountBadge type={accountType} provider={accountName} size="sm" showLabel={false} />
                    <span className="truncate">{accountName}</span>
                    {note && (
                        <>
                            <span>•</span>
                            <span className="truncate">{note}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Amount */}
            <Money
                amount={amount}
                type={type}
                size="md"
                showSign={type !== 'transfer'}
            />

            {/* Delete button (hover) */}
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="
            opacity-0 group-hover:opacity-100
            w-8 h-8 flex items-center justify-center rounded-lg
            text-ink-muted hover:text-red-500 hover:bg-red-50
            transition-all
          "
                    aria-label="Hapus"
                >
                    <IconX size={16} stroke={1.5} />
                </button>
            )}
        </div>
    )
}

export default TxnRow
