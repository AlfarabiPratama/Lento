/**
 * useAuth - Firebase Authentication Hook
 * 
 * Returns:
 * - user: Current Firebase user object or null
 * - loading: Whether auth state is being checked
 * - signInWithGoogle: Function to sign in with Google
 * - signInWithEmail: Function to sign in with email/password
 * - signUpWithEmail: Function to sign up with email/password
 * - resetPassword: Function to send password reset email
 * - sendPhoneOTP: Function to send OTP to phone
 * - verifyPhoneOTP: Function to verify phone OTP
 * - signOut: Function to sign out
 * - isAuthenticated: Whether user is logged in
 */

import { useState, useEffect, useCallback } from 'react'
import {
    auth,
    signInWithGoogle as firebaseSignInWithGoogle,
    signOut as firebaseSignOut,
    onAuthChange,
    // Email/Password
    signInWithEmail as firebaseSignInWithEmail,
    signUpWithEmail as firebaseSignUpWithEmail,
    resetPassword as firebaseResetPassword,
    // Phone
    initRecaptcha,
    sendPhoneOTP as firebaseSendPhoneOTP,
    verifyPhoneOTP as firebaseVerifyPhoneOTP,
    cleanupRecaptcha
} from '../lib/firebase'

export function useAuth() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [confirmationResult, setConfirmationResult] = useState(null)

    // Subscribe to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange((firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    phoneNumber: firebaseUser.phoneNumber,
                })
                console.log('User signed in:', firebaseUser.email || firebaseUser.phoneNumber)
            } else {
                // User is signed out
                setUser(null)
                console.log('User signed out')
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Sign in with Google
    const signInWithGoogle = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const firebaseUser = await firebaseSignInWithGoogle()
            return {
                success: true,
                user: {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                }
            }
        } catch (err) {
            console.error('Sign in error:', err)
            setError(err.message)
            return { success: false, message: err.message }
        } finally {
            setLoading(false)
        }
    }, [])

    // Sign in with Email/Password
    const signInWithEmail = useCallback(async (email, password) => {
        setLoading(true)
        setError(null)

        try {
            const firebaseUser = await firebaseSignInWithEmail(email, password)
            return {
                success: true,
                user: {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                }
            }
        } catch (err) {
            console.error('Email sign in error:', err)
            setError(getAuthErrorMessage(err.code))
            return { success: false, message: getAuthErrorMessage(err.code) }
        } finally {
            setLoading(false)
        }
    }, [])

    // Sign up with Email/Password
    const signUpWithEmail = useCallback(async (email, password) => {
        setLoading(true)
        setError(null)

        try {
            const firebaseUser = await firebaseSignUpWithEmail(email, password)
            return {
                success: true,
                user: {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                }
            }
        } catch (err) {
            console.error('Email sign up error:', err)
            setError(getAuthErrorMessage(err.code))
            return { success: false, message: getAuthErrorMessage(err.code) }
        } finally {
            setLoading(false)
        }
    }, [])

    // Send password reset email
    const resetPassword = useCallback(async (email) => {
        setLoading(true)
        setError(null)

        try {
            await firebaseResetPassword(email)
            return { success: true }
        } catch (err) {
            console.error('Password reset error:', err)
            setError(getAuthErrorMessage(err.code))
            return { success: false, message: getAuthErrorMessage(err.code) }
        } finally {
            setLoading(false)
        }
    }, [])

    // Initialize reCAPTCHA for phone auth
    const setupRecaptcha = useCallback((buttonId) => {
        try {
            initRecaptcha(buttonId)
            return { success: true }
        } catch (err) {
            console.error('reCAPTCHA setup error:', err)
            return { success: false, message: err.message }
        }
    }, [])

    // Send OTP to phone number
    const sendPhoneOTP = useCallback(async (phoneNumber) => {
        setLoading(true)
        setError(null)

        try {
            const result = await firebaseSendPhoneOTP(phoneNumber)
            setConfirmationResult(result)
            return { success: true }
        } catch (err) {
            console.error('Phone OTP error:', err)
            setError(getAuthErrorMessage(err.code))
            return { success: false, message: getAuthErrorMessage(err.code) }
        } finally {
            setLoading(false)
        }
    }, [])

    // Verify OTP code
    const verifyPhoneOTP = useCallback(async (code) => {
        if (!confirmationResult) {
            return { success: false, message: 'Tidak ada kode OTP yang dikirim' }
        }

        setLoading(true)
        setError(null)

        try {
            const firebaseUser = await firebaseVerifyPhoneOTP(confirmationResult, code)
            setConfirmationResult(null)
            return {
                success: true,
                user: {
                    uid: firebaseUser.uid,
                    phoneNumber: firebaseUser.phoneNumber,
                }
            }
        } catch (err) {
            console.error('OTP verification error:', err)
            setError(getAuthErrorMessage(err.code))
            return { success: false, message: getAuthErrorMessage(err.code) }
        } finally {
            setLoading(false)
        }
    }, [confirmationResult])

    // Sign out
    const signOut = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            await firebaseSignOut()
            cleanupRecaptcha()
            setUser(null)
            setConfirmationResult(null)
            return { success: true }
        } catch (err) {
            console.error('Sign out error:', err)
            setError(err.message)
            return { success: false, message: err.message }
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        user,
        loading,
        error,
        // Google
        signInWithGoogle,
        // Email/Password
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        // Phone
        setupRecaptcha,
        sendPhoneOTP,
        verifyPhoneOTP,
        hasOTPPending: !!confirmationResult,
        // General
        signOut,
        isAuthenticated: !!user,
        isConfigured: auth !== null,
    }
}

// Helper to convert Firebase error codes to user-friendly messages (Indonesian)
function getAuthErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'Email sudah digunakan',
        'auth/invalid-email': 'Format email tidak valid',
        'auth/operation-not-allowed': 'Metode login tidak diaktifkan',
        'auth/weak-password': 'Password terlalu lemah (min. 6 karakter)',
        'auth/user-disabled': 'Akun telah dinonaktifkan',
        'auth/user-not-found': 'Akun tidak ditemukan',
        'auth/wrong-password': 'Password salah',
        'auth/invalid-credential': 'Email atau password salah',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti',
        'auth/invalid-phone-number': 'Nomor telepon tidak valid',
        'auth/invalid-verification-code': 'Kode OTP salah',
        'auth/missing-phone-number': 'Nomor telepon diperlukan',
        'auth/quota-exceeded': 'Kuota SMS habis. Coba lagi nanti',
    }
    return messages[code] || 'Terjadi kesalahan. Silakan coba lagi'
}

export default useAuth

