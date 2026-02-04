import { useState, useEffect, useCallback } from 'react'
import * as habitsService from '../lib/habits'

/**
 * Hook untuk mengelola habits
 */
export function useHabits(options = {}) {
    const { includeArchived = false } = options
    const [habits, setHabits] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await habitsService.getAllHabits({ includeArchived })
            setHabits(data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [includeArchived])

    useEffect(() => {
        load()
    }, [load])

    const create = async (data) => {
        const habit = await habitsService.createHabit(data)
        setHabits(prev => [habit, ...prev])
        return habit
    }

    const update = async (id, data) => {
        const updated = await habitsService.updateHabit(id, data)
        setHabits(prev => prev.map(h => h.id === id ? updated : h))
        return updated
    }

    const remove = async (id) => {
        await habitsService.deleteHabit(id)
        setHabits(prev => prev.filter(h => h.id !== id))
    }

    const archive = async (id) => {
        const archived = await habitsService.archiveHabit(id)
        if (!includeArchived) {
            setHabits(prev => prev.filter(h => h.id !== id))
        } else {
            setHabits(prev => prev.map(h => h.id === id ? archived : h))
        }
        return archived
    }

    const unarchive = async (id) => {
        const unarchived = await habitsService.unarchiveHabit(id)
        setHabits(prev => prev.map(h => h.id === id ? unarchived : h))
        return unarchived
    }

    const reorder = async (habitId, newOrder) => {
        const updated = await habitsService.updateHabit(habitId, { order: newOrder })
        setHabits(prev => prev.map(h => h.id === habitId ? updated : h))
        return updated
    }

    return { habits, loading, error, create, update, remove, archive, unarchive, reorder, refresh: load }
}

/**
 * Hook untuk check-ins hari ini
 */
export function useTodayCheckins() {
    const [checkins, setCheckins] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await habitsService.getTodayCheckins()
            setCheckins(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const checkIn = async (habitId, note = '') => {
        const checkin = await habitsService.checkInHabit(habitId, new Date(), note)
        setCheckins(prev => [...prev, checkin])
        return checkin
    }

    const uncheck = async (habitId) => {
        await habitsService.uncheckHabit(habitId)
        setCheckins(prev => prev.filter(c => c.habit_id !== habitId))
    }

    const isChecked = (habitId) => {
        return checkins.some(c => c.habit_id === habitId)
    }

    return { checkins, loading, checkIn, uncheck, isChecked, refresh: load }
}

/**
 * Hook untuk single habit dengan stats
 */
export function useHabit(id) {
    const [habit, setHabit] = useState(null)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        const load = async () => {
            try {
                setLoading(true)
                const [h, s] = await Promise.all([
                    habitsService.getHabit(id),
                    habitsService.getHabitStats(id)
                ])
                setHabit(h)
                setStats(s)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [id])

    return { habit, stats, loading }
}
