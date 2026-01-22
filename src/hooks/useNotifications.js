/**
 * useNotifications Hook
 * 
 * Manages FCM token lifecycle and notification permissions
 */

import { useState, useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging, VAPID_KEY } from '../lib/firebase'
import { doc, setDoc, getDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export const useNotifications = (userId) => {
    const [permission, setPermission] = useState(
        typeof window !== 'undefined' ? Notification.permission : 'default'
    )
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    /**
     * Request notification permission and get FCM token
     */
    const requestPermission = async () => {
        if (!userId) {
            setError('User not authenticated')
            return null
        }

        if (!('Notification' in window)) {
            setError('This browser does not support notifications')
            return null
        }

        setLoading(true)
        setError(null)

        try {
            const permission = await Notification.requestPermission()
            setPermission(permission)

            if (permission === 'granted') {
                // Get FCM token
                const currentToken = await getToken(messaging, { 
                    vapidKey: VAPID_KEY 
                })
                
                if (currentToken) {
                    setToken(currentToken)
                    
                    // Save token to fcm_tokens collection (support multiple devices)
                    await setDoc(doc(db, 'fcm_tokens', currentToken), {
                        userId,
                        token: currentToken,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                        userAgent: navigator.userAgent,
                        deviceType: getDeviceType()
                    })

                    // Update user's lastTokenUpdate
                    await setDoc(doc(db, 'users', userId), {
                        lastTokenUpdate: Timestamp.now()
                    }, { merge: true })

                    console.log('[FCM] Token saved:', currentToken.substring(0, 20) + '...')
                    return currentToken
                } else {
                    throw new Error('No FCM token retrieved')
                }
            } else {
                setError('Notification permission denied')
                return null
            }
        } catch (err) {
            console.error('[FCM] Error getting token:', err)
            setError(err.message)
            return null
        } finally {
            setLoading(false)
        }
    }

    /**
     * Revoke FCM token and delete from Firestore
     */
    const revokePermission = async () => {
        if (token) {
            try {
                await deleteDoc(doc(db, 'fcm_tokens', token))
                setToken(null)
                console.log('[FCM] Token revoked')
            } catch (err) {
                console.error('[FCM] Error revoking token:', err)
            }
        }
    }

    /**
     * Check if user has notification preferences
     */
    const getPreferences = async () => {
        if (!userId) return null
        
        const userDoc = await getDoc(doc(db, 'users', userId))
        return userDoc.data()?.notificationPreferences || null
    }

    /**
     * Listen for foreground messages
     */
    useEffect(() => {
        if (!messaging) return

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('[FCM] Foreground message:', payload)

            const { notification, data } = payload

            // Show browser notification
            if (Notification.permission === 'granted') {
                const notificationOptions = {
                    body: notification.body,
                    icon: '/icon-192x192.png',
                    badge: '/badge-72x72.png',
                    tag: data?.type || 'lento-notification',
                    data: data,
                    requireInteraction: data?.type === 'bill_reminder'
                }

                new Notification(notification.title, notificationOptions)
            }
        })

        return unsubscribe
    }, [])

    return {
        permission,
        token,
        loading,
        error,
        requestPermission,
        revokePermission,
        getPreferences
    }
}

/**
 * Helper: Detect device type
 */
function getDeviceType() {
    const ua = navigator.userAgent
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet'
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile'
    }
    return 'desktop'
}
