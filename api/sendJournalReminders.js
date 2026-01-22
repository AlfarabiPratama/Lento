/**
 * Vercel Serverless Function: Send Journal Reminders via FCM
 * 
 * Triggered by Vercel Cron daily at 9 PM Jakarta time (2 PM UTC).
 * Sends reminder to users who haven't written journal today.
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin (reuse existing connection)
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
        console.error('[Journal Reminders] Unauthorized request')
        return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('[Journal Reminders] Starting job...')

    try {
        // Get current date (Jakarta timezone)
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
        
        // Get all users with journalEnabled
        const usersSnapshot = await db.collection('users')
            .where('settings.journalEnabled', '==', true)
            .get()

        if (usersSnapshot.empty) {
            console.log('[Journal Reminders] No users with journal enabled')
            return res.status(200).json({ sent: 0, message: 'No users to notify' })
        }

        const notifications = []
        const errors = []

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id
            
            try {
                // Check if user has written journal today
                const journalSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('journals')
                    .where('date', '==', today)
                    .limit(1)
                    .get()

                if (!journalSnapshot.empty) {
                    console.log(`[Journal Reminders] User ${userId} already wrote journal today`)
                    continue
                }

                // Get user's FCM tokens
                const tokensSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('fcmTokens')
                    .get()

                if (tokensSnapshot.empty) {
                    console.log(`[Journal Reminders] User ${userId} has no FCM tokens`)
                    continue
                }

                const tokens = tokensSnapshot.docs.map(doc => doc.data().token)

                // Add random offset ±5 minutes for battery efficiency
                const randomOffset = Math.floor(Math.random() * 10) - 5
                setTimeout(async () => {
                    // Send notification
                    const message = {
                        notification: {
                            title: 'Refleksi Hari Ini 📝',
                            body: 'Luangkan 1 menit untuk menulis jurnal hari ini',
                        },
                        data: {
                            type: 'journal',
                            route: '/journal',
                            timestamp: Date.now().toString(),
                        },
                        tokens: tokens,
                    }

                    try {
                        const response = await messaging.sendEachForMulticast(message)
                        console.log(`[Journal Reminders] Sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failed`)
                        
                        notifications.push({
                            userId,
                            success: response.successCount,
                            failed: response.failureCount,
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
                        console.error(`[Journal Reminders] Error sending to user ${userId}:`, error)
                        errors.push({ userId, error: error.message })
                    }
                }, randomOffset * 60 * 1000) // Convert to milliseconds

            } catch (error) {
                console.error(`[Journal Reminders] Error processing user ${userId}:`, error)
                errors.push({ userId, error: error.message })
            }
        }

        console.log(`[Journal Reminders] Job completed. Sent: ${notifications.length}, Errors: ${errors.length}`)

        return res.status(200).json({
            success: true,
            sent: notifications.length,
            errors: errors.length,
            details: { notifications, errors },
        })

    } catch (error) {
        console.error('[Journal Reminders] Fatal error:', error)
        return res.status(500).json({ error: error.message })
    }
}
