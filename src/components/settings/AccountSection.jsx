import { useState, useCallback, useRef, useId } from 'react'
import { IconLogout, IconBrandGoogle, IconCloud, IconShieldCheck, IconMail, IconPhone, IconLock, IconArrowLeft, IconCheck, IconX } from '@tabler/icons-react'

/**
 * AccountSection - User account with multiple Sign-In methods
 * 
 * Supports: Google, Email/Password, Phone (OTP)
 * Guest-first pattern: Login is optional, with clear value proposition.
 */
export function AccountSection({
    user,
    isLoggedIn,
    displayName,
    onDisplayNameChange,
    onSignInWithGoogle,
    onSignInWithEmail,
    onSignUpWithEmail,
    onSetupRecaptcha,
    onSendPhoneOTP,
    onVerifyPhoneOTP,
    hasOTPPending,
    onSignOut,
    loading = false,
}) {
    const [authMethod, setAuthMethod] = useState(null) // null, 'email', 'phone'
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

    // Reset form
    const resetForm = () => {
        setAuthMethod(null)
        setIsSignUp(false)
        setError('')
        setSuccess('')
        setEmail('')
        setPassword('')
        setPhoneNumber('')
        setOtpCode('')
    }

    // Handle Email Sign In / Sign Up
    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Email dan password diperlukan')
            return
        }

        setError('')
        try {
            const result = isSignUp
                ? await onSignUpWithEmail(email, password)
                : await onSignInWithEmail(email, password)

            if (!result.success) {
                setError(result.message)
            } else {
                resetForm()
            }
        } catch (err) {
            setError('Terjadi kesalahan')
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

        // Format phone number
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+62' + formattedPhone.substring(1)
        } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+62' + formattedPhone
        }

        setError('')

        try {
            // Initialize reCAPTCHA
            const recaptchaSetup = onSetupRecaptcha(`phone-settings-btn-${phoneButtonId}`)
            if (!recaptchaSetup.success) {
                setError(recaptchaSetup.message)
                return
            }

            const result = await onSendPhoneOTP(formattedPhone)
            if (!result.success) {
                setError(result.message)
            } else {
                setSuccess('Kode OTP telah dikirim!')
            }
        } catch (err) {
            setError('Gagal mengirim OTP')
        }
    }

    // Handle OTP Verification
    const handleVerifyOTP = async (e) => {
        e.preventDefault()

        if (!otpCode || otpCode.length !== 6) {
            setError('Masukkan 6 digit kode OTP')
            return
        }

        setError('')

        try {
            const result = await onVerifyPhoneOTP(otpCode)
            if (!result.success) {
                setError(result.message)
            } else {
                resetForm()
            }
        } catch (err) {
            setError('Verifikasi gagal')
        }
    }

    return (
        <section className="card">
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-h2 text-ink mb-1">Akun <span className="text-small font-normal text-ink-muted">(opsional)</span></h2>
                <p className="text-small text-ink-muted">
                    Masuk untuk sinkron antar perangkat dan backup cloud.
                </p>
                <p className="text-tiny text-ink-light mt-1">
                    Tanpa akun, Lento tetap bisa dipakai — data tersimpan di perangkat ini.
                </p>
            </div>

            <div className="space-y-4">
                {/* User info / Sign in */}
                {isLoggedIn ? (
                    // Logged in state
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    className="w-12 h-12 rounded-full border-2 border-primary/30"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                                    {(user?.displayName || user?.email || user?.phoneNumber || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-body text-ink font-medium truncate">
                                    {user?.displayName || 'Pengguna'}
                                </p>
                                <p className="text-small text-ink-muted truncate">
                                    {user?.email || user?.phoneNumber}
                                </p>
                            </div>

                            <button
                                onClick={onSignOut}
                                disabled={loading}
                                className="btn-secondary flex items-center gap-2 flex-shrink-0 text-danger hover:bg-danger/10"
                                aria-label="Keluar dari akun"
                            >
                                <IconLogout size={18} stroke={2} />
                                <span>{loading ? '...' : 'Keluar'}</span>
                            </button>
                        </div>

                        {/* Merge reassurance */}
                        <p className="text-tiny text-success flex items-center gap-1">
                            <IconShieldCheck size={14} />
                            <span>Data lokal sudah terhubung ke akun ini.</span>
                        </p>
                    </div>
                ) : (
                    // Not logged in state
                    <div className="space-y-4">
                        {/* Benefits list */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-small text-ink-muted">
                                <IconCloud size={16} className="text-primary" />
                                <span>Sync & backup otomatis ke cloud</span>
                            </div>
                            <div className="flex items-center gap-2 text-small text-ink-muted">
                                <IconShieldCheck size={16} className="text-success" />
                                <span>Data lokal akan digabung ke akun (tidak dihapus)</span>
                            </div>
                        </div>

                        {/* Auth Methods */}
                        {!authMethod && (
                            <div className="flex flex-col gap-2 py-2">
                                {/* Google */}
                                <button
                                    onClick={onSignInWithGoogle}
                                    disabled={loading}
                                    className="btn-secondary flex items-center gap-3 px-4 py-3 text-body
                                        border-2 border-line hover:border-primary/50 hover:bg-primary/5
                                        transition-all rounded-xl w-full justify-center"
                                >
                                    <IconBrandGoogle size={20} className="text-[#4285F4]" />
                                    <span>{loading ? 'Memproses...' : 'Masuk dengan Google'}</span>
                                </button>

                                {/* Email */}
                                <button
                                    onClick={() => setAuthMethod('email')}
                                    className="btn-secondary flex items-center gap-3 px-4 py-3 text-body
                                        border-2 border-line hover:border-primary/50 hover:bg-primary/5
                                        transition-all rounded-xl w-full justify-center"
                                >
                                    <IconMail size={20} className="text-ink-muted" />
                                    <span>Email & Password</span>
                                </button>

                                {/* Phone */}
                                <button
                                    onClick={() => setAuthMethod('phone')}
                                    className="btn-secondary flex items-center gap-3 px-4 py-3 text-body
                                        border-2 border-line hover:border-primary/50 hover:bg-primary/5
                                        transition-all rounded-xl w-full justify-center"
                                >
                                    <IconPhone size={20} className="text-ink-muted" />
                                    <span>Nomor Handphone</span>
                                </button>
                            </div>
                        )}

                        {/* Email Form */}
                        {authMethod === 'email' && (
                            <div className="py-2">
                                <button
                                    onClick={resetForm}
                                    className="flex items-center gap-1 text-ink-muted hover:text-ink mb-3 text-small"
                                >
                                    <IconArrowLeft size={16} />
                                    <span>Kembali</span>
                                </button>

                                <form onSubmit={handleEmailSubmit} className="space-y-3">
                                    <div className="relative">
                                        <IconMail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email"
                                            className="input pl-10 w-full"
                                        />
                                    </div>

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

                                    {error && <p className="text-small text-danger">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full py-3"
                                    >
                                        {loading ? 'Memproses...' : (isSignUp ? 'Daftar' : 'Masuk')}
                                    </button>

                                    <p className="text-small text-ink-muted text-center">
                                        {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                            className="text-primary hover:underline"
                                        >
                                            {isSignUp ? 'Masuk' : 'Daftar'}
                                        </button>
                                    </p>
                                </form>
                            </div>
                        )}

                        {/* Phone Form */}
                        {authMethod === 'phone' && (
                            <div className="py-2">
                                <button
                                    onClick={resetForm}
                                    className="flex items-center gap-1 text-ink-muted hover:text-ink mb-3 text-small"
                                >
                                    <IconArrowLeft size={16} />
                                    <span>Kembali</span>
                                </button>

                                {!hasOTPPending ? (
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
                                                />
                                            </div>
                                            <p className="text-tiny text-ink-muted mt-1">Contoh: 081234567890</p>
                                        </div>

                                        {error && <p className="text-small text-danger">{error}</p>}

                                        <button
                                            id={`phone-settings-btn-${phoneButtonId}`}
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary w-full py-3"
                                        >
                                            {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
                                        </button>
                                    </form>
                                ) : (
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
                                                maxLength={6}
                                            />
                                            <p className="text-tiny text-ink-muted mt-1 text-center">Masukkan 6 digit kode OTP</p>
                                        </div>

                                        {error && <p className="text-small text-danger">{error}</p>}

                                        <button
                                            type="submit"
                                            disabled={loading || otpCode.length !== 6}
                                            className="btn-primary w-full py-3"
                                        >
                                            {loading ? 'Memverifikasi...' : 'Verifikasi'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Display name (local-only) */}
                <div className="border-t border-line pt-4">
                    <label className="block text-small text-ink-muted mb-1.5">
                        Nama panggilan (lokal)
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => onDisplayNameChange(e.target.value)}
                        placeholder="Mis. Alfa"
                        className="input w-full"
                    />
                    <p className="text-tiny text-ink-muted mt-1.5">
                        Disimpan di perangkat ini saja — aman, tidak dikirim ke cloud.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default AccountSection

