import { useState, useEffect, useCallback } from 'react'
import * as journalsService from '../lib/journals'

/**
 * Hook untuk mengelola journal entries
 */
export function useJournals() {
    const [journals, setJournals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await journalsService.getAllJournals()
            setJournals(data)
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

    const create = async (data) => {
        const journal = await journalsService.createJournal(data)
        setJournals(prev => [journal, ...prev])
        return journal
    }

    const update = async (id, data) => {
        const updated = await journalsService.updateJournal(id, data)
        setJournals(prev => prev.map(j => j.id === id ? updated : j))
        return updated
    }

    const remove = async (id) => {
        await journalsService.deleteJournal(id)
        setJournals(prev => prev.filter(j => j.id !== id))
    }

    return { journals, loading, error, create, update, remove, refresh: load }
}

/**
 * Hook untuk journal stats
 */
export function useJournalStats() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await journalsService.getJournalStats()
                setStats(data)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return { stats, loading }
}

/**
 * Hook untuk journals hari ini
 */
export function useTodayJournals() {
    const [journals, setJournals] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await journalsService.getTodayJournals()
            setJournals(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    return { journals, loading, refresh: load }
}
