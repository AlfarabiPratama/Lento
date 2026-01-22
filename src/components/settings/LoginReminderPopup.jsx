import { useState, useEffect, useCallback, useRef, useId } from 'react'
import { IconX, IconBrandGoogle, IconMail, IconPhone, IconLock, IconArrowLeft, IconCheck } from '@tabler/icons-react'
import { useAuth } from '../../hooks/useAuth'

/**
 * LoginReminderPopup - Auto-shows popup when user is not logged in
 * 
 * Shows a reminder popup after a delay when user hasn't logged in.
 * Supports: Google, Email/Password, and Phone (OTP) authentication.
 */
const STORAGE_KEY = 'lento_login_reminder_dismissed_until'
const REMINDER_DELAY_MS = 30000 // 30 seconds after app load
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000 // Don't show again for 24 hours

export function LoginReminderPopup() {
    const {
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        setupRecaptcha,
        sendPhoneOTP,
        verifyPhoneOTP,
        hasOTPPending
    } = useAuth()

    const [isOpen, setIsOpen] = useState(false)
    const [signingIn, setSigningIn] = useState(false)
    const [authMethod, setAuthMethod] = useState('main') // main, email, phone
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Form states
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otpCode, setOtpCode] = useState('')

    // For reCAPTCHA
    const phoneButtonId = useId().replace(/:/g, '-')
    const phoneButtonRef = useRef(null)

    // Check if we should show the reminder
    const shouldShowReminder = useCallback(() => {
        if (user) return false

        const dismissedUntil = localStorage.getItem(STORAGE_KEY)
        if (dismissedUntil) {
            const dismissedTime = parseInt(dismissedUntil, 10)
            if (Date.now() < dismissedTime) {
                return false
            }
        }

        return true
    }, [user])

    // Show popup after delay
    useEffect(() => {
        if (loading) return
        if (user) return

        const timer = setTimeout(() => {
            if (shouldShowReminder()) {
                setIsOpen(true)
            }
        }, REMINDER_DELAY_MS)

        return () => clearTimeout(timer)
    }, [loading, user, shouldShowReminder])

    // Close popup when user logs in
    useEffect(() => {
        if (user) {
            setIsOpen(false)
        }
    }, [user])

    // Handle dismiss
    const handleDismiss = useCallback(() => {
        const dismissUntil = Date.now() + DISMISS_DURATION_MS
        localStorage.setItem(STORAGE_KEY, dismissUntil.toString())
        setIsOpen(false)
        resetForm()
    }, [])

    // Reset form
    const resetForm = () => {
        setAuthMethod('main')
        setIsSignUp(false)
        setError('')
        setSuccess('')
        setEmail('')
        setPassword('')
        setPhoneNumber('')
        setOtpCode('')
    }

    // Handle Google Sign In
    const handleGoogleSignIn = async () => {
        setSigningIn(true)
        setError('')
        try {
            const result = await signInWithGoogle()
            if (!result.success) {
                setError(result.message)
            }
        } finally {
            setSigningIn(false)
        }
    }

    // Handle Email Sign In / Sign Up
    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Email dan password diperlukan')
            return
        }

        setSigningIn(true)
        setError('')

        try {
            const result = isSignUp
                ? await signUpWithEmail(email, password)
                : await signInWithEmail(email, password)

            if (!result.success) {
                setError(result.message)
            }
        } finally {
            setSigningIn(false)
        }
    }

    // Handle Phone OTP Send
    const handleSendOTP = async (e) => {
        e.preventDefault()

        let formattedPhone = phoneNumber.trim()
        if (!formattedPhone) {
            setError('Nomor telepon diperlukan')
            return
        }

        // Format phone number to include country code
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+62' + formattedPhone.substring(1)
        } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+62' + formattedPhone
        }

        setSigningIn(true)
        setError('')

        try {
            // Initialize reCAPTCHA
            const recaptchaSetup = setupRecaptcha(`phone-btn-${phoneButtonId}`)
            if (!recaptchaSetup.success) {
                setError(recaptchaSetup.message)
                setSigningIn(false)
                return
            }

            const result = await sendPhoneOTP(formattedPhone)
            if (!result.success) {
                setError(result.message)
            } else {
                setSuccess('Kode OTP telah dikirim ke ' + formattedPhone)
            }
        } finally {
            setSigningIn(false)
        }
    }

    // Handle OTP Verification
    const handleVerifyOTP = async (e) => {
        e.preventDefault()

        if (!otpCode || otpCode.length !== 6) {
            setError('Masukkan 6 digit kode OTP')
            return
        }

        setSigningIn(true)
        setError('')

        try {
            const result = await verifyPhoneOTP(otpCode)
            if (!result.success) {
                setError(result.message)
            }
        } finally {
            setSigningIn(false)
        }
    }

    // Handle keyboard
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleDismiss()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleDismiss])

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[9999]"
                onClick={handleDismiss}
                aria-hidden="true"
            />

            {/* Popup */}
            <div
                role="dialog"
                aria-modal="true"
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000]
                    w-[90vw] max-w-sm bg-surface rounded-2xl shadow-xl p-6
                    animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
            >
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center
                        rounded-full text-ink-muted hover:text-ink hover:bg-paper-warm
                        transition-colors"
                    aria-label="Tutup"
                >
                    <IconX size={20} />
                </button>

                {/* Main View */}
                {authMethod === 'main' && (
                    <div className="text-center">
                        {/* Header */}
                        <h2 className="text-h2 text-ink mb-2 mt-2">Masuk ke Lento</h2>
                        <p className="text-body text-ink-muted mb-6">
                            Sync & backup data kamu ke cloud
                        </p>

                        {/* Auth Options */}
                        <div className="flex flex-col gap-3">
                            {/* Google */}
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={signingIn}
                                className="btn-primary flex items-center justify-center gap-3 w-full py-3"
                            >
                                <IconBrandGoogle size={20} />
                                <span>{signingIn ? 'Memproses...' : 'Masuk dengan Google'}</span>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-2">
                                <div className="flex-1 h-px bg-ink/10" />
                                <span className="text-small text-ink-muted">atau</span>
                                <div className="flex-1 h-px bg-ink/10" />
                            </div>

                            {/* Email */}
                            <button
                                onClick={() => setAuthMethod('email')}
                                className="btn-secondary flex items-center justify-center gap-3 w-full py-3"
                            >
                                <IconMail size={20} />
                                <span>Email & Password</span>
                            </button>

                            {/* Phone */}
                            <button
                                onClick={() => setAuthMethod('phone')}
                                className="btn-secondary flex items-center justify-center gap-3 w-full py-3"
                            >
                                <IconPhone size={20} />
                                <span>Nomor Handphone</span>
                            </button>

                            {/* Later */}
                            <button
                                onClick={handleDismiss}
                                className="btn-ghost text-ink-muted hover:text-ink w-full py-2 mt-2"
                            >
                                Nanti saja
                            </button>
                        </div>
                    </div>
                )}

                {/* Email/Password View */}
                {authMethod === 'email' && (
                    <div>
                        {/* Back button */}
                        <button
                            onClick={() => { setAuthMethod('main'); setError(''); }}
                            className="flex items-center gap-1 text-ink-muted hover:text-ink mb-4"
                        >
                            <IconArrowLeft size={18} />
                            <span className="text-small">Kembali</span>
                        </button>

                        {/* Header */}
                        <h2 className="text-h2 text-ink mb-1">
                            {isSignUp ? 'Daftar Akun' : 'Masuk dengan Email'}
                        </h2>
                        <p className="text-small text-ink-muted mb-4">
                            {isSignUp ? 'Buat akun baru dengan email' : 'Gunakan email dan password'}
                        </p>

                        <form onSubmit={handleEmailSubmit} className="space-y-3">
                            <div>
                                <div className="relative">
                                    <IconMail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="input pl-10 w-full"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <IconLock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="input pl-10 w-full"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-small text-danger">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={signingIn}
                                className="btn-primary w-full py-3"
                            >
                                {signingIn ? 'Memproses...' : (isSignUp ? 'Daftar' : 'Masuk')}
                            </button>
                        </form>

                        {/* Toggle sign up / sign in */}
                        <p className="text-small text-ink-muted text-center mt-4">
                            {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                className="text-primary hover:underline"
                            >
                                {isSignUp ? 'Masuk' : 'Daftar'}
                            </button>
                        </p>
                    </div>
                )}

                {/* Phone View */}
                {authMethod === 'phone' && (
                    <div>
                        {/* Back button */}
                        <button
                            onClick={() => { setAuthMethod('main'); setError(''); setSuccess(''); }}
                            className="flex items-center gap-1 text-ink-muted hover:text-ink mb-4"
                        >
                            <IconArrowLeft size={18} />
                            <span className="text-small">Kembali</span>
                        </button>

                        {/* Header */}
                        <h2 className="text-h2 text-ink mb-1">Masuk dengan HP</h2>
                        <p className="text-small text-ink-muted mb-4">
                            Kami akan kirim kode OTP via SMS
                        </p>

                        {!hasOTPPending ? (
                            // Phone number input
                            <form onSubmit={handleSendOTP} className="space-y-3">
                                <div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-small">+62</span>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                            placeholder="81234567890"
                                            className="input pl-12 w-full"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-tiny text-ink-muted mt-1">
                                        Contoh: 081234567890
                                    </p>
                                </div>

                                {error && (
                                    <p className="text-small text-danger">{error}</p>
                                )}

                                <button
                                    id={`phone-btn-${phoneButtonId}`}
                                    ref={phoneButtonRef}
                                    type="submit"
                                    disabled={signingIn}
                                    className="btn-primary w-full py-3"
                                >
                                    {signingIn ? 'Mengirim...' : 'Kirim Kode OTP'}
                                </button>
                            </form>
                        ) : (
                            // OTP input
                            <form onSubmit={handleVerifyOTP} className="space-y-3">
                                {success && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 text-small">
                                        <IconCheck size={18} />
                                        <span>{success}</span>
                                    </div>
                                )}

                                <div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="input w-full text-center text-2xl tracking-[0.5em] font-mono"
                                        autoFocus
                                        maxLength={6}
                                    />
                                    <p className="text-tiny text-ink-muted mt-1 text-center">
                                        Masukkan 6 digit kode OTP
                                    </p>
                                </div>

                                {error && (
                                    <p className="text-small text-danger">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={signingIn || otpCode.length !== 6}
                                    className="btn-primary w-full py-3"
                                >
                                    {signingIn ? 'Memverifikasi...' : 'Verifikasi'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default LoginReminderPopup
