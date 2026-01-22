/**
 * Send Reading Streak Reminders - Vercel Serverless Function
 * 
 * Triggered by cron: Daily at 20:00 UTC (03:00 WIB next day - early morning)
 * 
 * Tracks reading streaks and sends motivational notifications:
 * - Encouragement for active streaks (3+ days)
 * - Re-engagement for broken streaks (missed 1 day)
 * - Milestone celebrations (7, 14, 30 days)
 * 
 * Uses Firestore for:
 * - User FCM tokens (fcm_tokens collection)
 * - Book sessions (users/{uid}/book_sessions collection)
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
 * Get day key (YYYY-MM-DD) for a date
 */
function getDayKey(date) {
    return date.toISOString().split('T')[0]
}

/**
 * Calculate reading streak from book sessions
 * Returns { currentStreak, longestStreak, lastReadDate, missedYesterday }
 */
function calculateReadingStreak(sessions) {
    if (!sessions || sessions.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastReadDate: null, missedYesterday: false }
    }

    // Sort by date descending
    const sortedSessions = [...sessions].sort((a, b) => 
        new Date(b.dayKey) - new Date(a.dayKey)
    )

    // Group by day
    const dayMap = new Map()
    sortedSessions.forEach(session => {
        dayMap.set(session.dayKey, true)
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayKey = getDayKey(today)
    const yesterdayKey = getDayKey(yesterday)

    const lastReadDate = sortedSessions[0].dayKey
    const missedYesterday = lastReadDate < yesterdayKey

    // Calculate current streak
    let currentStreak = 0
    let checkDate = new Date(today)
    
    // Start from today or yesterday
    if (!dayMap.has(todayKey)) {
        checkDate = yesterday
    }

    while (true) {
        const checkKey = getDayKey(checkDate)
        if (dayMap.has(checkKey)) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
        } else {
            break
        }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    const uniqueDays = Array.from(dayMap.keys()).sort().reverse()

    for (let i = 0; i < uniqueDays.length; i++) {
        if (i === 0) {
            tempStreak = 1
        } else {
            const prevDate = new Date(uniqueDays[i - 1])
            const currDate = new Date(uniqueDays[i])
            const diffDays = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                tempStreak++
            } else {
                longestStreak = Math.max(longestStreak, tempStreak)
                tempStreak = 1
            }
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { currentStreak, longestStreak, lastReadDate, missedYesterday }
}

/**
 * Get streak message based on streak status
 */
function getStreakMessage(streakData) {
    const { currentStreak, missedYesterday } = streakData

    // Broken streak - re-engagement
    if (missedYesterday && currentStreak === 0) {
        return {
            type: 're-engagement',
            title: '📚 Kangen Baca?',
            body: 'Kemarin kamu skip baca. Yuk mulai lagi hari ini! Streak baru dimulai dari sekarang.',
        }
    }

    // Active streak - encouragement
    if (currentStreak >= 3) {
        // Milestone celebrations
        if (currentStreak === 7) {
            return {
                type: 'milestone',
                title: '🎉 Seminggu Streak!',
                body: '7 hari berturut-turut! Kamu luar biasa. Pertahankan momentum ini! 🔥',
            }
        } else if (currentStreak === 14) {
            return {
                type: 'milestone',
                title: '🏆 2 Minggu Streak!',
                body: '14 hari konsisten! Kebiasaan membaca sudah terbentuk. Keep going!',
            }
        } else if (currentStreak === 30) {
            return {
                type: 'milestone',
                title: '👑 Sebulan Streak!',
                body: '30 hari luar biasa! Kamu sudah jadi pembaca sejati. Proud of you! 📚✨',
            }
        } else if (currentStreak % 10 === 0) {
            return {
                type: 'milestone',
                title: `🔥 ${currentStreak} Hari Streak!`,
                body: `${currentStreak} hari konsisten! Pencapaian yang menginspirasi. Terus lanjutkan!`,
            }
        }

        // Regular encouragement
        return {
            type: 'encouragement',
            title: `🔥 ${currentStreak} Hari Streak!`,
            body: `Kamu sudah baca ${currentStreak} hari berturut-turut! Jangan sampai putus ya!`,
        }
    }

    return null
}

/**
 * Send streak notification to user
 */
async function sendStreakNotification(userId, streakData) {
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

        // Get streak message
        const message = getStreakMessage(streakData)
        if (!message) {
            return { success: false, reason: 'no_message' }
        }

        // Send multicast notification
        const multicastMessage = {
            tokens,
            notification: {
                title: message.title,
                body: message.body,
            },
            data: {
                type: 'reading_streak',
                streakType: message.type,
                currentStreak: streakData.currentStreak.toString(),
                route: '/books',
            },
        }

        const response = await messaging.sendEachForMulticast(multicastMessage)

        // Log notification
        await db.collection('notificationLogs').add({
            userId,
            type: 'reading_streak',
            title: message.title,
            body: message.body,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            openedAt: null,
            dismissedAt: null,
            metadata: {
                streakType: message.type,
                currentStreak: streakData.currentStreak,
                longestStreak: streakData.longestStreak,
                lastReadDate: streakData.lastReadDate,
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
        console.error(`Failed to send streak notification for user ${userId}:`, error)
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
        console.log('Starting reading streak reminders check...')

        // Get all users
        const usersSnapshot = await db.collection('users').listDocuments()

        let totalSent = 0
        let totalSkipped = 0

        for (const userDocRef of usersSnapshot) {
            const userId = userDocRef.id

            try {
                // Check notification settings
                const settingsDoc = await db.collection('notification_settings').doc(userId).get()
                const settings = settingsDoc.exists ? settingsDoc.data() : {}

                // Skip if reading streak reminders disabled
                if (settings.readingStreakReminders?.enabled === false) {
                    console.log(`Reading streak reminders disabled for user ${userId}`)
                    continue
                }

                // Check quiet hours
                if (isQuietHours(settings.quietHours)) {
                    console.log(`User ${userId} in quiet hours, skipping`)
                    totalSkipped++
                    continue
                }

                // Get user's book sessions (last 60 days for streak calculation)
                const sixtyDaysAgo = new Date()
                sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
                const sixtyDaysAgoKey = getDayKey(sixtyDaysAgo)

                const sessionsSnapshot = await db.collection('users').doc(userId).collection('book_sessions')
                    .where('dayKey', '>=', sixtyDaysAgoKey)
                    .get()

                if (sessionsSnapshot.empty) {
                    console.log(`No reading sessions for user ${userId}`)
                    continue
                }

                const sessions = sessionsSnapshot.docs.map(doc => doc.data())

                // Calculate streak
                const streakData = calculateReadingStreak(sessions)

                console.log(`User ${userId} streak:`, streakData)

                // Check if should send notification
                const shouldSend = (
                    (streakData.currentStreak >= 3) || // Active streak
                    (streakData.missedYesterday && streakData.currentStreak === 0) // Broken streak
                )

                if (!shouldSend) {
                    console.log(`No notification needed for user ${userId}`)
                    continue
                }

                // Check specific notification type settings
                const message = getStreakMessage(streakData)
                if (!message) continue

                if (message.type === 're-engagement' && settings.readingStreakReminders?.reEngagement === false) {
                    continue
                }
                if (message.type === 'encouragement' && settings.readingStreakReminders?.encouragement === false) {
                    continue
                }
                if (message.type === 'milestone' && settings.readingStreakReminders?.milestones === false) {
                    continue
                }

                console.log(`Sending ${message.type} streak notification to user ${userId}`)
                const result = await sendStreakNotification(userId, streakData)

                if (result.success) {
                    totalSent += result.successCount || 1
                }
            } catch (error) {
                console.error(`Error processing user ${userId}:`, error)
            }
        }

        console.log(`Reading streak reminders complete: ${totalSent} sent, ${totalSkipped} skipped`)

        return res.status(200).json({
            success: true,
            sent: totalSent,
            skipped: totalSkipped,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Reading streak reminders cron failed:', error)
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        })
    }
}
