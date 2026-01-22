import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IconMail, IconCheck, IconLoader2, IconArrowLeft } from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'
import { LentoButton } from '../components/ui/LentoButton'
import { sanitizeNext } from '../lib/safeRedirect'

/**
 * Auth - Login/Sign up page with Magic Link
 */
function Auth() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user, signIn, loading, isConfigured } = useAuth()
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    // SECURITY: Sanitize redirect parameter to prevent open redirect attacks
    const next = sanitizeNext(searchParams.get('next'))

    // Auto-redirect if already authenticated
    useEffect(() => {
        if (user && next) {
            navigate(next, { replace: true })
        }
    }, [user, next, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email || !email.includes('@')) {
            setError('Masukkan email yang valid')
            return
        }

        const result = await signIn(email)

        if (result.success) {
            setSent(true)
        } else {
            setError(result.message)
        }
    }

    if (!isConfigured) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-sm w-full text-center py-8">
                    <h1 className="text-h2 text-ink mb-2">Sync Tidak Tersedia</h1>
                    <p className="text-body text-ink-muted mb-4">
                        Supabase belum dikonfigurasi. App bisa digunakan secara offline.
                    </p>
                    <LentoButton onClick={() => navigate('/')}>
                        Kembali ke Home
                    </LentoButton>
                </div>
            </div>
        )
    }

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-sm w-full text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <IconCheck size={32} stroke={2} className="text-success" />
                    </div>
                    <h1 className="text-h2 text-ink mb-2">Cek Email Kamu!</h1>
                    <p className="text-body text-ink-muted mb-4">
                        Kami sudah kirim link login ke <strong>{email}</strong>
                    </p>
                    <p className="text-small text-ink-muted">
                        Klik link di email untuk masuk. Link berlaku 1 jam.
                    </p>
                    <button
                        onClick={() => setSent(false)}
                        className="mt-6 text-primary hover:underline text-small"
                    >
                        Kirim ulang ke email lain
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-sm w-full">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-ink-muted hover:text-ink mb-4 -ml-1"
                >
                    <IconArrowLeft size={18} stroke={2} />
                    <span className="text-small">Kembali</span>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <img
                        src="/Lento_Logo_Pack_Calm_v1/svg/lento_lettermarkA_full.svg"
                        alt="Lento"
                        className="w-16 h-16 mx-auto mb-4"
                    />
                    <h1 className="text-h2 text-ink">Masuk ke Lento</h1>
                    <p className="text-small text-ink-muted mt-1">
                        Sync data ke cloud dengan Magic Link
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-small text-ink-muted mb-1.5 block">Email</label>
                        <div className="relative">
                            <IconMail
                                size={18}
                                stroke={1.5}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="input pl-10"
                                autoFocus
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-small text-danger">{error}</p>
                    )}

                    <LentoButton
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <IconLoader2 size={18} className="animate-spin" />
                                <span>Mengirim...</span>
                            </>
                        ) : (
                            <span>Kirim Magic Link</span>
                        )}
                    </LentoButton>
                </form>

                {/* Footer */}
                <p className="text-tiny text-ink-muted text-center mt-6">
                    Tidak perlu password. Link login akan dikirim ke email kamu.
                </p>
            </div>
        </div>
    )
}

export default Auth
