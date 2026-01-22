/**
 * Search Indexer - FlexSearch index management
 * @ts-check
 */

import FlexSearch from 'flexsearch'
import { getAllFinanceDocs } from './adapters/financeAdapter'
import { getAllJournalDocs } from './adapters/journalAdapter'
import { getAllSpaceDocs } from './adapters/spaceAdapter'
import { getAllHabitDocs } from './adapters/habitAdapter'
import { getAllPomodoroDocs } from './adapters/pomodoroAdapter'
import { getAllBookDocs } from './adapters/booksAdapter'

/** @type {FlexSearch.Index | null} */
let index = null

/** @type {Map<string, import('./types').SearchDocument>} */
const docStore = new Map()

/**
 * Initialize the FlexSearch index
 * Using simple Index for better compatibility
 */
function createIndex() {
    return new FlexSearch.Index({
        tokenize: 'forward',
        resolution: 9,
    })
}

/**
 * Build searchable text from document
 * @param {import('./types').SearchDocument} doc
 * @returns {string}
 */
function buildSearchText(doc) {
    const parts = [doc.title, doc.body, ...(doc.tags || [])]
    return parts.filter(Boolean).join(' ')
}

/**
 * Build the full search index from all modules
 * @returns {Promise<{success: boolean, count: number}>}
 */
export async function buildIndex() {
    console.log('Building search index...')

    try {
        index = createIndex()
        docStore.clear()

        // Collect all docs from all modules (catch individual errors)
        const results = await Promise.allSettled([
            getAllFinanceDocs(),
            getAllJournalDocs(),
            getAllSpaceDocs(),
            getAllHabitDocs(),
            getAllPomodoroDocs(),
            getAllBookDocs(),
        ])

        const allDocs = []
        for (const result of results) {
            if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                allDocs.push(...result.value)
            }
        }

        // Add all docs to index
        for (const doc of allDocs) {
            const searchText = buildSearchText(doc)
            index.add(doc.id, searchText)
            docStore.set(doc.id, doc)
        }

        console.log(`Search index built with ${allDocs.length} documents`)
        return { success: true, count: allDocs.length }
    } catch (err) {
        console.error('Failed to build search index:', err)
        return { success: false, count: 0 }
    }
}

/**
 * Add or update a document in the index
 * @param {import('./types').SearchDocument} doc
 */
export function updateDocument(doc) {
    if (!index) {
        console.warn('Search index not initialized')
        return
    }

    // Remove old version if exists
    if (docStore.has(doc.id)) {
        index.remove(doc.id)
    }

    // Add updated doc
    const searchText = buildSearchText(doc)
    index.add(doc.id, searchText)
    docStore.set(doc.id, doc)
}

/**
 * Remove a document from the index
 * @param {string} docId
 */
export function removeDocument(docId) {
    if (!index) return

    index.remove(docId)
    docStore.delete(docId)
}

/**
 * Get a document by ID
 * @param {string} docId
 * @returns {import('./types').SearchDocument | undefined}
 */
export function getDocument(docId) {
    return docStore.get(docId)
}

/**
 * Get all documents
 * @returns {import('./types').SearchDocument[]}
 */
export function getAllDocuments() {
    return Array.from(docStore.values())
}

/**
 * Check if index is ready
 * @returns {boolean}
 */
export function isIndexReady() {
    return index !== null && docStore.size >= 0
}

/**
 * Get the FlexSearch index instance
 * @returns {FlexSearch.Index | null}
 */
export function getIndex() {
    return index
}

/**
 * Search the index
 * @param {string} query
 * @param {number} limit
 * @returns {string[]} Array of document IDs
 */
export function searchIndex(query, limit = 50) {
    if (!index || !query) return []
    return index.search(query, limit)
}

export default {
    buildIndex,
    updateDocument,
    removeDocument,
    getDocument,
    getAllDocuments,
    isIndexReady,
    getIndex,
    searchIndex,
}
