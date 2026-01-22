import { ACCOUNT_TYPES, formatCurrency } from '../hooks/useFinance'

/**
 * AccountCard - Display single account (dompet) with balance
 */
function AccountCard({ account, onClick, selected = false }) {
    const typeInfo = ACCOUNT_TYPES[account.type] || { label: account.type, icon: '💳' }

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl transition-all border-2 ${selected
                    ? 'bg-primary-50 border-primary'
                    : 'bg-surface border-line hover:border-primary/50'
                }`}
        >
            <div className="flex items-center gap-3">
                <span className="text-2xl">{typeInfo.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className={`text-h3 font-medium truncate ${selected ? 'text-primary' : 'text-ink'}`}>
                        {account.name}
                    </p>
                    <p className="text-caption text-ink-muted">
                        {typeInfo.label}
                        {account.provider && ` • ${account.provider}`}
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-h3 font-semibold ${account.balance_cached >= 0 ? 'text-ink' : 'text-red-500'
                        }`}>
                        {formatCurrency(account.balance_cached)}
                    </p>
                </div>
            </div>
        </button>
    )
}

export default AccountCard
