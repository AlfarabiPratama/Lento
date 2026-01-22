/**
 * useNotebooks.js - React hook for Space Notebooks
 * 
 * State management + memoization wrapper around notebookRepo.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    loadNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    reorderNotebooks,
    countNotesInNotebook,
    DEFAULT_NOTEBOOK_ID,
} from './notebookRepo'

export function useNotebooks() {
    const [notebooks, setNotebooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [counts, setCounts] = useState({})

    // Load notebooks
    const refresh = useCallback(async () => {
        try {
            setLoading(true)
            const data = await loadNotebooks()
            setNotebooks(data)

            // Load counts for each notebook
            const newCounts = {}
            for (const nb of data) {
                newCounts[nb.id] = await countNotesInNotebook(nb.id)
            }
            setCounts(newCounts)

            setError(null)
        } catch (err) {
            console.error('Failed to load notebooks:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial load
    useEffect(() => {
        refresh()
    }, [refresh])

    // Create
    const create = useCallback(async (data) => {
        const notebook = await createNotebook(data)
        await refresh()
        return notebook
    }, [refresh])

    // Update
    const update = useCallback(async (id, updates) => {
        const notebook = await updateNotebook(id, updates)
        await refresh()
        return notebook
    }, [refresh])

    // Delete (moves notes to Inbox)
    const remove = useCallback(async (id) => {
        await deleteNotebook(id)
        await refresh()
    }, [refresh])

    // Reorder
    const reorder = useCallback(async (orderedIds) => {
        await reorderNotebooks(orderedIds)
        await refresh()
    }, [refresh])

    // Computed values
    const notebooksWithCounts = useMemo(() => {
        return notebooks.map(nb => ({
            ...nb,
            noteCount: counts[nb.id] || 0,
        }))
    }, [notebooks, counts])

    // Get notebook by ID
    const getById = useCallback((id) => {
        return notebooks.find(nb => nb.id === id) || null
    }, [notebooks])

    return {
        notebooks: notebooksWithCounts,
        loading,
        error,
        refresh,
        create,
        update,
        remove,
        reorder,
        getById,
        DEFAULT_NOTEBOOK_ID,
    }
}

export default useNotebooks
