/**
 * Search Query Engine - Search and filter logic
 * @ts-check
 */

import { searchIndex, getAllDocuments, isIndexReady, getDocument } from './indexer'
import { SEARCH_SCOPES, DATE_FILTERS, SEARCH_DEFAULTS } from './constants'

/**
 * Search documents with query and filters
 * @param {string} query - Search query
 * @param {Partial<import('./types').SearchFilters>} filters - Active filters
 * @returns {import('./types').SearchResult[]}
 */
export function search(query, filters = {}) {
    if (!isIndexReady()) {
        console.warn('Search index not ready')
        return []
    }

    const {
        scope = SEARCH_SCOPES.ALL,
        dateFilter = DATE_FILTERS.ALL,
        dateFrom,
        dateTo,
        tags = [],
        financeType,
        accountId,
        categoryId,
    } = filters

    let results = []

    // If query is empty, return all docs (filtered)
    if (!query || query.trim() === '') {
        results = getAllDocuments().map(doc => ({
            doc,
            snippet: createSnippet(doc.body, ''),
            score: 1,
        }))
    } else {
        // Search with FlexSearch
        const matchIds = searchIndex(query, SEARCH_DEFAULTS.maxResults)

        for (const id of matchIds) {
            const doc = getDocument(id)
            if (doc) {
                results.push({
                    doc,
                    snippet: createSnippet(doc.body, query),
                    score: 1,
                })
            }
        }
    }

    // Apply filters
    results = applyFilters(results, {
        scope,
        dateFilter,
        dateFrom,
        dateTo,
        tags,
        financeType,
        accountId,
        categoryId,
    })

    return results.slice(0, SEARCH_DEFAULTS.maxResults)
}

/**
 * Apply filters to search results
 * @param {import('./types').SearchResult[]} results
 * @param {import('./types').SearchFilters} filters
 * @returns {import('./types').SearchResult[]}
 */
function applyFilters(results, filters) {
    return results.filter(({ doc }) => {
        // Scope filter
        if (filters.scope !== SEARCH_SCOPES.ALL && doc.module !== filters.scope) {
            return false
        }

        // Date filter
        if (!passesDateFilter(doc, filters.dateFilter, filters.dateFrom, filters.dateTo)) {
            return false
        }

        // Tag filter
        if (filters.tags && filters.tags.length > 0) {
            const docTags = doc.tags || []
            const hasTag = filters.tags.some(tag => docTags.includes(tag))
            if (!hasTag) return false
        }

        // Finance-specific filters
        if (doc.module === 'finance') {
            if (filters.financeType && filters.financeType !== 'all' && doc.meta.type !== filters.financeType) {
                return false
            }
            if (filters.accountId && doc.meta.account_id !== filters.accountId) {
                return false
            }
            if (filters.categoryId && doc.meta.category_id !== filters.categoryId) {
                return false
            }
        }

        return true
    })
}

/**
 * Check if document passes date filter
 * @param {import('./types').SearchDocument} doc
 * @param {string} dateFilter
 * @param {Date} [dateFrom]
 * @param {Date} [dateTo]
 * @returns {boolean}
 */
function passesDateFilter(doc, dateFilter, dateFrom, dateTo) {
    if (dateFilter === DATE_FILTERS.ALL) return true

    const docDate = new Date(doc.updated_at || doc.created_at)
    const now = new Date()

    switch (dateFilter) {
        case DATE_FILTERS.TODAY: {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            return docDate >= today
        }
        case DATE_FILTERS.WEEK: {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return docDate >= weekAgo
        }
        case DATE_FILTERS.MONTH: {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            return docDate >= monthStart
        }
        case DATE_FILTERS.CUSTOM: {
            if (dateFrom && docDate < dateFrom) return false
            if (dateTo && docDate > dateTo) return false
            return true
        }
        default:
            return true
    }
}

/**
 * Create a snippet from body text with query highlighted
 * @param {string} body
 * @param {string} query
 * @returns {string}
 */
function createSnippet(body, query) {
    if (!body) return ''

    const maxLen = SEARCH_DEFAULTS.snippetLength

    if (!query) {
        return body.slice(0, maxLen) + (body.length > maxLen ? '...' : '')
    }

    const lowerBody = body.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const pos = lowerBody.indexOf(lowerQuery)

    if (pos === -1) {
        return body.slice(0, maxLen) + (body.length > maxLen ? '...' : '')
    }

    // Show context around the match
    const start = Math.max(0, pos - 30)
    const end = Math.min(body.length, pos + query.length + 60)

    let snippet = ''
    if (start > 0) snippet += '...'
    snippet += body.slice(start, end)
    if (end < body.length) snippet += '...'

    return snippet
}

/**
 * Get unique tags from all documents
 * @returns {string[]}
 */
export function getAllTags() {
    const tagSet = new Set()
    for (const doc of getAllDocuments()) {
        for (const tag of doc.tags || []) {
            tagSet.add(tag)
        }
    }
    return Array.from(tagSet).sort()
}

export default {
    search,
    getAllTags,
}
