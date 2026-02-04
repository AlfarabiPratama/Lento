/**
 * Firebase Configuration
 * 
 * Initializes Firebase app with Auth, Firestore, FCM, and Analytics.
 */

import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getAnalytics } from 'firebase/analytics'
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    // Email/Password Auth
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    // Phone Auth
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth'
import {
    getFirestore,
    enableIndexedDbPersistence,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
} from 'firebase/firestore'

// Firebase config dari environment variables (aman untuk client-side)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

// Initialize Messaging (only in browser with service worker support)
export const messaging = typeof window !== 'undefined' && 'serviceWorker' in navigator
    ? getMessaging(app)
    : null

// VAPID key for FCM dari environment variables
// Generate di Firebase Console: Project Settings → Cloud Messaging → Web Push certificates
export const VAPID_KEY = import.meta.env.VITE_VAPID_KEY

// ==================== Firestore ====================

// Initialize Firestore
export const db = typeof window !== 'undefined' ? getFirestore(app) : null

// Enable offline persistence (local-first)
if (db) {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence failed: Multiple tabs open')
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore persistence not available')
        }
    })
}

// Re-export Firestore helpers for sync engine
export { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp }

// ==================== Auth ====================

// Initialize Auth
export const auth = typeof window !== 'undefined' ? getAuth(app) : null

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
    prompt: 'select_account' // Always show account picker
})

/**
 * Sign in with Google popup
 */
export async function signInWithGoogle() {
    if (!auth) throw new Error('Auth not available')

    try {
        console.log('Starting Google Sign-In...')
        const result = await signInWithPopup(auth, googleProvider)
        console.log('Google sign-in success:', result.user.email)
        return result.user
    } catch (error) {
        console.error('Google sign-in error:', error)
        
        // Better error messages for common issues
        if (error.code === 'auth/popup-closed-by-user') {
            const friendlyError = new Error('Popup ditutup. Silakan coba lagi.')
            friendlyError.code = error.code
            throw friendlyError
        } else if (error.code === 'auth/popup-blocked') {
            const friendlyError = new Error('Popup diblokir browser. Izinkan popup untuk sign in dengan Google.')
            friendlyError.code = error.code
            throw friendlyError
        } else if (error.code === 'auth/unauthorized-domain') {
            const friendlyError = new Error('Domain tidak diizinkan. Hubungi admin untuk menambahkan domain ke Firebase.')
            friendlyError.code = error.code
            throw friendlyError
        } else if (error.code === 'auth/operation-not-allowed') {
            const friendlyError = new Error('Google Sign-In belum diaktifkan. Hubungi admin.')
            friendlyError.code = error.code
            throw friendlyError
        }
        
        throw error
    }
}

/**
 * Sign out current user
 */
export async function signOut() {
    if (!auth) return

    try {
        await firebaseSignOut(auth)
        console.log('User signed out')
    } catch (error) {
        console.error('Sign out error:', error)
        throw error
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback) {
    if (!auth) return () => { }
    return onAuthStateChanged(auth, callback)
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission() {
    if (!messaging) {
        console.warn('FCM not supported in this browser')
        return null
    }

    try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            console.log('Notification permission denied')
            return null
        }

        // Get FCM token
        const token = await getToken(messaging, { vapidKey: VAPID_KEY || undefined })
        console.log('FCM Token:', token)
        return token
    } catch (error) {
        console.error('Error getting FCM token:', error)
        return null
    }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback) {
    if (!messaging) return () => { }

    return onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload)
        callback(payload)
    })
}

// ==================== Email/Password Auth ====================

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email, password) {
    if (!auth) throw new Error('Auth not available')

    try {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        console.log('Email sign-up success:', result.user.email)
        return result.user
    } catch (error) {
        console.error('Email sign-up error:', error)
        throw error
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
    if (!auth) throw new Error('Auth not available')

    try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        console.log('Email sign-in success:', result.user.email)
        return result.user
    } catch (error) {
        console.error('Email sign-in error:', error)
        throw error
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
    if (!auth) throw new Error('Auth not available')

    try {
        await sendPasswordResetEmail(auth, email)
        console.log('Password reset email sent to:', email)
        return true
    } catch (error) {
        console.error('Password reset error:', error)
        throw error
    }
}

// ==================== Phone Auth ====================

// Store recaptcha verifier instance
let recaptchaVerifier = null

/**
 * Initialize invisible reCAPTCHA for phone auth
 * Must be called before sendPhoneOTP
 */
export function initRecaptcha(buttonId) {
    if (!auth) throw new Error('Auth not available')

    // Clear existing verifier if any
    if (recaptchaVerifier) {
        recaptchaVerifier.clear()
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: 'invisible',
        callback: () => {
            console.log('reCAPTCHA solved')
        },
        'expired-callback': () => {
            console.log('reCAPTCHA expired')
        }
    })

    return recaptchaVerifier
}

/**
 * Send OTP to phone number
 * Phone number must include country code (e.g., +6281234567890)
 */
export async function sendPhoneOTP(phoneNumber) {
    if (!auth) throw new Error('Auth not available')
    if (!recaptchaVerifier) throw new Error('reCAPTCHA not initialized. Call initRecaptcha first.')

    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
        console.log('OTP sent to:', phoneNumber)
        return confirmationResult
    } catch (error) {
        console.error('Phone OTP error:', error)
        // Reset recaptcha on error
        if (recaptchaVerifier) {
            recaptchaVerifier.clear()
            recaptchaVerifier = null
        }
        throw error
    }
}

/**
 * Verify OTP code
 * @param confirmationResult - Result from sendPhoneOTP
 * @param code - 6-digit OTP code
 */
export async function verifyPhoneOTP(confirmationResult, code) {
    if (!confirmationResult) throw new Error('No confirmation result')

    try {
        const result = await confirmationResult.confirm(code)
        console.log('Phone sign-in success:', result.user.phoneNumber)
        return result.user
    } catch (error) {
        console.error('OTP verification error:', error)
        throw error
    }
}

/**
 * Clean up recaptcha verifier
 */
export function cleanupRecaptcha() {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear()
        recaptchaVerifier = null
    }
}

// ==================== FCM Token Management ====================

/**
 * Save FCM token to Firestore for server-side push notifications
 * Supports multi-device by using token as document ID
 */
export async function saveFcmToken(token) {
    if (!db || !auth?.currentUser) {
        console.warn('Cannot save FCM token: not authenticated or db not available')
        return
    }

    const user = auth.currentUser

    try {
        await setDoc(doc(db, 'fcm_tokens', token), {
            token,
            userId: user.uid,
            userEmail: user.email || null,
            deviceInfo: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        })
        console.log('FCM token saved to Firestore')
    } catch (error) {
        console.error('Failed to save FCM token:', error)
        throw error
    }
}

/**
 * Remove FCM token from Firestore
 */
export async function removeFcmToken(token) {
    if (!db) return

    try {
        const { deleteDoc } = await import('firebase/firestore')
        await deleteDoc(doc(db, 'fcm_tokens', token))
        console.log('FCM token removed from Firestore')
    } catch (error) {
        console.error('Failed to remove FCM token:', error)
    }
}

/**
 * Get user's timezone (for server-side reminder scheduling)
 */
export function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export default app
