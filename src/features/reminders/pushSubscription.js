/**
 * Push Subscription - Firebase Cloud Messaging
 * 
 * Manages FCM token for push notifications.
 */

import { messaging, VAPID_KEY, saveFcmToken, removeFcmToken } from '../../lib/firebase'
import { getToken, deleteToken } from 'firebase/messaging'

const FCM_TOKEN_KEY = 'lento_fcm_token'

/**
 * Get current FCM token from localStorage
 */
export async function getPushSubscription() {
  if (!('serviceWorker' in navigator)) return null

  const savedToken = localStorage.getItem(FCM_TOKEN_KEY)
  return savedToken || null
}

/**
 * Subscribe to push notifications via FCM
 */
export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker tidak tersedia')
  }

  if (!messaging) {
    throw new Error('Firebase Messaging tidak tersedia')
  }

  // Request notification permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Izin notifikasi ditolak')
  }

  // Register FCM service worker
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  console.log('FCM SW registered:', registration)

  // Get FCM token
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY || undefined,
      serviceWorkerRegistration: registration
    })

    if (token) {
      console.log('FCM Token:', token)
      localStorage.setItem(FCM_TOKEN_KEY, token)

      // Save token to Firestore for server-side push (Phase 3)
      await saveFcmToken(token)

      return token
    } else {
      throw new Error('Gagal mendapatkan FCM token')
    }
  } catch (error) {
    console.error('Error getting FCM token:', error)
    throw error
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  const token = localStorage.getItem(FCM_TOKEN_KEY)

  if (token && messaging) {
    try {
      await deleteToken(messaging)
      console.log('FCM token deleted')
    } catch (error) {
      console.warn('Failed to delete FCM token:', error)
    }

    // Remove from Firestore (Phase 3)
    await removeFcmToken(token)
  }

  localStorage.removeItem(FCM_TOKEN_KEY)
}

/**
 * Check if push is supported
 */
export function isPushSupported() {
  return 'Notification' in window &&
    'serviceWorker' in navigator &&
    messaging !== null
}

