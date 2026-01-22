/**
 * notebookRepo.js - Repository for Space Notebooks
 * 
 * Pure async CRUD operations for IndexedDB.
 * Separated from hook for testability.
 */

import { getDB, generateId, now } from '../../../lib/db'

const STORE_NAME = 'notebooks'
export const DEFAULT_NOTEBOOK_ID = 'inbox'

// Color tokens (theme-safe)
export const NOTEBOOK_COLORS = {
    sage: { light: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary' },
    sky: { light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    amber: { light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
    rose: { light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
    purple: { light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
    gray: { light: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' },
}

// Emoji presets
export const NOTEBOOK_EMOJIS = ['📥', '📚', '💼', '🏠', '🎯', '💡', '📝', '🔬', '🎨', '🌱']

/**
 * Get Inbox notebook (always exists)
 */
export function getInboxNotebook() {
    return {
        id: DEFAULT_NOTEBOOK_ID,
        name: 'Inbox',
        emoji: '📥',
        color: 'gray',
        createdAt: 0,
        updatedAt: 0,
        order: 0,
        isDefault: true,
    }
}

/**
 * Load all notebooks (including Inbox)
 */
export async function loadNotebooks() {
    const db = await getDB()
    const stored = await db.getAll(STORE_NAME)

    // Filter out deleted and sort by order
    const notebooks = stored
        .filter(n => !n.deleted_at)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

    // Always ensure Inbox is first
    const hasInbox = notebooks.some(n => n.id === DEFAULT_NOTEBOOK_ID)
    if (!hasInbox) {
        return [getInboxNotebook(), ...notebooks]
    }

    return notebooks
}

/**
 * Get single notebook by ID
 */
export async function getNotebook(id) {
    if (id === DEFAULT_NOTEBOOK_ID) {
        return getInboxNotebook()
    }

    const db = await getDB()
    return db.get(STORE_NAME, id)
}

/**
 * Create new notebook
 */
export async function createNotebook({ name, emoji = '📝', color = 'sage' }) {
    const db = await getDB()

    // Get max order
    const all = await db.getAll(STORE_NAME)
    const maxOrder = all.reduce((max, n) => Math.max(max, n.order || 0), 0)

    const notebook = {
        id: generateId(),
        name: name.trim(),
        emoji,
        color,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        order: maxOrder + 1,
        user_id: null,
        sync_status: 'dirty',
        deleted_at: null,
    }

    await db.put(STORE_NAME, notebook)
    return notebook
}

/**
 * Update notebook
 */
export async function updateNotebook(id, updates) {
    if (id === DEFAULT_NOTEBOOK_ID) {
        throw new Error('Cannot modify Inbox notebook')
    }

    const db = await getDB()
    const existing = await db.get(STORE_NAME, id)

    if (!existing) {
        throw new Error('Notebook not found')
    }

    const updated = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
        sync_status: 'dirty',
    }

    await db.put(STORE_NAME, updated)
    return updated
}

/**
 * Delete notebook (soft delete)
 * Notes will be moved to Inbox by caller
 */
export async function deleteNotebook(id) {
    if (id === DEFAULT_NOTEBOOK_ID) {
        throw new Error('Cannot delete Inbox notebook')
    }

    const db = await getDB()
    const existing = await db.get(STORE_NAME, id)

    if (!existing) {
        throw new Error('Notebook not found')
    }

    const deleted = {
        ...existing,
        deleted_at: now(),
        updatedAt: Date.now(),
        sync_status: 'dirty',
    }

    await db.put(STORE_NAME, deleted)
    return deleted
}

/**
 * Reorder notebooks
 */
export async function reorderNotebooks(orderedIds) {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')

    for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i]
        if (id === DEFAULT_NOTEBOOK_ID) continue

        const notebook = await tx.store.get(id)
        if (notebook) {
            notebook.order = i + 1
            notebook.updatedAt = Date.now()
            await tx.store.put(notebook)
        }
    }

    await tx.done
}

/**
 * Count notes in notebook
 */
export async function countNotesInNotebook(notebookId) {
    const db = await getDB()

    // Use index if available
    const pagesStore = db.transaction('pages').objectStore('pages')

    if (pagesStore.indexNames.contains('by_notebook')) {
        const index = pagesStore.index('by_notebook')
        return index.count(notebookId || DEFAULT_NOTEBOOK_ID)
    }

    // Fallback: manual count
    const pages = await db.getAll('pages')
    return pages.filter(p =>
        !p.deleted_at &&
        (p.notebookId || DEFAULT_NOTEBOOK_ID) === (notebookId || DEFAULT_NOTEBOOK_ID)
    ).length
}

export default {
    NOTEBOOK_COLORS,
    NOTEBOOK_EMOJIS,
    DEFAULT_NOTEBOOK_ID,
    getInboxNotebook,
    loadNotebooks,
    getNotebook,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    reorderNotebooks,
    countNotesInNotebook,
}
