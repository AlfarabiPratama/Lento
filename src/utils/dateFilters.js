/**
 * Date filtering utilities for finance transactions
 */

/**
 * Get date range for filter type
 */
export function getDateRange(filterType) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filterType) {
        case 'today': {
            const start = today.toISOString()
            const end = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
            return { start, end }
        }
        
        case 'this-week': {
            const dayOfWeek = today.getDay()
            const monday = new Date(today)
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
            const sunday = new Date(monday)
            sunday.setDate(monday.getDate() + 7)
            return { start: monday.toISOString(), end: sunday.toISOString() }
        }
        
        case 'this-month': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            return { start: monthStart.toISOString(), end: monthEnd.toISOString() }
        }
        
        case 'last-month': {
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)
            return { start: lastMonthStart.toISOString(), end: lastMonthEnd.toISOString() }
        }
        
        default:
            return null
    }
}

/**
 * Filter transactions by date range
 */
export function filterTransactionsByDate(transactions, dateFilter) {
    if (!dateFilter || dateFilter.type === 'all') {
        return transactions
    }

    let range
    if (dateFilter.type === 'custom') {
        range = {
            start: new Date(dateFilter.start).toISOString(),
            end: new Date(new Date(dateFilter.end).getTime() + 24 * 60 * 60 * 1000).toISOString()
        }
    } else {
        range = getDateRange(dateFilter.type)
    }

    if (!range) return transactions

    return transactions.filter(tx => {
        const txDate = new Date(tx.date).toISOString()
        return txDate >= range.start && txDate < range.end
    })
}
