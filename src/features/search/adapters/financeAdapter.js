/**
 * Finance Adapter - Convert transactions to SearchDocument format
 * @ts-check
 */

import { getDB } from '../../../lib/db'

/**
 * Convert a transaction to SearchDocument format
 * @param {Object} txn - Transaction from IndexedDB
 * @param {Object} [account] - Account object
 * @returns {import('../types').SearchDocument}
 */
export function transactionToSearchDoc(txn, account) {
    const typeLabel = txn.type === 'income' ? 'Pemasukan'
        : txn.type === 'expense' ? 'Pengeluaran'
            : 'Transfer'

    const title = txn.note || `${typeLabel} - ${txn.category_name || 'Tanpa kategori'}`

    const bodyParts = [
        txn.note,
        txn.category_name,
        account?.name,
        typeLabel,
        `Rp ${txn.amount?.toLocaleString('id-ID')}`,
    ].filter(Boolean)

    return {
        id: txn.id,
        module: 'finance',
        title,
        body: bodyParts.join(' '),
        tags: [txn.category_name].filter(Boolean),
        created_at: txn.created_at,
        updated_at: txn.updated_at,
        meta: {
            amount: txn.amount,
            type: txn.type,
            category: txn.category_name,
            category_id: txn.category_id,
            account_id: txn.account_id,
            account_name: account?.name,
        },
    }
}

/**
 * Get all transactions as SearchDocuments
 * @returns {Promise<import('../types').SearchDocument[]>}
 */
export async function getAllFinanceDocs() {
    try {
        const db = await getDB()
        const transactions = await db.getAll('transactions')
        const accounts = await db.getAll('accounts')

        const accountMap = new Map(accounts.map(a => [a.id, a]))

        return transactions.map(txn =>
            transactionToSearchDoc(txn, accountMap.get(txn.account_id))
        )
    } catch (err) {
        console.error('Failed to get finance docs:', err)
        return []
    }
}
