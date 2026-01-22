/**
 * Reminder Jobs - Manage habit reminder jobs in Firestore
 * 
 * Creates scheduled jobs for server-side push notifications (Phase 3).
 * Jobs are processed by the Vercel cron function.
 */

import { auth, db, collection, doc, setDoc, getDocs, query, where, serverTimestamp } from './firebase'

const JOBS_COLLECTION = 'habit_reminder_jobs'

/**
 * Generate reminder jobs for a habit for the next N days
 * Call this when creating/updating a habit with reminder enabled
 */
export async function generateReminderJobs(habit, daysAhead = 7) {
    if (!db || !auth?.currentUser) {
        console.warn('Cannot generate jobs: not authenticated')
        return
    }

    if (!habit.reminder_enabled || !habit.reminder_time) {
        return
    }

    const userId = auth.currentUser.uid
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Parse reminder time "HH:MM"
    const [hours, minutes] = habit.reminder_time.split(':').map(Number)

    // Determine which days to schedule
    const reminderDays = (habit.reminder_days && habit.reminder_days.length > 0)
        ? habit.reminder_days
        : habit.target_days || [0, 1, 2, 3, 4, 5, 6] // Default: every day

    const jobs = []
    const now = new Date()

    // Generate jobs for next N days
    for (let i = 0; i < daysAhead; i++) {
        const targetDate = new Date(now)
        targetDate.setDate(now.getDate() + i)

        const dayOfWeek = targetDate.getDay()

        // Skip if not a reminder day
        if (!reminderDays.includes(dayOfWeek)) continue

        // Set the time
        targetDate.setHours(hours, minutes, 0, 0)

        // Skip if in the past
        if (targetDate <= now) continue

        // Create job document
        const jobId = `${habit.id}_${targetDate.toISOString().split('T')[0]}`

        const job = {
            user_id: userId,
            habit_id: habit.id,
            scheduled_at: targetDate,
            status: 'scheduled',
            title: `⏰ ${habit.name}`,
            body: habit.description || 'Waktunya check-in habit ini!',
            route: '/habits',
            timezone,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        }

        jobs.push({ id: jobId, data: job })
    }

    // Batch write jobs to Firestore
    try {
        await Promise.all(
            jobs.map(job =>
                setDoc(doc(db, JOBS_COLLECTION, job.id), job.data, { merge: true })
            )
        )
        console.log(`Generated ${jobs.length} reminder jobs for habit ${habit.id}`)
    } catch (error) {
        console.error('Failed to generate reminder jobs:', error)
    }
}

/**
 * Cancel all pending jobs for a habit
 * Call this when deleting a habit or disabling reminder
 */
export async function cancelReminderJobs(habitId) {
    if (!db || !auth?.currentUser) return

    try {
        const { deleteDoc } = await import('firebase/firestore')

        // Query all scheduled jobs for this habit
        const q = query(
            collection(db, JOBS_COLLECTION),
            where('habit_id', '==', habitId),
            where('status', '==', 'scheduled')
        )

        const snapshot = await getDocs(q)

        // Delete all pending jobs
        await Promise.all(
            snapshot.docs.map(docSnap => deleteDoc(docSnap.ref))
        )

        console.log(`Cancelled ${snapshot.size} pending jobs for habit ${habitId}`)
    } catch (error) {
        console.error('Failed to cancel reminder jobs:', error)
    }
}

/**
 * Refresh jobs for a habit (cancel old + generate new)
 * Call this when updating habit reminder settings
 */
export async function refreshReminderJobs(habit) {
    await cancelReminderJobs(habit.id)

    if (habit.reminder_enabled && habit.reminder_time) {
        await generateReminderJobs(habit)
    }
}
