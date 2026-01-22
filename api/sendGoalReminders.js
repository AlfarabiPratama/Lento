/**
 * Send Goal Milestone Reminders - Vercel Serverless Function
 * 
 * Triggered by cron: Daily at 10:00 UTC (17:00 WIB)
 * 
 * Detects goals approaching deadline and sends motivational reminders:
 * - 7 days before deadline
 * - 3 days before deadline  
 * - 1 day before deadline
 * 
 * Uses Firestore for:
 * - User FCM tokens (fcm_tokens collection)
 * - Goals data (users/{uid}/goals collection)
 * - Notification settings (notification_settings collection)
 * - Notification logs (notificationLogs collection)
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })
}

const db = admin.firestore()
const messaging = admin.messaging()

/**
 * Check if current time is within user's quiet hours
 */
function isQuietHours(quietHoursConfig) {
    if (!quietHoursConfig?.enabled) return false

    const now = new Date()
    const currentHour = now.getUTCHours() + 7 // Convert to WIB (UTC+7)
    const currentMinutes = now.getUTCMinutes()
    const currentTime = currentHour * 60 + currentMinutes

    const [startHour, startMin] = quietHoursConfig.startTime.split(':').map(Number)
    const [endHour, endMin] = quietHoursConfig.endTime.split(':').map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime
    }

    return currentTime >= startTime && currentTime <= endTime
}

/**
 * Calculate days until deadline
 */
function getDaysUntilDeadline(deadline) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    const diffTime = deadlineDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get motivational message based on days remaining
 */
function getMotivationalMessage(goal, daysUntil) {
    const title = goal.title || 'Target'
    const type = goal.type || 'savings'

    if (daysUntil === 7) {
        return {
            title: `${title} - 1 Minggu Lagi!`,
            body: `Tetap semangat! ${title} akan jatuh tempo dalam 7 hari. Kamu bisa mencapainya! 💪`,
        }
    } else if (daysUntil === 3) {
        return {
            title: `${title} - 3 Hari Lagi!`,
            body: `Waktu tinggal 3 hari untuk ${title}. Sprint terakhir, kamu pasti bisa! 🎯`,
        }
    } else if (daysUntil === 1) {
        return {
            title: `${title} - Besok Deadline!`,
            body: `${title} akan jatuh tempo besok. Ayo selesaikan dengan baik! 🏁`,
        }
    }

    return null
}

/**
 * Send goal reminder to user
 */
async function sendGoalReminder(userId, goal, daysUntil) {
    try {
        // Get user's FCM tokens
        const tokensSnapshot = await db.collection('fcm_tokens')
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .get()

        if (tokensSnapshot.empty) {
            console.log(`No active FCM tokens for user ${userId}`)
            return { success: false, reason: 'no_tokens' }
        }

        const tokens = tokensSnapshot.docs.map(doc => doc.data().token)

        // Get notification message
        const message = getMotivationalMessage(goal, daysUntil)
        if (!message) {
            return { success: false, reason: 'invalid_days' }
        }

        // Send multicast notification
        const multicastMessage = {
            tokens,
            notification: {
                title: message.title,
                body: message.body,
            },
            data: {
                type: 'goal_milestone',
                goalId: goal.id,
                daysUntil: daysUntil.toString(),
                route: '/goals',
            },
        }

        const response = await messaging.sendEachForMulticast(multicastMessage)

        // Log notification
        await db.collection('notificationLogs').add({
            userId,
            type: 'goal_milestone',
            title: message.title,
            body: message.body,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            openedAt: null,
            dismissedAt: null,
            metadata: {
                goalId: goal.id,
                goalTitle: goal.title,
                daysUntil,
                deadline: goal.deadline,
            },
        })

        // Handle invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens = []
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    invalidTokens.push(tokens[idx])
                }
            })

            // Mark invalid tokens
            for (const token of invalidTokens) {
                const tokenDoc = tokensSnapshot.docs.find(doc => doc.data().token === token)
                if (tokenDoc) {
                    await tokenDoc.ref.update({ status: 'invalid' })
                }
            }
        }

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
        }
    } catch (error) {
        console.error(`Failed to send goal reminder for user ${userId}:`, error)
        return { success: false, error: error.message }
    }
}

/**
 * Main handler
 */
module.exports = async (req, res) => {
    // Verify cron secret or Vercel cron user-agent
    const authHeader = req.headers.authorization
    const isVercelCron = req.headers['user-agent']?.includes('vercel-cron')

    if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        console.log('Starting goal milestone reminders check...')

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Calculate target dates (7, 3, 1 days from today)
        const targetDates = [7, 3, 1].map(days => {
            const targetDate = new Date(today)
            targetDate.setDate(targetDate.getDate() + days)
            return targetDate.toISOString().split('T')[0] // YYYY-MM-DD
        })

        console.log('Target deadlines:', targetDates)

        // Get all users to check their goals
        const usersSnapshot = await db.collection('users').listDocuments()

        let totalSent = 0
        let totalSkipped = 0

        for (const userDocRef of usersSnapshot) {
            const userId = userDocRef.id

            try {
                // Check notification settings
                const settingsDoc = await db.collection('notification_settings').doc(userId).get()
                const settings = settingsDoc.exists ? settingsDoc.data() : {}

                // Skip if goal reminders disabled
                if (settings.goalReminders?.enabled === false) {
                    console.log(`Goal reminders disabled for user ${userId}`)
                    continue
                }

                // Check quiet hours
                if (isQuietHours(settings.quietHours)) {
                    console.log(`User ${userId} in quiet hours, skipping`)
                    totalSkipped++
                    continue
                }

                // Get active goals with deadlines approaching
                const goalsSnapshot = await db.collection('users').doc(userId).collection('goals')
                    .where('status', '==', 'active')
                    .get()

                if (goalsSnapshot.empty) {
                    console.log(`No active goals for user ${userId}`)
                    continue
                }

                const goals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

                // Check each goal's deadline
                for (const goal of goals) {
                    if (!goal.deadline) continue

                    const daysUntil = getDaysUntilDeadline(goal.deadline)

                    // Send reminder if approaching milestone
                    if ([7, 3, 1].includes(daysUntil)) {
                        // Check individual milestone settings
                        if (daysUntil === 7 && settings.goalReminders?.sevenDayBefore === false) continue
                        if (daysUntil === 3 && settings.goalReminders?.threeDayBefore === false) continue
                        if (daysUntil === 1 && settings.goalReminders?.oneDayBefore === false) continue

                        console.log(`Sending reminder for goal "${goal.title}" (${daysUntil} days) to user ${userId}`)
                        const result = await sendGoalReminder(userId, goal, daysUntil)

                        if (result.success) {
                            totalSent += result.successCount || 1
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing user ${userId}:`, error)
            }
        }

        console.log(`Goal milestone reminders complete: ${totalSent} sent, ${totalSkipped} skipped`)

        return res.status(200).json({
            success: true,
            sent: totalSent,
            skipped: totalSkipped,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Goal reminders cron failed:', error)
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        })
    }
}
