import { getDueTemplates, markTemplateRun, getRecurringTemplateById } from '../../../lib/recurringRepo.js'
import { createTransaction } from '../../../lib/finance.js'
import { withLockIfAvailable, LOCK_NAMES } from '../../../lib/webLocks.js'

/**
 * Recurring Transaction Generator
 * 
 * Processes all due recurring templates and creates transactions.
 * Should be called on app start and periodically (e.g., daily).
 * 
 * Safety features:
 * - Max 100 transactions per run (prevent infinite loops)
 * - Idempotent: won't create duplicate transactions
 * - Updates nextRunAt after each creation
 */

const MAX_TRANSACTIONS_PER_RUN = 100

/**
 * Process all due recurring templates
 * @returns {Promise<{processed: number, created: number, errors: string[]}>}
 */
export async function processRecurringTransactions() {
    const result = {
        processed: 0,
        created: 0,
        errors: []
    }

    try {
        const dueTemplates = await getDueTemplates()

        if (dueTemplates.length === 0) {
            console.log('[Recurring] No due templates')
            return result
        }

        console.log(`[Recurring] Processing ${dueTemplates.length} due templates`)

        let totalCreated = 0

        for (const template of dueTemplates) {
            if (totalCreated >= MAX_TRANSACTIONS_PER_RUN) {
                console.warn('[Recurring] Max transactions per run reached')
                break
            }

            try {
                // Create transaction(s) for this template
                const created = await processTemplate(template)
                totalCreated += created
                result.processed++
                result.created += created
            } catch (error) {
                console.error(`[Recurring] Error processing template ${template.id}:`, error)
                result.errors.push(`${template.name}: ${error.message}`)
            }
        }

        console.log(`[Recurring] Completed: ${result.created} transactions created`)
        return result

    } catch (error) {
        console.error('[Recurring] Generator error:', error)
        result.errors.push(error.message)
        return result
    }
}

/**
 * Process a single template
 * Creates transactions for all missed occurrences
 * @returns {Promise<number>} Number of transactions created
 */
async function processTemplate(template) {
    const now = new Date()
    let nextRun = new Date(template.nextRunAt)
    let created = 0
    let safetyCounter = 0

    // Process all missed occurrences (e.g., if app was offline for days)
    while (nextRun <= now && safetyCounter < 100) {
        safetyCounter++

        // Create transaction for this occurrence
        const transaction = await createTransaction({
            type: template.type,
            amount: template.amount,
            account_id: template.accountId,
            category_id: template.categoryId,
            note: template.note ? `${template.note} (Recurring)` : '(Recurring)',
            date: nextRun.toISOString().split('T')[0], // YYYY-MM-DD
            recurring_template_id: template.id,
        })

        if (transaction) {
            created++
        }

        // Update template with new nextRunAt
        await markTemplateRun(template.id, nextRun.toISOString())

        // Get next occurrence
        const updatedTemplate = await getRecurringTemplateById(template.id)

        if (updatedTemplate) {
            nextRun = new Date(updatedTemplate.nextRunAt)
        } else {
            break
        }
    }

    return created
}

/**
 * Check if generator should run (called periodically)
 * Uses localStorage to track last run
 */
const LAST_RUN_KEY = 'lento_recurring_last_run'

export function shouldRunGenerator() {
    const lastRun = localStorage.getItem(LAST_RUN_KEY)
    if (!lastRun) return true

    const lastRunDate = new Date(lastRun)
    const now = new Date()

    // Run if last run was more than 1 hour ago
    const hoursSinceLastRun = (now - lastRunDate) / (1000 * 60 * 60)
    return hoursSinceLastRun >= 1
}

export function markGeneratorRun() {
    localStorage.setItem(LAST_RUN_KEY, new Date().toISOString())
}

/**
 * Initialize recurring generator (call once on app start)
 * Uses Web Locks to prevent double-execution across tabs
 */
export async function initRecurringGenerator() {
    if (!shouldRunGenerator()) {
        console.log('[Recurring] Skipping generator (recently run)')
        return { processed: 0, created: 0, errors: [] }
    }

    // Use lock to prevent multiple tabs from running simultaneously
    const result = await withLockIfAvailable(LOCK_NAMES.RECURRING_GENERATOR, async () => {
        // Double-check after acquiring lock (another tab may have run)
        if (!shouldRunGenerator()) {
            console.log('[Recurring] Skipping (another tab ran)')
            return { processed: 0, created: 0, errors: [] }
        }

        console.log('[Recurring] Running generator on app start')
        const result = await processRecurringTransactions()
        markGeneratorRun()
        return result
    })

    // If lock was not available (another tab has it), return empty result
    return result || { processed: 0, created: 0, errors: [] }
}

export default {
    processRecurringTransactions,
    initRecurringGenerator,
    shouldRunGenerator,
    markGeneratorRun,
}
