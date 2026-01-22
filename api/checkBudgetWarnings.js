/**
 * Vercel Serverless Function: Check Budget Warnings
 * 
 * Triggered by Vercel Cron twice daily at 12 PM & 6 PM Jakarta time.
 * Sends warning when budget category reaches 80% or more.
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
        console.error('[Budget Warnings] Unauthorized request')
        return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('[Budget Warnings] Starting job...')

    try {
        // Get current month
        const now = new Date()
        const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM
        
        // Get all users with financeEnabled
        const usersSnapshot = await db.collection('users')
            .where('settings.financeEnabled', '==', true)
            .get()

        if (usersSnapshot.empty) {
            console.log('[Budget Warnings] No users with finance enabled')
            return res.status(200).json({ sent: 0, message: 'No users to check' })
        }

        const notifications = []
        const errors = []

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id
            
            try {
                // Get user's budgets for current month
                const budgetsSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('budgets')
                    .where('month', '==', currentMonth)
                    .get()

                if (budgetsSnapshot.empty) continue

                // Get user's transactions for current month
                const transactionsSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('finance')
                    .where('type', '==', 'expense')
                    .where('date', '>=', `${currentMonth}-01`)
                    .where('date', '<=', `${currentMonth}-31`)
                    .get()

                // Calculate spending per category
                const spendingByCategory = {}
                transactionsSnapshot.docs.forEach(doc => {
                    const data = doc.data()
                    const category = data.category || 'Lainnya'
                    spendingByCategory[category] = (spendingByCategory[category] || 0) + data.amount
                })

                // Check each budget
                const warnings = []
                budgetsSnapshot.docs.forEach(doc => {
                    const budget = doc.data()
                    const category = budget.category
                    const limit = budget.amount
                    const spent = spendingByCategory[category] || 0
                    const percentage = (spent / limit) * 100

                    // Warning at 80%, 90%, 100%
                    if (percentage >= 80) {
                        warnings.push({
                            category,
                            percentage: Math.round(percentage),
                            spent,
                            limit,
                        })
                    }
                })

                if (warnings.length === 0) continue

                // Get user's FCM tokens
                const tokensSnapshot = await db.collection('users')
                    .doc(userId)
                    .collection('fcmTokens')
                    .get()

                if (tokensSnapshot.empty) continue

                const tokens = tokensSnapshot.docs.map(doc => doc.data().token)

                // Send warning for highest percentage category
                const highestWarning = warnings.sort((a, b) => b.percentage - a.percentage)[0]
                const emoji = highestWarning.percentage >= 100 ? '🚨' : '⚠️'

                const message = {
                    notification: {
                        title: `Budget Warning ${emoji}`,
                        body: `Budget ${highestWarning.category} sudah ${highestWarning.percentage}%`,
                    },
                    data: {
                        type: 'finance',
                        route: '/finance',
                        category: highestWarning.category,
                        timestamp: Date.now().toString(),
                    },
                    tokens: tokens,
                }

                const response = await messaging.sendEachForMulticast(message)
                console.log(`[Budget Warnings] Sent to user ${userId}: ${response.successCount} success`)
                
                notifications.push({
                    userId,
                    warning: highestWarning,
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
                console.error(`[Budget Warnings] Error processing user ${userId}:`, error)
                errors.push({ userId, error: error.message })
            }
        }

        console.log(`[Budget Warnings] Job completed. Sent: ${notifications.length}, Errors: ${errors.length}`)

        return res.status(200).json({
            success: true,
            sent: notifications.length,
            errors: errors.length,
            details: { notifications, errors },
        })

    } catch (error) {
        console.error('[Budget Warnings] Fatal error:', error)
        return res.status(500).json({ error: error.message })
    }
}
