/**
 * Vercel Serverless Function: Send Weekly Summary
 * 
 * Triggered by Vercel Cron every Sunday at 7 PM Jakarta time (12 PM UTC).
 * Sends weekly stats summary to users.
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin
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

module.exports = async function handler(req, res) {
    // Security: Verify Vercel Cron or authorized requests
    const isVercelCron = req.headers['user-agent']?.includes('vercel-cron')
    const hasSecret = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isVercelCron && !hasSecret) {
        console.error('[Weekly Summary] Unauthorized request')
        return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('[Weekly Summary] Starting job...')

    try {
        // Get last 7 days range
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const startDate = sevenDaysAgo.toISOString().split('T')[0]
        const endDate = now.toISOString().split('T')[0]
        
        // Get all users with notifications enabled
        const usersSnapshot = await db.collection('users')
            .where('settings.notificationsEnabled', '==', true)
            .get()

        if (usersSnapshot.empty) {
            console.log('[Weekly Summary] No users with notifications enabled')
            return res.status(200).json({ sent: 0, message: 'No users to notify' })
        }

        const notifications = []
        const errors = []

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id
            
            try {
                // Calculate weekly stats
                const stats = {
                    habits: 0,
                    journals: 0,
                    focusMinutes: 0,
                    booksRead: 0,
                }

                // Habits completed
                const checkinsSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('checkins')
                    .where('date', '>=', startDate)
                    .where('date', '<=', endDate)
                    .get()
                stats.habits = checkinsSnapshot.size

                // Journals written
                const journalsSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('journals')
                    .where('date', '>=', startDate)
                    .where('date', '<=', endDate)
                    .get()
                stats.journals = journalsSnapshot.size

                // Focus sessions
                const pomodoroSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('pomodoro')
                    .where('date', '>=', startDate)
                    .where('date', '<=', endDate)
                    .get()
                pomodoroSnapshot.docs.forEach(doc => {
                    const data = doc.data()
                    stats.focusMinutes += data.duration || 25
                })

                // Books read
                const sessionsSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('bookSessions')
                    .where('date', '>=', startDate)
                    .where('date', '<=', endDate)
                    .get()
                const uniqueBooks = new Set()
                sessionsSnapshot.docs.forEach(doc => {
                    uniqueBooks.add(doc.data().bookId)
                })
                stats.booksRead = uniqueBooks.size

                // Skip if no activity
                if (stats.habits === 0 && stats.journals === 0 && stats.focusMinutes === 0) {
                    continue
                }

                // Get user's FCM tokens
                const tokensSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('fcmTokens')
                    .get()

                if (tokensSnapshot.empty) continue

                const tokens = tokensSnapshot.docs.map(doc => doc.data().token)

                // Build summary message
                const highlights = []
                if (stats.habits > 0) highlights.push(`${stats.habits} habits`)
                if (stats.journals > 0) highlights.push(`${stats.journals} jurnal`)
                if (stats.focusMinutes > 0) highlights.push(`${stats.focusMinutes} menit fokus`)
                if (stats.booksRead > 0) highlights.push(`${stats.booksRead} buku`)

                const message = {
                    notification: {
                        title: 'Ringkasan Minggu Ini 📊',
                        body: `Kamu sudah: ${highlights.join(', ')}. Lanjutkan!`,
                    },
                    data: {
                        type: 'stats',
                        route: '/stats',
                        timestamp: Date.now().toString(),
                    },
                    tokens: tokens,
                }

                const response = await messaging.sendEachForMulticast(message)
                console.log(`[Weekly Summary] Sent to user ${userId}: ${response.successCount} success`)
                
                notifications.push({
                    userId,
                    stats,
                    success: response.successCount,
                })

                // Clean up invalid tokens
                const failedTokens = []
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx])
                    }
                })

                if (failedTokens.length > 0) {
                    const batch = db.batch()
                    for (const token of failedTokens) {
                        const tokenDocs = await db.collection('users')
                            .doc(userId)
                            .collection('fcmTokens')
                            .where('token', '==', token)
                            .get()
                        
                        tokenDocs.docs.forEach(doc => batch.delete(doc.ref))
                    }
                    await batch.commit()
                }

            } catch (error) {
                console.error(`[Weekly Summary] Error processing user ${userId}:`, error)
                errors.push({ userId, error: error.message })
            }
        }

        console.log(`[Weekly Summary] Job completed. Sent: ${notifications.length}, Errors: ${errors.length}`)

        return res.status(200).json({
            success: true,
            sent: notifications.length,
            errors: errors.length,
            details: { notifications, errors },
        })

    } catch (error) {
        console.error('[Weekly Summary] Fatal error:', error)
        return res.status(500).json({ error: error.message })
    }
}
