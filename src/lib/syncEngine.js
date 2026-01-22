import supabase, { isSupabaseConfigured } from './supabase'
import { getDB } from './db'

/**
 * Sync Engine - Push/Pull data between IndexedDB and Supabase
 * 
 * Strategy: Last-write-wins based on updated_at
 */

/**
 * Get current user ID
 */
async function getCurrentUserId() {
    if (!supabase) return null
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
}

/**
 * Push all local accounts to Supabase
 */
export async function pushAccounts() {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }

    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Not authenticated' }

    try {
        const db = await getDB()
        const localAccounts = await db.getAll('accounts')

        for (const account of localAccounts) {
            const { error } = await supabase
                .from('accounts')
                .upsert({
                    id: account.id,
                    user_id: userId,
                    name: account.name,
                    type: account.type,
                    provider: account.provider,
                    balance_cached: account.balance_cached,
                    created_at: account.created_at,
                    updated_at: account.updated_at,
                }, { onConflict: 'id' })

            if (error) {
                console.error('Push account error:', error)
                return { success: false, error: error.message }
            }
        }

        return { success: true, count: localAccounts.length }
    } catch (err) {
        console.error('Push accounts failed:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Push all local transactions to Supabase
 */
export async function pushTransactions() {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }

    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Not authenticated' }

    try {
        const db = await getDB()
        const localTxns = await db.getAll('transactions')

        for (const txn of localTxns) {
            const { error } = await supabase
                .from('transactions')
                .upsert({
                    id: txn.id,
                    user_id: userId,
                    account_id: txn.account_id,
                    to_account_id: txn.to_account_id,
                    type: txn.type,
                    amount: txn.amount,
                    category_id: txn.category_id,
                    category_name: txn.category_name,
                    date: txn.date,
                    note: txn.note,
                    created_at: txn.created_at,
                    updated_at: txn.updated_at,
                }, { onConflict: 'id' })

            if (error) {
                console.error('Push transaction error:', error)
                return { success: false, error: error.message }
            }
        }

        return { success: true, count: localTxns.length }
    } catch (err) {
        console.error('Push transactions failed:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Pull accounts from Supabase to IndexedDB
 */
export async function pullAccounts() {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }

    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Not authenticated' }

    try {
        const { data: remoteAccounts, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)

        if (error) {
            return { success: false, error: error.message }
        }

        const db = await getDB()

        for (const account of remoteAccounts) {
            const localAccount = await db.get('accounts', account.id)

            // Only update if remote is newer or local doesn't exist
            if (!localAccount || new Date(account.updated_at) > new Date(localAccount.updated_at)) {
                await db.put('accounts', {
                    id: account.id,
                    user_id: account.user_id,
                    name: account.name,
                    type: account.type,
                    provider: account.provider,
                    balance_cached: account.balance_cached,
                    created_at: account.created_at,
                    updated_at: account.updated_at,
                    sync_status: 'synced',
                })
            }
        }

        return { success: true, count: remoteAccounts.length }
    } catch (err) {
        console.error('Pull accounts failed:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Pull transactions from Supabase to IndexedDB
 */
export async function pullTransactions() {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }

    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Not authenticated' }

    try {
        const { data: remoteTxns, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)

        if (error) {
            return { success: false, error: error.message }
        }

        const db = await getDB()

        for (const txn of remoteTxns) {
            const localTxn = await db.get('transactions', txn.id)

            // Only update if remote is newer or local doesn't exist
            if (!localTxn || new Date(txn.updated_at) > new Date(localTxn.updated_at)) {
                await db.put('transactions', {
                    id: txn.id,
                    user_id: txn.user_id,
                    account_id: txn.account_id,
                    to_account_id: txn.to_account_id,
                    type: txn.type,
                    amount: txn.amount,
                    category_id: txn.category_id,
                    category_name: txn.category_name,
                    date: txn.date,
                    note: txn.note,
                    created_at: txn.created_at,
                    updated_at: txn.updated_at,
                    sync_status: 'synced',
                })
            }
        }

        return { success: true, count: remoteTxns.length }
    } catch (err) {
        console.error('Pull transactions failed:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Full sync - push then pull
 */
export async function fullSync() {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }

    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Not authenticated' }

    console.log('Starting full sync...')

    // Push local changes first
    const pushAccountsResult = await pushAccounts()
    const pushTxnsResult = await pushTransactions()

    // Then pull remote changes
    const pullAccountsResult = await pullAccounts()
    const pullTxnsResult = await pullTransactions()

    const success = pushAccountsResult.success && pushTxnsResult.success &&
        pullAccountsResult.success && pullTxnsResult.success

    console.log('Sync complete:', {
        pushAccountsResult,
        pushTxnsResult,
        pullAccountsResult,
        pullTxnsResult
    })

    return {
        success,
        pushed: {
            accounts: pushAccountsResult.count || 0,
            transactions: pushTxnsResult.count || 0,
        },
        pulled: {
            accounts: pullAccountsResult.count || 0,
            transactions: pullTxnsResult.count || 0,
        },
    }
}

export default {
    pushAccounts,
    pushTransactions,
    pullAccounts,
    pullTransactions,
    fullSync,
}
