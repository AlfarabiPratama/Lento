import { useState, useEffect, useCallback } from 'react'
import {
    getAllRecurringTemplates,
    getActiveRecurringTemplates,
    createRecurringTemplate,
    updateRecurringTemplate,
    deleteRecurringTemplate,
    toggleRecurringTemplate,
    RECURRING_INTERVALS
} from '../lib/recurringRepo.js'
import { initRecurringGenerator } from '../features/finance/recurring/recurringGenerator.js'

/**
 * useRecurringTemplates - Hook for managing recurring transaction templates
 */
export function useRecurringTemplates() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadTemplates = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const allTemplates = await getAllRecurringTemplates()
            setTemplates(allTemplates.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            ))
        } catch (err) {
            console.error('Failed to load recurring templates:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTemplates()
    }, [loadTemplates])

    const create = useCallback(async (templateData) => {
        try {
            const newTemplate = await createRecurringTemplate(templateData)
            setTemplates(prev => [newTemplate, ...prev])
            return newTemplate
        } catch (err) {
            console.error('Failed to create recurring template:', err)
            throw err
        }
    }, [])

    const update = useCallback(async (id, updates) => {
        try {
            const updatedTemplate = await updateRecurringTemplate(id, updates)
            setTemplates(prev => prev.map(t =>
                t.id === id ? updatedTemplate : t
            ))
            return updatedTemplate
        } catch (err) {
            console.error('Failed to update recurring template:', err)
            throw err
        }
    }, [])

    const remove = useCallback(async (id) => {
        try {
            await deleteRecurringTemplate(id)
            setTemplates(prev => prev.filter(t => t.id !== id))
        } catch (err) {
            console.error('Failed to delete recurring template:', err)
            throw err
        }
    }, [])

    const toggle = useCallback(async (id) => {
        try {
            const updatedTemplate = await toggleRecurringTemplate(id)
            setTemplates(prev => prev.map(t =>
                t.id === id ? updatedTemplate : t
            ))
            return updatedTemplate
        } catch (err) {
            console.error('Failed to toggle recurring template:', err)
            throw err
        }
    }, [])

    return {
        templates,
        loading,
        error,
        refresh: loadTemplates,
        create,
        update,
        remove,
        toggle,
        RECURRING_INTERVALS,
    }
}

/**
 * useRecurringGenerator - Hook to initialize recurring generator on mount
 */
export function useRecurringGenerator() {
    const [result, setResult] = useState(null)
    const [running, setRunning] = useState(false)

    useEffect(() => {
        async function init() {
            setRunning(true)
            try {
                const result = await initRecurringGenerator()
                setResult(result)
                if (result.created > 0) {
                    console.log(`[Recurring] Created ${result.created} transactions`)
                }
            } catch (err) {
                console.error('[Recurring] Generator error:', err)
            } finally {
                setRunning(false)
            }
        }
        init()
    }, [])

    return { result, running }
}

export default useRecurringTemplates
