import { getDB, createBaseFields } from './db'

/**
 * Get all transaction templates
 * @returns {Promise<Object[]>}
 */
export async function getTransactionTemplates() {
    const db = await getDB()
    const templates = await db.getAll('transaction_templates')
    return templates.filter(t => !t.deleted_at).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get templates by type
 * @param {'income' | 'expense' | 'transfer'} type
 * @returns {Promise<Object[]>}
 */
export async function getTemplatesByType(type) {
    const templates = await getTransactionTemplates()
    return templates.filter(t => t.type === type)
}

/**
 * Create transaction template
 * @param {Object} data - Template data
 * @returns {Promise<Object>}
 */
export async function createTransactionTemplate(data) {
    const db = await getDB()
    const template = {
        ...createBaseFields(),
        name: data.name,
        type: data.type,
        amount: data.amount || 0,
        category_id: data.category_id || null,
        account_id: data.account_id || null,
        to_account_id: data.to_account_id || null,
        payment_method: data.payment_method || null,
        merchant: data.merchant || null,
        note: data.note || null,
        tags: data.tags || null,
    }
    const id = await db.add('transaction_templates', template)
    return { ...template, id }
}

/**
 * Update transaction template
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateTransactionTemplate(id, updates) {
    const db = await getDB()
    const existing = await db.get('transaction_templates', id)
    if (!existing) throw new Error('Template not found')

    const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
    }
    await db.put('transaction_templates', updated)
    return updated
}

/**
 * Delete transaction template
 * @param {string} id
 */
export async function deleteTransactionTemplate(id) {
    const db = await getDB()
    const template = await db.get('transaction_templates', id)
    if (!template) throw new Error('Template not found')

    await db.put('transaction_templates', {
        ...template,
        deleted_at: new Date().toISOString(),
    })
}
