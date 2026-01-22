import { FinanceIndicator } from '../../ui/StatusIndicator'

/**
 * Money - Format and display currency (IDR)
 * 
 * Atom component for consistent money display
 * Now with color-blind accessible patterns via FinanceIndicator
 */

/**
 * @param {Object} props
 * @param {number} props.amount - Amount in IDR (integer)
 * @param {boolean} [props.showSign] - Show +/- prefix
 * @param {'income' | 'expense' | 'transfer' | 'neutral' | 'positive' | 'negative'} [props.type] - Color based on type
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size] - Text size
 * @param {boolean} [props.usePattern] - Use FinanceIndicator with patterns for accessibility
 * @param {string} [props.className]
 */
export function Money({
    amount,
    showSign = false,
    type = 'neutral',
    size = 'md',
    usePattern = false,
    className = ''
}) {
    // Use FinanceIndicator for accessible display with patterns
    if (usePattern && (type === 'income' || type === 'expense' || type === 'positive' || type === 'negative')) {
        const value = type === 'expense' || type === 'negative' ? -Math.abs(amount) : Math.abs(amount)
        return (
            <FinanceIndicator 
                value={value} 
                showValue={true}
                size={size === 'lg' || size === 'xl' ? 'md' : 'sm'}
            />
        )
    }
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount))

    const sign = showSign
        ? (amount >= 0 ? '+' : '-')
        : (amount < 0 ? '-' : '')

    const colorClass = {
        income: 'text-green-500',
        positive: 'text-green-500',
        expense: 'text-red-500',
        negative: 'text-red-500',
        transfer: 'text-primary',
        neutral: amount >= 0 ? 'text-ink' : 'text-red-500',
    }[type]

    const sizeClass = {
        sm: 'text-small',
        md: 'text-body',
        lg: 'text-h3 font-semibold',
        xl: 'text-h2 font-bold',
    }[size]

    return (
        <span className={`${colorClass} ${sizeClass} tabular-nums ${className}`}>
            {sign}{formatted}
        </span>
    )
}

/**
 * Format currency (utility function)
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format currency compact (e.g., Rp50rb, Rp1.2jt)
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrencyCompact(amount) {
    const abs = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''

    if (abs >= 1000000000) {
        return `${sign}Rp${(abs / 1000000000).toFixed(1)}M`
    }
    if (abs >= 1000000) {
        return `${sign}Rp${(abs / 1000000).toFixed(1)}jt`
    }
    if (abs >= 1000) {
        return `${sign}Rp${(abs / 1000).toFixed(0)}rb`
    }
    return `${sign}Rp${abs}`
}

export default Money
