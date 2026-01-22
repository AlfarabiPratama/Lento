import { useState } from 'react'
import { IconRefresh, IconLoader2, IconAlertCircle, IconCheck, IconCloud } from '@tabler/icons-react'
import { SyncStatusCard } from './SyncStatusCard'
import { LentoButton } from '../ui/LentoButton'
import { LoginPromptModal } from './LoginPromptModal'

/**
 * Format relative time (e.g., "2 menit lalu")
 */
function formatRelativeTime(isoString) {
    if (!isoString) return 'Belum pernah'

    try {
        const date = new Date(isoString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Baru saja'
        if (diffMins < 60) return `${diffMins} menit lalu`

        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} jam lalu`

        const diffDays = Math.floor(diffHours / 24)
        if (diffDays < 7) return `${diffDays} hari lalu`

        // Fallback to formatted date
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return 'Tidak valid'
    }
}

/**
 * SyncSection - Sync configuration and status display
 * 
 * Props:
 * - prefs: Sync preferences from useSyncPrefs()
 * - updatePrefs: Function to update preferences (debounced)
 * - updatePrefsImmediate: Function to update preferences (immediate for toggles)
 * - pendingCount: Number from usePendingCount()
 * - onRefreshPending: Manual refresh callback
 * - syncStatus: Object from useSync() { syncing, error, lastSync }
 * - onSync: Sync now callback
 * - isLoggedIn: Boolean authentication state
 * - onSignInWithGoogle: Sign in with Google callback (replaces onSignIn)
 * - authLoading: Auth loading state
 * - saveError: localStorage save error (for QuotaExceededError)
 * - onDismissSaveError: Clear save error
 */
export function SyncSection({
    prefs,
    updatePrefs,
    updatePrefsImmediate,
    pendingCount,
    onRefreshPending,
    syncStatus,
    onSync,
    isLoggedIn,
    onSignInWithGoogle,
    authLoading = false,
    saveError,
    onDismissSaveError,
}) {
    const { syncing, error } = syncStatus
    const [syncingLocal, setSyncingLocal] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)

    /**
     * Handle sync toggle
     * Progressive disclosure: explain why login is needed before prompting
     */
    const handleToggleSync = (checked) => {
        if (checked && !isLoggedIn) {
            // Don't enable, show info banner instead
            // User must sign in via banner CTA
            return
        }

        // Use immediate save for toggle (important state change)
        updatePrefsImmediate({ ...prefs, enabled: checked })
    }

    /**
     * Handle sync now action with mutex to prevent double-click
     */
    const handleSyncNow = async () => {
        if (!isLoggedIn) {
            setShowLoginModal(true)
            return
        }

        // Mutex: prevent double-click
        if (syncingLocal || syncing) {
            return
        }

        if (!prefs.enabled) {
            // Enable sync first
            updatePrefsImmediate({ ...prefs, enabled: true })
        }

        setSyncingLocal(true)
        try {
            await onSync()
        } finally {
            setSyncingLocal(false)
        }
    }

    /**
     * Get sync status display
     */
    const getSyncStatusDisplay = () => {
        if (syncing) return 'Syncing...'
        if (error) return 'Error'
        if (!prefs.enabled) return 'Disabled'
        return 'Ready'
    }

    const getSyncStatusVariant = () => {
        if (error) return 'danger'
        if (syncing || syncingLocal) return 'warning'
        if (prefs.enabled && !error) return 'success'
        return 'default'
    }

    /**
     * Get status message for screen readers (persistent live region)
     */
    const getStatusMessage = () => {
        if (syncingLocal || syncing) return 'Menyinkronkan data...'
        if (error) return `Error: ${error} `
        if (prefs.lastSyncAt) return 'Data berhasil tersinkronisasi'
        return ''
    }

    return (
        <section
            id="sync"
            className="card"
            aria-busy={syncing || syncingLocal}
            aria-label="Pengaturan sinkronisasi"
        >
            {/* PERSISTENT LIVE REGION - Must exist before content changes */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {getStatusMessage()}
            </div>

            <div className="mb-4">
                <h2 className="text-h2 text-ink mb-1">Sync</h2>
                <p className="text-small text-ink-muted">
                    Sinkronisasi membuat data kamu bisa diakses dari mana saja.
                </p>
            </div>

            <div className="space-y-4">
                {/* Enable sync toggle */}
                <div className="p-4 border border-line rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-body text-ink font-medium mb-0.5">
                                Aktifkan sync multi-device
                            </p>
                            <p className="text-small text-ink-muted">
                                {isLoggedIn
                                    ? 'Sinkronkan data antar perangkat (butuh login).'
                                    : 'Butuh login dulu untuk menghubungkan perangkat.'}
                            </p>
                        </div>

                        <label className="inline-flex items-center cursor-pointer flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={prefs.enabled}
                                onChange={(e) => handleToggleSync(e.target.checked)}
                                disabled={!isLoggedIn}
                                className="w-5 h-5 accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Toggle sync multi-device"
                                aria-describedby="sync-toggle-desc"
                            />
                        </label>
                    </div>
                    <p id="sync-toggle-desc" className="sr-only">
                        {isLoggedIn ? 'Sinkronisasi tersedia' : 'Login diperlukan untuk sinkronisasi'}
                    </p>
                </div>

                {/* localStorage save error (QuotaExceededError) */}
                {saveError && (
                    <div className="flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 rounded-xl">
                        <IconAlertCircle size={16} stroke={2} className="text-warning flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-small text-warning font-medium mb-1">
                                {saveError.error === 'quota_exceeded' ? 'Penyimpanan Penuh' : 'Gagal Menyimpan'}
                            </p>
                            <p className="text-tiny text-warning/90">
                                {saveError.message}
                            </p>
                        </div>
                        {onDismissSaveError && (
                            <button
                                onClick={onDismissSaveError}
                                className="text-warning hover:text-warning/80 flex-shrink-0"
                                aria-label="Tutup pesan kesalahan"
                            >
                                ×
                            </button>
                        )}
                    </div>
                )}

                {/* Info banner for non-logged-in users (Progressive Disclosure) */}
                {!isLoggedIn && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <IconCloud size={20} stroke={2} className="text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-body text-primary font-medium mb-1">
                                    Kenapa butuh login?
                                </p>
                                <p className="text-small text-primary/90 mb-3">
                                    Supaya Lento bisa tahu data ini milik siapa dan bisa dipakai di device lain.
                                    Tenang, app tetap bisa digunakan offline!
                                </p>
                                <LentoButton
                                    onClick={() => setShowLoginModal(true)}
                                    className="text-small"
                                >
                                    Masuk untuk Sync
                                </LentoButton>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status cards (only show when logged in) */}
                {isLoggedIn && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <SyncStatusCard
                            label="Last sync"
                            value={formatRelativeTime(prefs.lastSyncAt)}
                            variant={prefs.enabled ? 'default' : 'default'}
                        />

                        <SyncStatusCard
                            label="Pending changes"
                            value={pendingCount}
                            variant={pendingCount > 0 ? 'warning' : 'default'}
                            subtitle={pendingCount > 0 ? 'Sync recommended' : undefined}
                            action={
                                <button
                                    onClick={onRefreshPending}
                                    className="p-1.5 hover:bg-surface rounded-lg transition-colors"
                                    aria-label="Refresh pending count"
                                >
                                    <IconRefresh size={16} stroke={2} className="text-ink-muted" />
                                </button>
                            }
                        />

                        <SyncStatusCard
                            label="Status"
                            value={getSyncStatusDisplay()}
                            variant={getSyncStatusVariant()}
                        />
                    </div>
                )}

                {/* Actions */}
                {isLoggedIn && (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <LentoButton
                                onClick={handleSyncNow}
                                disabled={syncing}
                                className="flex items-center gap-2"
                            >
                                {syncing ? (
                                    <>
                                        <IconLoader2 size={18} stroke={2} className="animate-spin" />
                                        <span>Menyinkron...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconRefresh size={18} stroke={2} />
                                        <span>Sync Now</span>
                                    </>
                                )}
                            </LentoButton>

                            {/* Progressive disclosure: Auto-sync toggle (only when sync enabled) */}
                            {prefs.enabled && (
                                <label className="inline-flex items-center gap-2 text-small text-ink-muted cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={prefs.autoSync}
                                        onChange={(e) =>
                                            updatePrefs({ ...prefs, autoSync: e.target.checked })
                                        }
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <span>Auto-sync</span>
                                </label>
                            )}
                        </div>

                        {/* Error display with action */}
                        {error && (
                            <div className="p-3 bg-danger/5 border border-danger/20 rounded-xl">
                                <div className="flex items-start gap-2 mb-2">
                                    <IconAlertCircle size={16} stroke={2} className="text-danger flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-small text-danger font-medium mb-0.5">
                                            Gagal Sinkronisasi
                                        </p>
                                        <p className="text-tiny text-danger/90">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSyncNow}
                                        disabled={syncingLocal || syncing}
                                        className="text-tiny px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Success feedback - visual only, announced via persistent live region above */}
                        {!syncing && !syncingLocal && !error && prefs.lastSyncAt && (
                            <div
                                className="flex items-center gap-2 text-success text-small"
                            >
                                <IconCheck size={16} stroke={2} />
                                <span>Data tersinkronisasi</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Login Prompt Modal */}
            <LoginPromptModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSignIn={async () => {
                    const result = await onSignInWithGoogle()
                    if (result?.success) {
                        setShowLoginModal(false)
                    }
                }}
                loading={authLoading}
            />
        </section>
    )
}

export default SyncSection
