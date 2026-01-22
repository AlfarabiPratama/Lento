import { getDB } from './db'

/**
 * Lento Data Export/Import Service
 * 
 * Schema version untuk migrasi di masa depan
 * Export semua data ke JSON, import dengan merge/replace
 */

// Current schema version - increment saat struktur data berubah
// V4: Added books, book_sessions, book_notes, goals, budget_months, budget_categories, recurring_templates
export const SCHEMA_VERSION = 4

// All store names in the database
const ALL_STORES = [
    'habits',
    'checkins',
    'journals',
    'pages',
    'tags',
    'settings',
    'pomodoro_sessions',
    'accounts',
    'transactions',
    'finance_categories',
    'budget_months',
    'budget_categories',
    'goals',
    'books',
    'book_sessions',
    'book_notes',
    'recurring_templates',
]

/**
 * Export semua data Lento ke JSON
 * @returns {Promise<object>} Complete data export
 */
export async function exportAllData() {
    const db = await getDB()

    // Get all data from all stores
    const dataPromises = ALL_STORES.map(async (store) => {
        try {
            const data = await db.getAll(store)
            return [store, data]
        } catch (e) {
            console.warn(`Could not export ${store}:`, e)
            return [store, []]
        }
    })

    const results = await Promise.all(dataPromises)
    const data = {}
    const stats = {}

    for (const [store, items] of results) {
        data[store] = items
        stats[`${store}_count`] = items.length
    }

    const exportData = {
        // Metadata
        schema_version: SCHEMA_VERSION,
        exported_at: new Date().toISOString(),
        app_name: 'Lento',
        app_version: '0.1.0',

        // Data
        data,

        // Stats untuk verifikasi
        stats
    }

    return exportData
}

/**
 * Download data sebagai file JSON
 * Uses File System Access API when available for better UX
 */
export async function downloadExport() {
    const data = await exportAllData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })

    const filename = `lento-backup-${new Date().toISOString().split('T')[0]}.json`

    // Try File System Access API first (modern browsers, feels like native app)
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'Lento Backup File',
                    accept: { 'application/json': ['.json'] }
                }]
            })
            const writable = await handle.createWritable()
            await writable.write(blob)
            await writable.close()
            return { success: true, filename: handle.name, method: 'file_system_api' }
        } catch (err) {
            // User cancelled or API failed, fall through to legacy method
            if (err.name === 'AbortError') {
                return { success: false, cancelled: true }
            }
        }
    }

    // Fallback: Legacy download method
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, filename, method: 'download' }
}

/**
 * Export specific store as CSV
 * @param {string} storeName - Store to export
 * @returns {Promise<{success: boolean, filename: string}>}
 */
