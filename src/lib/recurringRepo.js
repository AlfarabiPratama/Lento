import { getDB, generateId, now } from './db'

/**
 * Recurring Templates Repository
 * 
 * Manages recurring transaction templates that auto-generate
 * transactions based on interval (daily, weekly, monthly)
 */

export const RECURRING_INTERVALS = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
}

/**
 * Calculate next run date based on interval
 */
function calculateNextRunDate(currentDate, interval) {
    const date = new Date(currentDate)

    switch (interval) {
        case RECURRING_INTERVALS.DAILY:
            date.setDate(date.getDate() + 1)
            break
        case RECURRING_INTERVALS.WEEKLY:
            date.setDate(date.getDate() + 7)
            break
        case RECURRING_INTERVALS.MONTHLY:
            date.setMonth(date.getMonth() + 1)
            break
        default:
            date.setMonth(date.getMonth() + 1) // Default to monthly
    }

    return date.toISOString()
}

/**
 * Get all recurring templates
 */
export async function getAllRecurringTemplates() {
    const db = await getDB()
    const templates = await db.getAll('recurring_templates')
    return templates.filter(t => !t.deleted)
}

/**
 * Get active recurring templates
 */
export async function getActiveRecurringTemplates() {
    const db = await getDB()
    const templates = await db.getAllFromIndex('recurring_templates', 'by_active', true)
    return templates.filter(t => !t.deleted)
}

/**
 * Get recurring template by ID
 */
export async function getRecurringTemplateById(id) {
    const db = await getDB()
    return await db.get('recurring_templates', id)
}

/**
 * Create new recurring template
 */
export async function createRecurringTemplate(templateData) {
    const db = await getDB()

    const template = {
        id: generateId(),
        name: templateData.name,
        type: templateData.type || 'expense', // 'income' | 'expense'
        amount: templateData.amount,
        accountId: templateData.accountId,
        categoryId: templateData.categoryId || null,
        note: templateData.note || '',
        interval: templateData.interval || RECURRING_INTERVALS.MONTHLY,
        startDate: templateData.startDate || now(),
        nextRunAt: templateData.startDate || now(),
        lastRunAt: null,
        isActive: true,
        runCount: 0,
        deleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
        user_id: 'local',
        sync_status: 'pending'
    }

    await db.put('recurring_templates', template)
    return template
}

/**
 * Update recurring template
 */
export async function updateRecurringTemplate(id, updates) {
    const db = await getDB()
    const template = await db.get('recurring_templates', id)

    if (!template) {
        throw new Error('Template not found')
    }

    const updated = {
        ...template,
        ...updates,
        updatedAt: now(),
        sync_status: 'pending'
    }

    await db.put('recurring_templates', updated)
    return updated
}

/**
 * Delete recurring template (soft delete)
 */
export async function deleteRecurringTemplate(id) {
    const db = await getDB()
    const template = await db.get('recurring_templates', id)

    if (!template) {
        throw new Error('Template not found')
    }

    const updated = {
        ...template,
        deleted: true,
        deletedAt: now(),
        isActive: false,
        updatedAt: now(),
        sync_status: 'pending'
    }

    await db.put('recurring_templates', updated)
    return updated
}

/**
 * Toggle template active status
 */
export async function toggleRecurringTemplate(id) {
    const db = await getDB()
    const template = await db.get('recurring_templates', id)

    if (!template) {
        throw new Error('Template not found')
    }

    return await updateRecurringTemplate(id, {
        isActive: !template.isActive
    })
}

/**
 * Mark template as run and calculate next run
 */
export async function markTemplateRun(id, runDate) {
    const db = await getDB()
    const template = await db.get('recurring_templates', id)

    if (!template) {
        throw new Error('Template not found')
    }

    const nextRunAt = calculateNextRunDate(runDate, template.interval)

    return await updateRecurringTemplate(id, {
        lastRunAt: runDate,
        nextRunAt: nextRunAt,
        runCount: (template.runCount || 0) + 1
    })
}

/**
 * Get templates due for execution
 * Returns templates where nextRunAt <= now
 */
export async function getDueTemplates() {
    const templates = await getActiveRecurringTemplates()
    const nowDate = new Date()

    return templates.filter(t => {
        const nextRun = new Date(t.nextRunAt)
        return nextRun <= nowDate
    })
}

export default {
    getAllRecurringTemplates,
    getActiveRecurringTemplates,
    getRecurringTemplateById,
    createRecurringTemplate,
    updateRecurringTemplate,
    deleteRecurringTemplate,
    toggleRecurringTemplate,
    markTemplateRun,
    getDueTemplates,
    RECURRING_INTERVALS,
}
