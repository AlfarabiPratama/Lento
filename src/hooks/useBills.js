/**
 * useBills Hook
 * 
 * Manages bills data and operations
 */

import { useState, useEffect } from 'react'
import {
    addBill,
    getUserBills,
    getPendingBills,
    getOverdueBills,
    updateBill,
    markBillAsPaid,
    deleteBill,
    getBillStats
} from '../lib/billsRepo'
import { useAuth } from './useAuth'

export const useBills = () => {
    const { user } = useAuth()
    const [bills, setBills] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState(null)

    // Load bills
    useEffect(() => {
        if (!user) {
            setBills([])
            setStats(null)
            setLoading(false)
            return
        }

        loadBills()
    }, [user])

    const loadBills = async () => {
        try {
            setLoading(true)
            const [billsData, statsData] = await Promise.all([
                getUserBills(user.uid),
                getBillStats(user.uid)
            ])
            setBills(billsData)
            setStats(statsData)
        } catch (err) {
            console.error('Error loading bills:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const createBill = async (billData) => {
        try {
            const newBill = await addBill(user.uid, billData)
            setBills(prev => [...prev, newBill])
            await loadBills() // Reload untuk update stats
            return newBill
        } catch (err) {
            console.error('Error creating bill:', err)
            throw err
        }
    }

    const editBill = async (billId, updates) => {
        try {
            const updated = await updateBill(billId, updates)
            setBills(prev => prev.map(b => b.id === billId ? updated : b))
            await loadBills() // Reload untuk update stats
            return updated
        } catch (err) {
            console.error('Error updating bill:', err)
            throw err
        }
    }

    const payBill = async (billId, paidDate) => {
        try {
            const updated = await markBillAsPaid(billId, paidDate)
            setBills(prev => prev.map(b => b.id === billId ? updated : b))
            await loadBills() // Reload untuk update stats
            return updated
        } catch (err) {
            console.error('Error marking bill as paid:', err)
            throw err
        }
    }

    const removeBill = async (billId) => {
        try {
            await deleteBill(billId)
            setBills(prev => prev.filter(b => b.id !== billId))
            await loadBills() // Reload untuk update stats
        } catch (err) {
            console.error('Error deleting bill:', err)
            throw err
        }
    }

    return {
        bills,
        stats,
        loading,
        error,
        createBill,
        editBill,
        payBill,
        removeBill,
        refreshBills: loadBills
    }
}
