import { getDB, generateId, now } from './db'

/**
 * Outbox Queue untuk offline sync
 * Setiap operasi yang perlu sync ke server ditambahkan ke outbox
 */

/**
 * Add operation to outbox queue
 * @param {string} storeName - Target store (habits, journals, pages, etc)
 * @param {string} operation - 'create' | 'update' | 'delete'
 * @param {object} data - Entity data
 */
export async function addToOutbox(storeName, operation, data) {
    const db = await getDB()

    await db.add('outbox', {
        store_name: storeName,
        operation,
        entity_id: data.id,
        data,
        created_at: now(),
        retry_count: 0,
        last_error: null,
    })
}

/**
 * Get all pending operations from outbox
 */
export async function getPendingOperations() {
    const db = await getDB()
    return db.getAllFromIndex('outbox', 'by_created')
}

/**
 * Remove operation from outbox after successful sync
 */
export async function removeFromOutbox(id) {
    const db = await getDB()
    await db.delete('outbox', id)
}

/**
 * Mark operation as failed with error
 */
export async function markOutboxError(id, error) {
    const db = await getDB()
    const op = await db.get('outbox', id)

    if (op) {
        await db.put('outbox', {
            ...op,
            retry_count: op.retry_count + 1,
            last_error: error.message || String(error),
        })
    }
}

/**
 * Get outbox count (for UI indicator)
 */
export async function getOutboxCount() {
    const db = await getDB()
    return db.count('outbox')
}

/**
 * Clear all outbox (use with caution)
 */
export async function clearOutbox() {
    const db = await getDB()
    await db.clear('outbox')
}

/**
 * Process outbox queue - called when online
 * This is a placeholder - actual sync logic will be in Phase 2 with Supabase
 */
export async function processOutbox(syncFn) {
    const operations = await getPendingOperations()

    for (const op of operations) {
        try {
            // Call the sync function provided (will be Supabase upsert/delete in Phase 2)
            await syncFn(op)

            // Mark entity as synced
            const db = await getDB()
            const entity = await db.get(op.store_name, op.entity_id)
            if (entity && entity.sync_status === 'dirty') {
                await db.put(op.store_name, {
                    ...entity,
                    sync_status: 'clean',
                })
            }

            // Remove from outbox
            await removeFromOutbox(op.id)
        } catch (error) {
            await markOutboxError(op.id, error)
        }
    }
}

export default {
    addToOutbox,
    getPendingOperations,
    removeFromOutbox,
    markOutboxError,
    getOutboxCount,
    clearOutbox,
    processOutbox,
}
