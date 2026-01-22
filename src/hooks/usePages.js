import { useState, useEffect, useCallback, useMemo } from 'react'
import * as pagesService from '../lib/pages'
import { aggregateTags, sortedTagList, filterByTags, extractTags } from '../features/space/tagParser'
import { extractLinks } from '../features/space/linkParser'
import { DEFAULT_NOTEBOOK_ID } from '../features/space/notebooks/notebookRepo'

/**
 * Hook untuk mengelola pages (Space)
 * Provides optimistic updates, tag filtering, smart filters, and backlink resolution
 */
export function usePages() {
    const [pages, setPages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filter state
    const [selectedTags, setSelectedTags] = useState([])
    const [tagFilterMode, setTagFilterMode] = useState('all') // 'all' | 'any'
    const [activeSmartFilter, setActiveSmartFilter] = useState(null) // 'today' | 'week' | 'noTags' | null
    const [activeNotebookId, setActiveNotebookId] = useState(null) // null = all notebooks

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await pagesService.getAllPages()
            setPages(data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    // --- Tags Logic ---
    const allTags = useMemo(() => {
        const tagCounts = aggregateTags(pages)
        return sortedTagList(tagCounts)
    }, [pages])

    // --- Backlinks Logic ---
    // Index: Map<normalizedTitle, Set<pageId>>
    const backlinkIndex = useMemo(() => {
        const index = new Map()

        pages.forEach(page => {
            if (!page.outgoing_links) return

            page.outgoing_links.forEach(link => {
                if (!link.titleNorm) return

                if (!index.has(link.titleNorm)) {
                    index.set(link.titleNorm, new Set())
                }
                index.get(link.titleNorm).add(page.id)
            })
        })

        return index
    }, [pages])

    const getBacklinks = useCallback((title) => {
        if (!title) return []
        const titleNorm = title.trim().toLowerCase()
        const quotingPageIds = backlinkIndex.get(titleNorm)

        if (!quotingPageIds) return []

        // Return full page objects
        return pages.filter(p => quotingPageIds.has(p.id))
    }, [backlinkIndex, pages])

    const resolveLink = useCallback((title) => {
        if (!title) return null
        const titleNorm = title.trim().toLowerCase()
        return pages.find(p => p.title.trim().toLowerCase() === titleNorm)
    }, [pages])

    // --- Filtering Logic ---
    const filteredPages = useMemo(() => {
        let result = pages

        // Apply smart filter first
        if (activeSmartFilter) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday as start

            switch (activeSmartFilter) {
                case 'today':
                    result = result.filter(p => new Date(p.updated_at) >= today)
                    break
                case 'week':
                    result = result.filter(p => new Date(p.updated_at) >= startOfWeek)
                    break
                case 'noTags':
                    result = result.filter(p => !p.tags || p.tags.length === 0)
                    break
            }
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
            result = filterByTags(result, selectedTags, tagFilterMode)
        }

        // Apply notebook filter
        if (activeNotebookId) {
            result = result.filter(p => {
                const pageNotebook = p.notebookId || DEFAULT_NOTEBOOK_ID
                return pageNotebook === activeNotebookId
            })
        }

        return result
    }, [pages, selectedTags, tagFilterMode, activeSmartFilter, activeNotebookId])

    const create = async (data) => {
        const page = await pagesService.createPage(data)
        setPages(prev => [page, ...prev])
        return page
    }

    const update = async (id, data) => {
        const updated = await pagesService.updatePage(id, data)
        setPages(prev => prev.map(p => p.id === id ? updated : p))
        return updated
    }

    /**
     * Optimistic update - instantly updates list without waiting for DB
     * Also updates tags and links optimistically from content
     */
    const updateOptimistic = useCallback((id, patch) => {
        setPages(prev => prev.map(p => {
            if (p.id !== id) return p

            const newPage = { ...p, ...patch, updated_at: new Date().toISOString() }

            // Re-extract tags and links optimistically
            if (patch.content !== undefined) {
                newPage.tags = extractTags(patch.content)
                newPage.outgoing_links = extractLinks(patch.content)
            }

            return newPage
        }))
    }, [])

    const remove = async (id) => {
        await pagesService.deletePage(id)
        setPages(prev => prev.filter(p => p.id !== id))
    }

    const search = async (query) => {
        if (!query.trim()) {
            const data = await pagesService.getAllPages()
            setPages(data)
            return data
        }
        const results = await pagesService.searchPages(query)
        setPages(results)
        return results
    }

    // Tag filter helpers
    const toggleTag = useCallback((tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }, [])

    const clearTagFilter = useCallback(() => {
        setSelectedTags([])
    }, [])

    const setSmartFilter = useCallback((filter) => {
        setActiveSmartFilter(prev => prev === filter ? null : filter)
        // Clear tag filters when using smart filter
        if (filter) {
            setSelectedTags([])
        }
    }, [])

    // Notebook filter helper
    const setNotebookFilter = useCallback((notebookId) => {
        setActiveNotebookId(prev => prev === notebookId ? null : notebookId)
    }, [])

    // Move page to notebook
    const moveToNotebook = useCallback(async (pageId, notebookId) => {
        const updated = await pagesService.updatePage(pageId, {
            notebookId: notebookId || DEFAULT_NOTEBOOK_ID
        })
        setPages(prev => prev.map(p => p.id === pageId ? updated : p))
        return updated
    }, [])

    // Move all pages from one notebook to another (for delete notebook)
    const moveAllToNotebook = useCallback(async (fromNotebookId, toNotebookId = DEFAULT_NOTEBOOK_ID) => {
        const toMove = pages.filter(p => (p.notebookId || DEFAULT_NOTEBOOK_ID) === fromNotebookId)
        for (const page of toMove) {
            await pagesService.updatePage(page.id, { notebookId: toNotebookId })
        }
        // Reload to get fresh data
        await load()
    }, [pages, load])

    return {
        // Data
        pages: filteredPages,
        allPages: pages, // Unfiltered for stats & linking
        loading,
        error,

        // Tags
        allTags,
        selectedTags,
        tagFilterMode,
        setTagFilterMode,
        toggleTag,
        clearTagFilter,

        // Links
        getBacklinks,
        resolveLink,

        // Smart filters
        activeSmartFilter,
        setSmartFilter,

        // Notebooks
        activeNotebookId,
        setNotebookFilter,
        moveToNotebook,
        moveAllToNotebook,

        // CRUD
        create,
        update,
        updateOptimistic,
        remove,
        search,
        refresh: load
    }
}

/**
 * Hook untuk single page
 */
export function usePage(id) {
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        if (!id) {
            setPage(null)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await pagesService.getPage(id)
            setPage(data)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        load()
    }, [load])

    const update = async (data) => {
        if (!id) return
        const updated = await pagesService.updatePage(id, data)
        setPage(updated)
        return updated
    }

    return { page, loading, update, refresh: load }
}

/**
 * Hook untuk tags
 */
export function useTags() {
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await pagesService.getAllTags()
            setTags(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const create = async (data) => {
        const tag = await pagesService.createTag(data)
        setTags(prev => [...prev, tag])
        return tag
    }

    const remove = async (id) => {
        await pagesService.deleteTag(id)
        setTags(prev => prev.filter(t => t.id !== id))
    }

    return { tags, loading, create, remove, refresh: load }
}

/**
 * Hook untuk page stats
 */
export function usePageStats() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await pagesService.getPageStats()
                setStats(data)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return { stats, loading }
}