export async function exportStoreAsCSV(storeName) {
    const db = await getDB()

    try {
        const items = await db.getAll(storeName)

        if (items.length === 0) {
            return { success: false, error: 'No data to export' }
        }

        // Get headers from first item
        const headers = Object.keys(items[0])

        // Build CSV content
        const rows = [headers.join(',')]

        for (const item of items) {
            const row = headers.map(header => {
                const value = item[header]
                if (value === null || value === undefined) return ''
                if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`
                }
                return value
            })
            rows.push(row.join(','))
        }

        const csv = rows.join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        const filename = `lento-${storeName}-${new Date().toISOString().split('T')[0]}.csv`

        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return { success: true, filename, count: items.length }
    } catch (e) {
        console.error(`CSV export error for ${storeName}:`, e)
        return { success: false, error: e.message }
    }
}

/**
 * Get available stores for CSV export
 */
export function getExportableStores() {
    return [
        { id: 'transactions', label: 'Transaksi Keuangan', icon: '💰' },
        { id: 'books', label: 'Library Buku', icon: '📚' },
        { id: 'book_sessions', label: 'Sesi Baca', icon: '📖' },
        { id: 'journals', label: 'Jurnal', icon: '📓' },
        { id: 'habits', label: 'Kebiasaan', icon: '✅' },
        { id: 'checkins', label: 'Check-in Habit', icon: '📅' },
        { id: 'pomodoro_sessions', label: 'Sesi Fokus', icon: '🍅' },
        { id: 'pages', label: 'Catatan Space', icon: '📝' },
    ]
}

/**
 * Validasi struktur file import
 */
export function validateImportData(data) {
    const errors = []

    // Check required fields
    if (!data.schema_version) {
        errors.push('Missing schema_version')
    }

    if (!data.data) {
        errors.push('Missing data object')
    }

    // Basic stores that must exist
    if (data.data) {
        const requiredStores = ['habits', 'journals', 'pages']
        for (const store of requiredStores) {
            if (data.data[store] !== undefined && !Array.isArray(data.data[store])) {
                errors.push(`Invalid ${store} - must be array`)
            }
        }
    }

    // Check schema version compatibility
    if (data.schema_version > SCHEMA_VERSION) {
        errors.push(`Schema version ${data.schema_version} is newer than supported version ${SCHEMA_VERSION}. Please update Lento.`)
    }

    return {
        valid: errors.length === 0,
        errors,
        error: errors.join(', ')
    }
}

/**
 * Migrate data dari versi lama ke versi baru (jika diperlukan)
 */
export function migrateData(data) {
    let migrated = { ...data }

    // v3 to v4: Initialize new stores if missing
    if (data.schema_version <= 3) {
        migrated.data = {
            ...migrated.data,
            books: migrated.data.books || [],
            book_sessions: migrated.data.book_sessions || [],
            book_notes: migrated.data.book_notes || [],
            goals: migrated.data.goals || [],
            budget_months: migrated.data.budget_months || [],
            budget_categories: migrated.data.budget_categories || [],
            recurring_templates: migrated.data.recurring_templates || [],
        }
        migrated.schema_version = 4
    }

    return migrated
}

/**
 * Import data ke IndexedDB
 * @param {object} importData - Data yang sudah divalidasi
 * @param {'merge' | 'replace'} mode - merge: tambah/update, replace: hapus semua lalu insert
 */
export async function importData(importData, mode = 'merge') {
    const db = await getDB()

    // Validasi dulu
    const validation = validateImportData(importData)
    if (!validation.valid) {
        return {
            success: false,
            errors: validation.errors
        }
    }

    // Migrate if needed
    const data = migrateData(importData)

    const stats = {}

    try {
        for (const storeName of ALL_STORES) {
            const items = data.data[storeName] || []

            // Skip if store not in import data
            if (items.length === 0 && mode === 'merge') {
                continue
            }

            if (mode === 'replace' && items.length > 0) {
                // Clear store first
                try {
                    await db.clear(storeName)
                } catch (e) {
                    console.warn(`Could not clear ${storeName}:`, e)
                }
            }

            // Insert/update items
            let imported = 0
            let skipped = 0

            for (const item of items) {
                try {
                    if (mode === 'merge') {
                        // Cek apakah sudah ada
                        const existing = await db.get(storeName, item.id)
                        if (existing) {
                            // Update hanya jika imported lebih baru
                            const existingDate = new Date(existing.updated_at || existing.updatedAt || existing.created_at || existing.createdAt || 0)
                            const importedDate = new Date(item.updated_at || item.updatedAt || item.created_at || item.createdAt || 0)

                            if (importedDate > existingDate) {
                                await db.put(storeName, item)
                                imported++
                            } else {
                                skipped++
                            }
                        } else {
                            await db.put(storeName, item)
                            imported++
                        }
                    } else {
                        // Replace mode - just insert
                        await db.put(storeName, item)
                        imported++
                    }
                } catch (e) {
                    console.error(`Error importing ${storeName} item:`, e)
                    skipped++
                }
            }

            if (imported > 0 || skipped > 0) {
                stats[storeName] = { imported, skipped }
            }
        }

        return {
            success: true,
            mode,
            stats,
            imported_at: new Date().toISOString()
        }

    } catch (error) {
        console.error('Import error:', error)
        return {
            success: false,
            errors: [error.message]
        }
    }
}

/**
 * Read file dan parse JSON
 */
export function readImportFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result)
                resolve(data)
            } catch (error) {
                reject(new Error('File bukan JSON yang valid'))
            }
        }

        reader.onerror = () => {
            reject(new Error('Gagal membaca file'))
        }

        reader.readAsText(file)
    })
}

/**
 * Get import preview stats
 */
export function getImportPreview(data) {
    if (!data?.data) return null

    const preview = {}
    for (const [store, items] of Object.entries(data.data)) {
        if (Array.isArray(items) && items.length > 0) {
            preview[store] = items.length
        }
    }
    return preview
}

