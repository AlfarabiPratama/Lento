// @ts-check

/**
 * Lento Finance - Delta Engine
 * 
 * Rules:
 * - All amounts stored as INTEGER (IDR, no decimals)
 * - All writes use ONE IndexedDB transaction (transactions + accounts)
 * - Edit = rollback old + apply new
 */

/**
 * @typedef {'income' | 'expense' | 'transfer'} TxnType
 */

/**
 * @typedef {Object} Txn
 * @property {string} id
 * @property {TxnType} type
 * @property {number} amount - Must be positive integer (IDR)
 * @property {string} account_id - Source account
 * @property {string | null} [to_account_id] - Target for transfer
 */

/**
 * @typedef {Object} Account
 * @property {string} id
 * @property {string} name
 * @property {'cash' | 'bank' | 'ewallet'} type
 * @property {string} [provider]
 * @property {number} opening_balance
 * @property {number} balance_cached
 */

/**
 * @typedef {Record<string, number>} Delta
 * accountId -> deltaAmount
 */

/**
 * Validate transaction before processing
 * @param {Txn} txn 
 * @throws {Error} if invalid
 */
export function validateTxn(txn) {
    if (!Number.isFinite(txn.amount) || txn.amount <= 0) {
        throw new Error('Amount harus angka positif')
    }

    if (!Number.isInteger(txn.amount)) {
        throw new Error('Amount harus integer (tanpa desimal)')
    }

    if (!txn.account_id) {
        throw new Error('Account ID wajib diisi')
    }

    if (txn.type === 'transfer') {
        if (!txn.to_account_id) {
            throw new Error('Transfer harus punya to_account_id')
        }
        if (txn.to_account_id === txn.account_id) {
            throw new Error('Transfer tidak boleh ke dompet yang sama')
        }
    }
}

/**
 * Build delta (balance changes) from transaction
 * @param {Txn} txn 
 * @returns {Delta}
 */
export function buildDelta(txn) {
    validateTxn(txn)

    switch (txn.type) {
        case 'income':
            return { [txn.account_id]: +txn.amount }

        case 'expense':
            return { [txn.account_id]: -txn.amount }

        case 'transfer':
            return {
                [txn.account_id]: -txn.amount,
                [txn.to_account_id]: +txn.amount,
            }

        default:
            throw new Error(`Unknown txn type: ${txn.type}`)
    }
}

/**
 * Invert delta (for rollback)
 * @param {Delta} delta 
 * @returns {Delta}
 */
export function invertDelta(delta) {
    /** @type {Delta} */
    const inverted = {}
    for (const [accountId, amount] of Object.entries(delta)) {
        inverted[accountId] = -amount
    }
    return inverted
}

/**
 * Build deltas for edit operation (rollback old + apply new)
 * @param {Txn} oldTxn 
 * @param {Txn} newTxn 
 * @returns {{ rollback: Delta, apply: Delta }}
 */
export function buildEditDeltas(oldTxn, newTxn) {
    const oldDelta = buildDelta(oldTxn)
    const newDelta = buildDelta(newTxn)

    return {
        rollback: invertDelta(oldDelta),
        apply: newDelta,
    }
}

/**
 * Merge multiple deltas into one
 * @param  {...Delta} deltas 
 * @returns {Delta}
 */
export function mergeDeltas(...deltas) {
    /** @type {Delta} */
    const merged = {}

    for (const delta of deltas) {
        for (const [accountId, amount] of Object.entries(delta)) {
            merged[accountId] = (merged[accountId] || 0) + amount
        }
    }

    return merged
}

/**
 * Apply delta to balances (in-memory, for preview/calculation)
 * @param {Record<string, number>} balances - accountId -> balance
 * @param {Delta} delta 
 * @returns {Record<string, number>}
 */
export function applyDeltaToBalances(balances, delta) {
    const next = { ...balances }

    for (const [accountId, amount] of Object.entries(delta)) {
        next[accountId] = (next[accountId] ?? 0) + amount
    }

    return next
}

/**
 * Calculate net effect on net worth from delta
 * (Should always be 0 for transfer, +/- for income/expense)
 * @param {Delta} delta 
 * @returns {number}
 */
export function netWorthEffect(delta) {
    return Object.values(delta).reduce((sum, v) => sum + v, 0)
}
