/**
 * usePushNotifications - React hook for Firebase Cloud Messaging
 * 
 * Manages push notification permissions, token storage, and foreground messages.
 */

import { useState, useEffect, useCallback } from 'react'
import { requestNotificationPermission, onForegroundMessage } from '../lib/firebase'

const FCM_TOKEN_KEY = 'lento_fcm_token'
const PUSH_ENABLED_KEY = 'lento_push_enabled'

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check support and load saved state
    useEffect(() => {
        const supported = 'Notification' in window && 'serviceWorker' in navigator
        setIsSupported(supported)

        if (supported) {
            // Load saved state
            const savedEnabled = localStorage.getItem(PUSH_ENABLED_KEY) === 'true'
            const savedToken = localStorage.getItem(FCM_TOKEN_KEY)

            setIsEnabled(savedEnabled && Notification.permission === 'granted')
            setToken(savedToken)
        }

        setLoading(false)
    }, [])

    // Listen for foreground messages
    useEffect(() => {
        if (!isEnabled) return

        const unsubscribe = onForegroundMessage((payload) => {
            // Show notification even when app is in foreground
            if (Notification.permission === 'granted') {
                new Notification(payload.notification?.title || 'Lento', {
                    body: payload.notification?.body || '',
                    icon: '/icons/icon-192x192.png',
                })
            }
        })

        return unsubscribe
    }, [isEnabled])

    // Enable push notifications
    const enable = useCallback(async () => {
        if (!isSupported) {
            setError('Push notifications tidak didukung di browser ini')
            return false
        }

        setLoading(true)
        setError(null)

        try {
            // Register FCM service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
            console.log('FCM SW registered:', registration)

            // Request permission and get token
            const fcmToken = await requestNotificationPermission()

            if (fcmToken) {
                setToken(fcmToken)
                setIsEnabled(true)
                localStorage.setItem(FCM_TOKEN_KEY, fcmToken)
                localStorage.setItem(PUSH_ENABLED_KEY, 'true')
                return true
            } else {
                setError('Izin notifikasi ditolak')
                return false
            }
        } catch (err) {
            console.error('Error enabling push:', err)
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }, [isSupported])

    // Disable push notifications
    const disable = useCallback(() => {
        setIsEnabled(false)
        localStorage.setItem(PUSH_ENABLED_KEY, 'false')
        // Note: We keep the token in case user re-enables
    }, [])

    // Toggle push notifications
    const toggle = useCallback(async () => {
        if (isEnabled) {
            disable()
            return true
        } else {
            return await enable()
        }
    }, [isEnabled, enable, disable])

    return {
        isSupported,
        isEnabled,
        token,
        loading,
        error,
        enable,
        disable,
        toggle,
    }
}

export default usePushNotifications
