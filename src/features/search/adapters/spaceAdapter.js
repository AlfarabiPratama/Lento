/**
 * Space Adapter - Convert pages to SearchDocument format
 * @ts-check
 */

import { getDB } from '../../../lib/db'

/**
 * Convert a page to SearchDocument format
 * @param {Object} page - Page from IndexedDB
 * @returns {import('../types').SearchDocument}
 */
export function pageToSearchDoc(page) {
    return {
        id: page.id,
        module: 'space',
        title: page.title || 'Untitled',
        body: page.content || '',
        tags: page.tags || [],
        created_at: page.created_at,
        updated_at: page.updated_at,
        meta: {
            page_id: page.id,
            path: page.path,
        },
    }
}

/**
 * Get all pages as SearchDocuments
 * @returns {Promise<import('../types').SearchDocument[]>}
 */
export async function getAllSpaceDocs() {
    try {
        const db = await getDB()
        const pages = await db.getAll('pages')
        return pages.map(pageToSearchDoc)
    } catch (err) {
        console.error('Failed to get space docs:', err)
        return []
    }
}
