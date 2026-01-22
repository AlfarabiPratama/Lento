/**
 * Backend Helper: Send Push Notification
 * 
 * Untuk Cloud Function atau API endpoint yang akan trigger notifications
 * ke user devices via FCM
 */

// ==================== Node.js Backend (Firebase Cloud Functions) ====================

/**
 * Example Cloud Function untuk send notification
 * Deploy via: firebase deploy --only functions
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin
admin.initializeApp()

/**
 * Send notification to specific user
 */
exports.sendNotificationToUser = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { userId, notification } = data

  try {
    // Get user's FCM tokens from Firestore
    const tokensSnapshot = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('fcmTokens')
      .get()

    if (tokensSnapshot.empty) {
      console.log('No FCM tokens found for user:', userId)
      return { success: false, message: 'No tokens found' }
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token)

    // Prepare FCM message
    const message = {
      notification: {
        title: notification.title || 'Lento',
        body: notification.body || ''
      },
      data: {
        type: notification.type || 'general',
        route: notification.route || '/',
        entityId: notification.entityId || '',
        timestamp: Date.now().toString()
      },
      tokens: tokens
    }

    // Send to all user's devices
    const response = await admin.messaging().sendMulticast(message)

    console.log('Notification sent:', response.successCount, 'success,', response.failureCount, 'failed')

    // Clean up invalid tokens
    const failedTokens = []
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx])
      }
    })

    // Remove invalid tokens from Firestore
    if (failedTokens.length > 0) {
      const batch = admin.firestore().batch()
      for (const token of failedTokens) {
        const tokenDoc = await admin.firestore()
          .collection('users')
          .doc(userId)
          .collection('fcmTokens')
          .where('token', '==', token)
          .get()
        
        tokenDoc.docs.forEach(doc => {
          batch.delete(doc.ref)
        })
      }
      await batch.commit()
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

/**
 * Scheduled function: Send daily habit reminders
 * Runs every day at 8 AM
 */
exports.sendDailyHabitReminders = functions.pubsub
  .schedule('0 8 * * *') // Cron: 8 AM every day
  .timeZone('Asia/Jakarta')
  .onRun(async (context) => {
    console.log('Starting daily habit reminders...')

    try {
      // Get all users who have habits enabled
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('settings.habitsEnabled', '==', true)
        .get()

      const promises = []

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id
        
        // Get user's habits for today
        const habitsSnapshot = await admin.firestore()
          .collection('users')
          .doc(userId)
          .collection('habits')
          .where('active', '==', true)
          .get()

        if (habitsSnapshot.empty) continue

        // Check if user has unchecked habits
        const today = new Date().toISOString().split('T')[0]
        const checkinsSnapshot = await admin.firestore()
          .collection('users')
          .doc(userId)
          .collection('checkins')
          .where('date', '==', today)
          .get()

        const checkedHabitIds = checkinsSnapshot.docs.map(doc => doc.data().habitId)
        const uncheckedCount = habitsSnapshot.size - checkedHabitIds.length

        if (uncheckedCount > 0) {
          // Send reminder
          const notification = {
            title: 'Habit Reminder 🎯',
            body: `${uncheckedCount} habit menunggu check-in hari ini`,
            type: 'habit',
            route: '/habits'
          }

          promises.push(
            sendNotificationToUser({ userId, notification })
          )
        }
      }

      await Promise.all(promises)
      console.log(`Sent ${promises.length} habit reminders`)
      
      return null
    } catch (error) {
      console.error('Error sending habit reminders:', error)
      return null
    }
  })

/**
 * Scheduled function: Send evening journal reminder
 * Runs every day at 9 PM
 */
exports.sendEveningJournalReminder = functions.pubsub
  .schedule('0 21 * * *') // Cron: 9 PM every day
  .timeZone('Asia/Jakarta')
  .onRun(async (context) => {
    console.log('Starting evening journal reminders...')

    try {
      // Get all users who have journal enabled
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('settings.journalEnabled', '==', true)
        .get()

      const promises = []

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id
        
        // Check if user has written journal today
        const today = new Date().toISOString().split('T')[0]
        const journalsSnapshot = await admin.firestore()
          .collection('users')
          .doc(userId)
          .collection('journals')
          .where('date', '==', today)
          .limit(1)
          .get()

        if (journalsSnapshot.empty) {
          // Send reminder
          const notification = {
            title: 'Refleksi Hari Ini 📝',
            body: 'Luangkan 1 menit untuk menulis jurnal hari ini',
            type: 'journal',
            route: '/journal'
          }

          promises.push(
            sendNotificationToUser({ userId, notification })
          )
        }
      }

      await Promise.all(promises)
      console.log(`Sent ${promises.length} journal reminders`)
      
      return null
    } catch (error) {
      console.error('Error sending journal reminders:', error)
      return null
    }
  })

// ==================== Helper Function untuk Client-side ====================

/**
 * Call from React app to send notification
 */
export async function sendNotification(userId, notification) {
  const sendNotificationToUser = firebase.functions().httpsCallable('sendNotificationToUser')
  
  try {
    const result = await sendNotificationToUser({
      userId,
      notification
    })
    
    return result.data
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

// ==================== Example Usage dari React ====================

/**
 * Example: Send goal milestone notification
 */
import { sendNotification } from './lib/notifications'

export async function onGoalMilestoneReached(goalData) {
  const userId = auth.currentUser.uid
  
  await sendNotification(userId, {
    title: 'Goal Milestone! 🎉',
    body: `${goalData.title} sudah mencapai ${goalData.progress}%!`,
    type: 'goal',
    route: '/goals',
    entityId: goalData.id
  })
}

/**
 * Example: Send budget warning
 */
export async function onBudgetWarning(budgetData) {
  const userId = auth.currentUser.uid
  
  await sendNotification(userId, {
    title: 'Budget Warning ⚠️',
    body: `Budget ${budgetData.category} sudah ${budgetData.percentage}%`,
    type: 'finance',
    route: '/finance',
    entityId: budgetData.id
  })
}
