import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { search as searchQuery, getAllTags } from '../features/search/query'
import { buildIndex, isIndexReady } from '../features/search/indexer'
import { SEARCH_SCOPES, DATE_FILTERS, SEARCH_DEFAULTS } from '../features/search/constants'

const SearchContext = createContext(null)

/**
 * SearchProvider - Global search state provider
 */
export function SearchProvider({ children }) {
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
            debounceRef.current = null
        }

        debounceRef.current = setTimeout(() => {
            const searchResults = searchQuery(query, filters)
            setResults(searchResults)
            debounceRef.current = null
        }, SEARCH_DEFAULTS.debounceMs)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
                debounceRef.current = null
            }
        }
    }, [query, filters, indexReady])

    // Keyboard shortcut: Ctrl+K to open
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setOpen(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const openSearch = useCallback(() => setOpen(true), [])
    const closeSearch = useCallback(() => {
        setOpen(false)
        setQuery('')
        setResults([])
    }, [])

    const setScope = useCallback((scope) => {
        setFilters(prev => ({ ...prev, scope }))
    }, [])

    const setDateFilter = useCallback((dateFilter) => {
        setFilters(prev => ({ ...prev, dateFilter }))
    }, [])

    const setTags = useCallback((tags) => {
        setFilters(prev => ({ ...prev, tags }))
    }, [])

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

    const clearSearch = useCallback(() => {
        setQuery('')
        setResults([])
    }, [])

    const value = {
        open,
        query,
        results,
        loading,
        filters,
        indexReady,
        openSearch,
        closeSearch,
        setQuery,
        setScope,
        setDateFilter,
        setTags,
        resetFilters,
        clearSearch,
        getAllTags,
    }

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    )
}

/**
 * useSearchContext - Access search context
 */
export function useSearchContext() {
    const context = useContext(SearchContext)
    if (!context) {
        throw new Error('useSearchContext must be used within SearchProvider')
    }
    return context
}

export default SearchProvider
