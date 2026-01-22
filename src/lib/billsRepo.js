/**
 * Bills Repository
 * 
 * Manages bill data in Firestore
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Add new bill
 */
export async function addBill(userId, billData) {
    const billsRef = collection(db, 'bills')
    
    const newBill = {
        userId,
        name: billData.name,
        amount: parseFloat(billData.amount),
        dueDate: Timestamp.fromDate(new Date(billData.dueDate)),
        category: billData.category || 'utilities',
        recurring: billData.recurring || false,
        recurringInterval: billData.recurring ? (billData.recurringInterval || 'monthly') : null,
        status: 'pending',
        notificationsSent: {
            threeDays: false,
            oneDay: false
        },
        notes: billData.notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(billsRef, newBill)
    return { id: docRef.id, ...newBill }
}

/**
 * Get all bills for user
 */
export async function getUserBills(userId) {
    const billsRef = collection(db, 'bills')
    const q = query(
        billsRef,
        where('userId', '==', userId),
        orderBy('dueDate', 'asc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
}

/**
 * Get pending bills (not paid yet)
 */
export async function getPendingBills(userId) {
    const billsRef = collection(db, 'bills')
    const q = query(
        billsRef,
        where('userId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('dueDate', 'asc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
}

/**
 * Get single bill
 */
export async function getBill(billId) {
    const billDoc = await getDoc(doc(db, 'bills', billId))
    if (!billDoc.exists()) {
        throw new Error('Bill not found')
    }
    return { id: billDoc.id, ...billDoc.data() }
}

/**
 * Update bill
 */
export async function updateBill(billId, updates) {
    const billRef = doc(db, 'bills', billId)
    
    const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
    }
    
    // Handle dueDate conversion if provided
    if (updates.dueDate && typeof updates.dueDate === 'string') {
        updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate))
    }
    
    await updateDoc(billRef, updateData)
    return getBill(billId)
}

/**
 * Mark bill as paid
 */
export async function markBillAsPaid(billId, paidDate = new Date()) {
    const billRef = doc(db, 'bills', billId)
    
    await updateDoc(billRef, {
        status: 'paid',
        paidAt: Timestamp.fromDate(paidDate),
        updatedAt: serverTimestamp()
    })
    
    return getBill(billId)
}

/**
 * Delete bill
 */
export async function deleteBill(billId) {
    await deleteDoc(doc(db, 'bills', billId))
}

/**
 * Get overdue bills
 */
export async function getOverdueBills(userId) {
    const now = Timestamp.now()
    const billsRef = collection(db, 'bills')
    const q = query(
        billsRef,
        where('userId', '==', userId),
        where('status', '==', 'pending'),
        where('dueDate', '<', now)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
}

/**
 * Get bills due this month
 */
export async function getBillsDueThisMonth(userId) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    
    const billsRef = collection(db, 'bills')
    const q = query(
        billsRef,
        where('userId', '==', userId),
        where('status', '==', 'pending'),
        where('dueDate', '>=', Timestamp.fromDate(startOfMonth)),
        where('dueDate', '<=', Timestamp.fromDate(endOfMonth)),
        orderBy('dueDate', 'asc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
}

/**
 * Get bill statistics
 */
export async function getBillStats(userId) {
    const bills = await getUserBills(userId)
    const now = new Date()
    
    const pending = bills.filter(b => b.status === 'pending')
    const overdue = pending.filter(b => b.dueDate.toDate() < now)
    const dueThisWeek = pending.filter(b => {
        const dueDate = b.dueDate.toDate()
        const weekFromNow = new Date(now)
        weekFromNow.setDate(now.getDate() + 7)
        return dueDate >= now && dueDate <= weekFromNow
    })
    
    const totalPending = pending.reduce((sum, b) => sum + b.amount, 0)
    const totalOverdue = overdue.reduce((sum, b) => sum + b.amount, 0)
    
    return {
        totalBills: bills.length,
        pendingCount: pending.length,
        overdueCount: overdue.length,
        dueThisWeekCount: dueThisWeek.length,
        totalPendingAmount: totalPending,
        totalOverdueAmount: totalOverdue
    }
}
