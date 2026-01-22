import { useState, useEffect, useCallback } from 'react'
import * as habitsService from '../lib/habits'

/**
 * Hook untuk mengelola habits
 */
export function useHabits() {
    const [habits, setHabits] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await habitsService.getAllHabits()
            setHabits(data)
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

    return { habits, loading, error, create, update, remove, refresh: load }
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

    const checkIn = async (habitId) => {
        const checkin = await habitsService.checkInHabit(habitId)
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
