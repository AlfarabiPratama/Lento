/**
 * Vercel Serverless Function: Send Habit Reminders via FCM
 * 
 * Triggered by Vercel Cron daily at 8 AM Jakarta time (1 AM UTC).
 * Security: Vercel Cron auto-inject user-agent + optional CRON_SECRET
 */

const admin = require('firebase-admin')

// Initialize Firebase Admin (singleton pattern for serverless)
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
        console.error('[Habit Reminders] Unauthorized request')
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        const now = admin.firestore.Timestamp.now()

        // Query scheduled jobs that are due
        const snapshot = await db
            .collection('habit_reminder_jobs')
            .where('scheduled_at', '<=', now)
            .where('status', '==', 'scheduled')
            .limit(100)
            .get()

        if (snapshot.empty) {
            return res.status(200).json({ sent: 0, message: 'No pending jobs' })
        }

        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        let sentCount = 0
        let errorCount = 0

        // Process each job
        for (const job of jobs) {
            try {
                // Get user's FCM tokens
                const tokensSnap = await db
                    .collection('fcm_tokens')
                    .where('userId', '==', job.user_id)
                    .get()

                const tokens = tokensSnap.docs.map(d => d.id)

                if (tokens.length === 0) {
                    // No tokens, mark as error
                    await db.collection('habit_reminder_jobs').doc(job.id).update({
                        status: 'error',
                        error: 'no_tokens',
                        updated_at: now,
                    })
                    errorCount++
                    continue
                }

                // Build FCM message
                const message = {
                    notification: {
                        title: job.title || '⏰ Pengingat Habit',
                        body: job.body || 'Waktunya check-in!',
                    },
                    data: {
                        route: job.route || '/habits',
                        habitId: job.habit_id || '',
                        tag: `habit-${job.habit_id}`,
                    },
                    tokens,
                }

                // Send multicast to all user devices
                const response = await messaging.sendEachForMulticast(message)

                // Handle invalid tokens
                const invalidTokens = []
                response.responses.forEach((r, idx) => {
                    if (!r.success) {
                        const errorCode = r.error?.code
                        if (errorCode === 'messaging/invalid-registration-token' ||
                            errorCode === 'messaging/registration-token-not-registered') {
                            invalidTokens.push(tokens[idx])
                        }
                    }
                })

                // Delete invalid tokens
                await Promise.all(
                    invalidTokens.map(t => db.collection('fcm_tokens').doc(t).delete())
                )

                // Mark job as sent
                await db.collection('habit_reminder_jobs').doc(job.id).update({
                    status: 'sent',
                    sent_at: now,
                    updated_at: now,
                    success_count: response.successCount,
                    failure_count: response.failureCount,
                })

                sentCount++

            } catch (jobError) {
                console.error(`Error processing job ${job.id}:`, jobError)
                await db.collection('habit_reminder_jobs').doc(job.id).update({
                    status: 'error',
                    error: jobError.message,
                    updated_at: now,
                })
                errorCount++
            }
        }

        return res.status(200).json({
            sent: sentCount,
            errors: errorCount,
            total: jobs.length,
            timestamp: new Date().toISOString(),
        })

    } catch (error) {
        console.error('sendHabitReminders error:', error)
        return res.status(500).json({ error: error.message })
    }
}
