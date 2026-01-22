/**
 * useImportantDates - Hook for managing important dates
 * 
 * Types: holiday, deadline, goal, personal, birthday
 */

import { useState, useEffect, useCallback } from 'react'
import { getDB, generateId, now, createBaseFields, markUpdated, markDeleted } from '../lib/db'

const STORE_NAME = 'important_dates'

// Default important dates (Indonesian holidays 2025)
const DEFAULT_HOLIDAYS = {
    '2025-01-01': { label: 'Tahun Baru', type: 'holiday', icon: '🎉' },
    '2025-01-29': { label: 'Tahun Baru Imlek', type: 'holiday', icon: '🧧' },
    '2025-03-29': { label: 'Hari Raya Nyepi', type: 'holiday', icon: '🕯️' },
    '2025-03-31': { label: 'Idul Fitri', type: 'holiday', icon: '🌙' },
    '2025-04-01': { label: 'Idul Fitri', type: 'holiday', icon: '🌙' },
    '2025-04-18': { label: 'Jumat Agung', type: 'holiday', icon: '✝️' },
    '2025-05-01': { label: 'Hari Buruh', type: 'holiday', icon: '💪' },
    '2025-05-12': { label: 'Hari Waisak', type: 'holiday', icon: '🪷' },
    '2025-05-29': { label: 'Kenaikan Yesus', type: 'holiday', icon: '✝️' },
    '2025-06-01': { label: 'Hari Lahir Pancasila', type: 'holiday', icon: '🇮🇩' },
    '2025-06-06': { label: 'Idul Adha', type: 'holiday', icon: '🐐' },
    '2025-06-27': { label: 'Tahun Baru Islam', type: 'holiday', icon: '☪️' },
    '2025-08-17': { label: 'Hari Kemerdekaan', type: 'holiday', icon: '🇮🇩' },
    '2025-09-05': { label: 'Maulid Nabi', type: 'holiday', icon: '☪️' },
    '2025-12-25': { label: 'Hari Natal', type: 'holiday', icon: '🎄' },
}

export function useImportantDates() {
    const [importantDates, setImportantDates] = useState({})
    const [loading, setLoading] = useState(true)

    // Load important dates from IndexedDB
    const loadDates = useCallback(async () => {
        try {
            const db = await getDB()
            const allDates = await db.getAll(STORE_NAME)

            // Convert array to map by date
            const datesMap = {}
            allDates
                .filter(d => !d.deleted_at)
                .forEach(d => {
                    datesMap[d.date] = d
                })

            // Merge with default holidays (only if no custom entry exists)
            Object.entries(DEFAULT_HOLIDAYS).forEach(([dateKey, holidayData]) => {
                if (!datesMap[dateKey]) {
                    datesMap[dateKey] = {
                        id: `default-${dateKey}`,
                        date: dateKey,
                        ...holidayData,
                        isDefault: true
                    }
                }
            })

            setImportantDates(datesMap)
        } catch (e) {
            console.error('Failed to load important dates:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadDates()
    }, [loadDates])

    // Add new important date
    const addImportantDate = useCallback(async (dateData) => {
        try {
            const db = await getDB()
            const id = generateId()

            const newDate = {
                ...createBaseFields(),
                id,
                date: dateData.date, // YYYY-MM-DD
                label: dateData.label,
                type: dateData.type || 'personal',
                icon: dateData.icon || '📌',
                description: dateData.description || '',
                color: dateData.color || null,
            }

            await db.put(STORE_NAME, newDate)
            await loadDates()
            return newDate
        } catch (e) {
            console.error('Failed to add important date:', e)
            return null
        }
    }, [loadDates])

    // Update existing important date
    const updateImportantDate = useCallback(async (id, updates) => {
        try {
            const db = await getDB()
            const existing = await db.get(STORE_NAME, id)
            if (!existing) return null

            const updated = markUpdated({
                ...existing,
                ...updates
            })

            await db.put(STORE_NAME, updated)
            await loadDates()
            return updated
        } catch (e) {
            console.error('Failed to update important date:', e)
            return null
        }
    }, [loadDates])

    // Delete important date (soft delete)
    const deleteImportantDate = useCallback(async (id) => {
        try {
            // Skip default holidays
            if (id.startsWith('default-')) return false

            const db = await getDB()
            const existing = await db.get(STORE_NAME, id)
            if (!existing) return false

            const deleted = markDeleted(existing)
            await db.put(STORE_NAME, deleted)
            await loadDates()
            return true
        } catch (e) {
            console.error('Failed to delete important date:', e)
            return false
        }
    }, [loadDates])

    // Get important date by date key
    const getDateByKey = useCallback((dateKey) => {
        return importantDates[dateKey] || null
    }, [importantDates])

    return {
        importantDates,
        loading,
        addImportantDate,
        updateImportantDate,
        deleteImportantDate,
        getDateByKey,
        reload: loadDates
    }
}

export default useImportantDates
