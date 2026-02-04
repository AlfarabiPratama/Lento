import { openDB } from 'idb'

const DB_NAME = 'lento-db'
const DB_VERSION = 10 // V10: Transaction Templates

/**
 * Database schema untuk Lento
 * V4: Added budget_months and budget_categories
 */
async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // ===== V1 Stores =====

            if (!db.objectStoreNames.contains('habits')) {
                const habitsStore = db.createObjectStore('habits', { keyPath: 'id' })
                habitsStore.createIndex('by_user', 'user_id')
                habitsStore.createIndex('by_sync', 'sync_status')
                habitsStore.createIndex('by_deleted', 'deleted_at')
            }

            if (!db.objectStoreNames.contains('checkins')) {
                const checkinsStore = db.createObjectStore('checkins', { keyPath: 'id' })
                checkinsStore.createIndex('by_habit', 'habit_id')
                checkinsStore.createIndex('by_date', 'date')
                checkinsStore.createIndex('by_sync', 'sync_status')
            }

            if (!db.objectStoreNames.contains('journals')) {
                const journalsStore = db.createObjectStore('journals', { keyPath: 'id' })
                journalsStore.createIndex('by_user', 'user_id')
                journalsStore.createIndex('by_date', 'created_at')
                journalsStore.createIndex('by_sync', 'sync_status')
            }

            if (!db.objectStoreNames.contains('pages')) {
                const pagesStore = db.createObjectStore('pages', { keyPath: 'id' })
                pagesStore.createIndex('by_user', 'user_id')
                pagesStore.createIndex('by_sync', 'sync_status')
                pagesStore.createIndex('by_updated', 'updated_at')
            }

            if (!db.objectStoreNames.contains('tags')) {
                const tagsStore = db.createObjectStore('tags', { keyPath: 'id' })
                tagsStore.createIndex('by_user', 'user_id')
                tagsStore.createIndex('by_name', 'name')
            }

            if (!db.objectStoreNames.contains('outbox')) {
                const outboxStore = db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true })
                outboxStore.createIndex('by_created', 'created_at')
                outboxStore.createIndex('by_store', 'store_name')
            }

            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' })
            }

            // ===== V2 Stores =====

            if (!db.objectStoreNames.contains('pomodoro_sessions')) {
                const pomodoroStore = db.createObjectStore('pomodoro_sessions', { keyPath: 'id' })
                pomodoroStore.createIndex('by_user', 'user_id')
                pomodoroStore.createIndex('by_date', 'date')
                pomodoroStore.createIndex('by_sync', 'sync_status')
            }

            // ===== V3 Stores: Upgraded Finance =====

            // Accounts (Dompet) - NEW
            if (!db.objectStoreNames.contains('accounts')) {
                const accountsStore = db.createObjectStore('accounts', { keyPath: 'id' })
                accountsStore.createIndex('by_user', 'user_id')
                accountsStore.createIndex('by_type', 'type')
                accountsStore.createIndex('by_sync', 'sync_status')
            }

            // Transactions (replaces finance_entries) - UPGRADED
            if (!db.objectStoreNames.contains('transactions')) {
                const txStore = db.createObjectStore('transactions', { keyPath: 'id' })
                txStore.createIndex('by_user', 'user_id')
                txStore.createIndex('by_account', 'account_id')
                txStore.createIndex('by_to_account', 'to_account_id')
                txStore.createIndex('by_date', 'date')
                txStore.createIndex('by_type', 'type')
                txStore.createIndex('by_category', 'category_id')
                txStore.createIndex('by_sync', 'sync_status')
            }

            // Finance Categories - keep existing or create
            if (!db.objectStoreNames.contains('finance_categories')) {
                const catStore = db.createObjectStore('finance_categories', { keyPath: 'id' })
                catStore.createIndex('by_user', 'user_id')
                catStore.createIndex('by_type', 'type')
            }

            // ===== V4 Stores: Budget =====

            // Budget Months
            if (!db.objectStoreNames.contains('budget_months')) {
                const budgetMonthStore = db.createObjectStore('budget_months', { keyPath: 'id' })
                budgetMonthStore.createIndex('by_month', 'month')
                budgetMonthStore.createIndex('by_user', 'user_id')
            }

            // Budget Categories (per-month allocations)
            if (!db.objectStoreNames.contains('budget_categories')) {
                const budgetCatStore = db.createObjectStore('budget_categories', { keyPath: 'id' })
                budgetCatStore.createIndex('by_budget_month', 'budget_month_id')
                budgetCatStore.createIndex('by_category', 'category_id')
            }

            // ===== V5 Stores: Goals =====

            // Goals (savings targets, habit targets)
            if (!db.objectStoreNames.contains('goals')) {
                const goalsStore = db.createObjectStore('goals', { keyPath: 'id' })
                goalsStore.createIndex('by_type', 'type')
                goalsStore.createIndex('by_status', 'status')
                goalsStore.createIndex('by_user', 'user_id')
            }

            // ===== V6 Stores: Book Tracking =====

            // Books (master library)
            if (!db.objectStoreNames.contains('books')) {
                const booksStore = db.createObjectStore('books', { keyPath: 'id' })
                booksStore.createIndex('by_status', 'status')
                booksStore.createIndex('by_updated', 'updatedAt')
                booksStore.createIndex('by_title', 'title')
                booksStore.createIndex('by_created', 'createdAt')
                booksStore.createIndex('by_user', 'user_id')
                booksStore.createIndex('by_sync', 'sync_status')
            }

            // Book Sessions (reading logs)
            if (!db.objectStoreNames.contains('book_sessions')) {
                const sessionsStore = db.createObjectStore('book_sessions', { keyPath: 'id' })
                sessionsStore.createIndex('by_book', 'bookId')
                sessionsStore.createIndex('by_day', 'dayKey')
                sessionsStore.createIndex('by_created', 'createdAt')
                sessionsStore.createIndex('by_user', 'user_id')
                sessionsStore.createIndex('by_sync', 'sync_status')
            }

            // Book Notes (highlights, quotes, notes)
            if (!db.objectStoreNames.contains('book_notes')) {
                const notesStore = db.createObjectStore('book_notes', { keyPath: 'id' })
                notesStore.createIndex('by_book', 'bookId')
                notesStore.createIndex('by_created', 'createdAt')
                notesStore.createIndex('by_user', 'user_id')
                notesStore.createIndex('by_sync', 'sync_status')
            }

            // ===== V7 Stores: Recurring Transactions =====

            // Recurring Templates
            if (!db.objectStoreNames.contains('recurring_templates')) {
                const recurringStore = db.createObjectStore('recurring_templates', { keyPath: 'id' })
                recurringStore.createIndex('by_active', 'isActive')
                recurringStore.createIndex('by_next_run', 'nextRunAt')
                recurringStore.createIndex('by_account', 'accountId')
                recurringStore.createIndex('by_user', 'user_id')
                recurringStore.createIndex('by_sync', 'sync_status')
            }

            // Delete old finance_entries if exists (migration)
            if (db.objectStoreNames.contains('finance_entries')) {
                // Note: Data migration should be handled separately
                // For now we keep it, but new code will use 'transactions'
            }

            // ===== V8 Stores: Space Notebooks =====

            // Notebooks (mental spaces for organizing notes)
            if (!db.objectStoreNames.contains('notebooks')) {
                const notebooksStore = db.createObjectStore('notebooks', { keyPath: 'id' })
                notebooksStore.createIndex('by_order', 'order')
                notebooksStore.createIndex('by_updated', 'updatedAt')
                notebooksStore.createIndex('by_user', 'user_id')
                notebooksStore.createIndex('by_sync', 'sync_status')
            }

            // Add notebookId index to pages if upgrading from older version
            if (oldVersion < 8 && db.objectStoreNames.contains('pages')) {
                const pagesStore = transaction.objectStore('pages')
                if (!pagesStore.indexNames.contains('by_notebook')) {
                    pagesStore.createIndex('by_notebook', 'notebookId')
                }
            }

            // ===== V9 Stores: Important Dates =====

            if (!db.objectStoreNames.contains('important_dates')) {
                const importantDatesStore = db.createObjectStore('important_dates', { keyPath: 'id' })
                importantDatesStore.createIndex('by_date', 'date')
                importantDatesStore.createIndex('by_type', 'type')
                importantDatesStore.createIndex('by_user', 'user_id')
                importantDatesStore.createIndex('by_sync', 'sync_status')
            }

            // ===== V10 Stores: Transaction Templates =====

            if (!db.objectStoreNames.contains('transaction_templates')) {
                const templatesStore = db.createObjectStore('transaction_templates', { keyPath: 'id' })
                templatesStore.createIndex('by_type', 'type')
                templatesStore.createIndex('by_name', 'name')
                templatesStore.createIndex('by_deleted', 'deleted_at')
                templatesStore.createIndex('by_user', 'user_id')
            }
        },
    })
}

// Singleton
let dbPromise = null

export function getDB() {
    if (!dbPromise) {
        dbPromise = initDB()
    }
    return dbPromise
}

export function generateId() {
    return crypto.randomUUID()
}

export function now() {
    return new Date().toISOString()
}

export function today() {
    return new Date().toISOString().split('T')[0]
}

export function createBaseFields(userId = null) {
    const timestamp = now()
    return {
        id: generateId(),
        user_id: userId,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
        sync_status: 'dirty',
        last_sync_error: null,
    }
}

export function markUpdated(entity) {
    return {
        ...entity,
        updated_at: now(),
        sync_status: 'dirty',
    }
}

export function markDeleted(entity) {
    return {
        ...entity,
        deleted_at: now(),
        updated_at: now(),
        sync_status: 'dirty',
    }
}

export default {
    getDB,
    generateId,
    now,
    today,
    createBaseFields,
    markUpdated,
    markDeleted,
}
