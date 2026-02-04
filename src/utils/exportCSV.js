/**
 * Export transactions to CSV format
 * 
 * @param {Object[]} transactions - Array of transaction objects
 * @param {Object[]} accounts - Array of account objects for mapping
 * @param {string} filename - Output filename (without .csv)
 */
export function exportToCSV(transactions, accounts, filename = 'transactions') {
    if (transactions.length === 0) {
        throw new Error('No transactions to export')
    }

    // Create accounts map for quick lookup
    const accountsMap = {}
    accounts.forEach(acc => {
        accountsMap[acc.id] = acc.name
    })

    // CSV Headers
    const headers = [
        'Tanggal',
        'Tipe',
        'Jumlah',
        'Kategori',
        'Dompet',
        'Ke Dompet',
        'Metode Pembayaran',
        'Merchant',
        'Catatan',
        'Tags',
    ]

    // Convert transactions to CSV rows
    const rows = transactions.map(tx => {
        const date = new Date(tx.date).toLocaleDateString('id-ID')
        const type = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer'
        const amount = tx.amount.toLocaleString('id-ID')
        const category = tx.category_name || '-'
        const account = accountsMap[tx.account_id] || '-'
        const toAccount = tx.to_account_id ? accountsMap[tx.to_account_id] || '-' : '-'
        const paymentMethod = tx.payment_method || '-'
        const merchant = tx.merchant || '-'
        const note = tx.note || '-'
        const tags = tx.tags && tx.tags.length > 0 ? tx.tags.join(', ') : '-'

        return [
            date,
            type,
            amount,
            category,
            account,
            toAccount,
            paymentMethod,
            merchant,
            note,
            tags,
        ]
    })

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and trigger download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Generate filename with date range
 * 
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {string} - Formatted filename
 */
export function generateExportFilename(startDate, endDate) {
    const start = new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    const end = new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    
    const startFormatted = start.replace(/\s/g, '-')
    const endFormatted = end.replace(/\s/g, '-')
    
    return `lento-transaksi-${startFormatted}-${endFormatted}`
}
