/**
 * Vercel Serverless Function: Send Bill Payment Reminders
 * 
 * Triggered by Vercel Cron daily at 4 PM Jakarta time (9 AM UTC)
 * Sends reminders 3 days and 1 day before bill due date
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

module.exports = async function handler(req, res) {
    // Security: Verify Vercel Cron or authorized requests
    const isVercelCron = req.headers['user-agent']?.includes('vercel-cron')
    const hasSecret = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isVercelCron && !hasSecret) {
        console.error('[Bill Reminders] Unauthorized request')
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        const now = new Date()
        const nowTimestamp = admin.firestore.Timestamp.now()
        
        // Calculate date ranges
        const threeDaysFromNow = new Date(now)
        threeDaysFromNow.setDate(now.getDate() + 3)
        threeDaysFromNow.setHours(23, 59, 59, 999)
        
        const threeDaysStart = new Date(now)
        threeDaysStart.setDate(now.getDate() + 3)
        threeDaysStart.setHours(0, 0, 0, 0)
        
        const oneDayFromNow = new Date(now)
        oneDayFromNow.setDate(now.getDate() + 1)
        oneDayFromNow.setHours(23, 59, 59, 999)
        
        const oneDayStart = new Date(now)
        oneDayStart.setDate(now.getDate() + 1)
        oneDayStart.setHours(0, 0, 0, 0)

        let notificationsSent = []

        // Query bills due in 3 days (haven't sent 3-day reminder yet)
        const billsIn3Days = await db.collection('bills')
            .where('status', '==', 'pending')
            .where('dueDate', '>=', admin.firestore.Timestamp.fromDate(threeDaysStart))
            .where('dueDate', '<=', admin.firestore.Timestamp.fromDate(threeDaysFromNow))
            .get()

        // Filter bills that haven't received 3-day reminder
        const bills3DaysPending = billsIn3Days.docs.filter(doc => {
            const data = doc.data()
            return !data.notificationsSent?.threeDays
        })

        // Query bills due in 1 day (haven't sent 1-day reminder yet)
        const billsIn1Day = await db.collection('bills')
            .where('status', '==', 'pending')
            .where('dueDate', '>=', admin.firestore.Timestamp.fromDate(oneDayStart))
            .where('dueDate', '<=', admin.firestore.Timestamp.fromDate(oneDayFromNow))
            .get()

        // Filter bills that haven't received 1-day reminder
        const bills1DayPending = billsIn1Day.docs.filter(doc => {
            const data = doc.data()
            return !data.notificationsSent?.oneDay
        })

        // Process 3-day reminders
        for (const doc of bills3DaysPending) {
            const bill = doc.data()
            const result = await sendBillReminder(doc.id, bill, '3 hari', nowTimestamp)
            if (result.success) {
                notificationsSent.push(result)
                // Mark as sent
                await doc.ref.update({
                    'notificationsSent.threeDays': true,
                    'notificationsSent.threeDaysAt': nowTimestamp
                })
            }
        }

        // Process 1-day reminders
        for (const doc of bills1DayPending) {
            const bill = doc.data()
            const result = await sendBillReminder(doc.id, bill, 'besok', nowTimestamp)
            if (result.success) {
                notificationsSent.push(result)
                // Mark as sent
                await doc.ref.update({
                    'notificationsSent.oneDay': true,
                    'notificationsSent.oneDayAt': nowTimestamp
                })
            }
        }

        return res.status(200).json({
            success: true,
            sent: notificationsSent.length,
            threeDayReminders: bills3DaysPending.length,
            oneDayReminders: bills1DayPending.length,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Bill Reminders] Error:', error)
        return res.status(500).json({ error: error.message })
    }
}

/**
 * Send bill reminder notification to user
 */
async function sendBillReminder(billId, bill, timing, nowTimestamp) {
    try {
        // Get user preferences
        const userDoc = await db.collection('users').doc(bill.userId).get()
        const user = userDoc.data()

        // Check if bill reminders are enabled
        if (!user?.notificationPreferences?.billReminders?.enabled) {
            return { success: false, reason: 'Bill reminders disabled', billId }
        }

        // Check specific timing preference
        if (timing === '3 hari' && !user.notificationPreferences.billReminders?.threeDaysBeforeEnabled) {
            return { success: false, reason: '3-day reminder disabled', billId }
        }
        if (timing === 'besok' && !user.notificationPreferences.billReminders?.oneDayBeforeEnabled) {
            return { success: false, reason: '1-day reminder disabled', billId }
        }

        // Check quiet hours
        if (isQuietHours(user.quietHours)) {
            return { success: false, reason: 'Quiet hours', billId }
        }

        // Get user's FCM tokens
        const tokensSnap = await db.collection('fcm_tokens')
            .where('userId', '==', bill.userId)
            .get()

        if (tokensSnap.empty) {
            return { success: false, reason: 'No FCM tokens', billId }
        }

        const tokens = tokensSnap.docs.map(d => d.data().token)

        // Format amount
        const formattedAmount = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(bill.amount)

        // Positive framing message
        const title = timing === '3 hari'
            ? `💰 Reminder: ${bill.name}`
            : `⏰ ${bill.name} jatuh tempo besok`

        const body = timing === '3 hari'
            ? `${formattedAmount} akan jatuh tempo ${timing} lagi. Siapkan dana sekarang untuk tetap on-track! 💪`
            : `${formattedAmount} jatuh tempo besok. Tap untuk bayar sekarang.`

        // Send multicast FCM notification
        const response = await messaging.sendEachForMulticast({
            tokens,
            notification: { title, body },
            data: {
                type: 'bill_reminder',
                billId: billId,
                timing: timing,
                amount: bill.amount.toString(),
                route: '/finance?tab=bills'
            },
            android: {
                priority: 'high',
                notification: { channelId: 'bill_reminders' }
            },
            webpush: {
                notification: {
                    icon: '/icon-192x192.png',
                    requireInteraction: true,
                    tag: `bill_${billId}`,
                    badge: '/badge-72x72.png'
                },
                fcmOptions: {
                    link: `/finance?tab=bills&billId=${billId}`
                }
            }
        })

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
            invalidTokens.map(token => db.collection('fcm_tokens').doc(token).delete())
        )

        // Log notification
        await db.collection('notificationLogs').add({
            userId: bill.userId,
            type: 'bill_reminder',
            billId: billId,
            timing: timing,
            sentAt: nowTimestamp,
            status: 'sent',
            successCount: response.successCount,
            failureCount: response.failureCount
        })

        return {
            success: true,
            billId,
            userId: bill.userId,
            successCount: response.successCount,
            failureCount: response.failureCount
        }

    } catch (error) {
        console.error(`[Bill Reminders] Error sending for bill ${billId}:`, error)
        return { success: false, error: error.message, billId }
    }
}

/**
 * Check if current time is in user's quiet hours
 */
function isQuietHours(quietHours) {
    if (!quietHours?.enabled) return false

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const [startHour, startMinute] = quietHours.start.split(':').map(Number)
    const startTime = startHour * 60 + startMinute

    const [endHour, endMinute] = quietHours.end.split(':').map(Number)
    const endTime = endHour * 60 + endMinute

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime
    }

    return currentTime >= startTime && currentTime <= endTime
}
