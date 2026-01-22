import { useState, useCallback, useEffect, useRef } from 'react'
import { search as searchQuery, getAllTags } from '../features/search/query'
import { buildIndex, isIndexReady } from '../features/search/indexer'
import { SEARCH_SCOPES, DATE_FILTERS, SEARCH_DEFAULTS } from '../features/search/constants'

/**
 * useSearch - Search state and operations hook
 */
export function useSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [indexReady, setIndexReady] = useState(false)
    const [filters, setFilters] = useState({
        scope: SEARCH_SCOPES.ALL,
        dateFilter: DATE_FILTERS.ALL,
        dateFrom: null,
        dateTo: null,
        tags: [],
        financeType: null,
        accountId: null,
        categoryId: null,
    })

    const debounceRef = useRef(null)

    // Build index on first open
    useEffect(() => {
        if (open && !isIndexReady()) {
            setLoading(true)
            buildIndex().then(() => {
                setIndexReady(true)
                setLoading(false)
            })
        }
    }, [open])

    // Debounced search
    useEffect(() => {
        if (!indexReady) return

        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
            const searchResults = searchQuery(query, filters)
            setResults(searchResults)
        }, SEARCH_DEFAULTS.debounceMs)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [query, filters, indexReady])

    // Open search overlay
    const openSearch = useCallback(() => {
        setOpen(true)
    }, [])

    // Close search overlay
    const closeSearch = useCallback(() => {
        setOpen(false)
        setQuery('')
        setResults([])
    }, [])

    // Update scope filter
    const setScope = useCallback((scope) => {
        setFilters(prev => ({ ...prev, scope }))
    }, [])

    // Update date filter
    const setDateFilter = useCallback((dateFilter) => {
        setFilters(prev => ({ ...prev, dateFilter }))
    }, [])

    // Update tags filter
    const setTags = useCallback((tags) => {
        setFilters(prev => ({ ...prev, tags }))
    }, [])

    // Update finance type filter
    const setFinanceType = useCallback((financeType) => {
        setFilters(prev => ({ ...prev, financeType }))
    }, [])

    // Reset all filters
    const resetFilters = useCallback(() => {
        setFilters({
            scope: SEARCH_SCOPES.ALL,
            dateFilter: DATE_FILTERS.ALL,
            dateFrom: null,
            dateTo: null,
            tags: [],
            financeType: null,
            accountId: null,
            categoryId: null,
        })
    }, [])

    // Clear search
    const clearSearch = useCallback(() => {
        setQuery('')
        setResults([])
    }, [])

    return {
        // State
        open,
        query,
        results,
        loading,
        filters,
        indexReady,

        // Actions
        openSearch,
        closeSearch,
        setQuery,
        setScope,
        setDateFilter,
        setTags,
        setFinanceType,
        resetFilters,
        clearSearch,

        // Helpers
        getAllTags,
    }
}

export default useSearch
