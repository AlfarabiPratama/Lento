import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    IconDownload,
    IconUpload,
    IconCheck,
    IconAlertCircle,
    IconLoader2,
    IconSun,
    IconMoon,
    IconDeviceDesktop,
    IconCloud,
    IconCloudOff,
    IconUser,
    IconLogout,
    IconRefresh,
    IconSettings,
    IconArrowLeft,
    IconFileSpreadsheet,
    IconChevronDown,
    IconShield,
    IconShieldCheck,
    IconDatabase,
    IconBell,
    IconClock,
    IconPlus,
    IconHeadphones,
} from '@tabler/icons-react'
import { downloadExport, readImportFile, importData, validateImportData, SCHEMA_VERSION, exportStoreAsCSV, getExportableStores, getImportPreview } from '../lib/dataExport'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useSync } from '../hooks/useSync'
import { useSyncPrefs } from '../hooks/useSyncPrefs'
import { usePendingCount } from '../hooks/usePendingCount'
import { useDensity, UI_DENSITY } from '../hooks/useDensity'
import { useAppPrefs } from '../hooks/useAppPrefs'
import { useToast } from '../contexts/ToastContext'
import { haptics } from '../utils/haptics'
import { requestPersistentStorage, getStorageHealth } from '../lib/storage'
import { getNotificationPermission, requestNotificationPermission } from '../features/reminders/notificationService'
import { AccountSection } from '../components/settings/AccountSection'
import { SyncSection } from '../components/settings/SyncSection'
import { SettingsTabBar, VALID_TABS, DEFAULT_TAB } from '../components/settings/SettingsTabBar'
import { NotificationSettings } from '../components/settings/NotificationSettings'
import { PWAInstallSection } from '../components/settings/PWAInstallSection'
import NotificationMetrics from '../components/settings/NotificationMetrics'

/**
 * Settings - App configuration and preferences
 */
function Settings() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // URL-based tab state
    const tabFromUrl = searchParams.get('tab')
    const activeTab = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : DEFAULT_TAB

    // Set default tab on mount/invalid (replace, not push)
    useEffect(() => {
        if (!VALID_TABS.includes(tabFromUrl)) {
            setSearchParams({ tab: DEFAULT_TAB }, { replace: true })
        }
    }, [tabFromUrl, setSearchParams])

    const handleTabChange = (tabId) => {
        // Push to history (user action = undoable)
        setSearchParams({ tab: tabId })
    }

    const themeHook = useTheme()
    const mode = themeHook?.mode || 'system'
    const setMode = themeHook?.setMode || (() => {})
    const isDark = themeHook?.isDark || false
    
    const {
        user,
        loading: authLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        setupRecaptcha,
        sendPhoneOTP,
        verifyPhoneOTP,
        hasOTPPending,
        signOut,
        isAuthenticated,
        isConfigured
    } = useAuth()
    const { sync, syncing, lastSync, error: syncError } = useSync()
    const { prefs, updatePrefs, updatePrefsImmediate, markSyncedNow, saveError } = useSyncPrefs()
    const { count: pendingCount, refresh: refreshPendingCount } = usePendingCount()
    const { showToast } = useToast()
    const densityHook = useDensity()
    const density = densityHook?.density || UI_DENSITY.COZY
    const setDensity = densityHook?.setDensity || (() => {})
    const appPrefsHook = useAppPrefs()
    const appPrefs = appPrefsHook?.prefs || {}
    const togglePref = appPrefsHook?.togglePref || (() => {})
    const [exportStatus, setExportStatus] = useState(null)
    const [importStatus, setImportStatus] = useState(null)
    const [importResult, setImportResult] = useState(null)
    const [importMode, setImportMode] = useState('merge')
    const [previewData, setPreviewData] = useState(null)
    const [showCSVOptions, setShowCSVOptions] = useState(false)
    const [csvExporting, setCSVExporting] = useState(null)
    const [storageHealth, setStorageHealth] = useState(null)
    const [requestingPersist, setRequestingPersist] = useState(false)
    const fileInputRef = useRef(null)

    // Display name (local-only, stored in localStorage)
    const [displayName, setDisplayName] = useState(
        () => localStorage.getItem('lento.profile.displayName') || ''
    )

    // Load storage health on mount
    useEffect(() => {
        getStorageHealth().then(setStorageHealth)
    }, [])

    /**
     * Monitor saveError and show toast
     * QuotaExceededError is critical for toggles - user needs to know immediately
     */
    useEffect(() => {
        if (saveError) {
            if (saveError.error === 'quota_exceeded') {
                showToast('error', saveError.message)
            } else {
                showToast('warning', saveError.message)
            }
        }
    }, [saveError, showToast])

    /**
     * Save display name to localStorage
     */
    const handleDisplayNameChange = (value) => {
        setDisplayName(value)
        try {
            localStorage.setItem('lento.profile.displayName', value)
        } catch (error) {
            console.error('Failed to save display name:', error)
            if (error.name === 'QuotaExceededError') {
                showToast('error', 'Penyimpanan penuh. Gagal menyimpan nama.')
            }
        }
    }

    /**
     * Navigate to auth page with return path
     */
    const handleNavigateToAuth = () => {
        navigate('/auth?next=/settings#sync')
    }

    /**
     * Handle sync action
     * CRITICAL: Mark synced ONLY after actual sync succeeds
     */
    const handleSync = async () => {
        try {
            const result = await sync()
            if (result?.success) {
                markSyncedNow()
                showToast('success', 'Data berhasil tersinkronisasi')
            } else {
                showToast('error', result?.error || 'Gagal sync')
            }
        } catch (error) {
            showToast('error', 'Gagal sync: ' + error.message)
        }
    }

    /**
     * Handle sign out with edge-case handling
     * Disable sync and warn about pending changes
     */
    const handleSignOut = async () => {
        try {
            // Check for pending changes
            if (pendingCount > 0) {
                const confirmed = window.confirm(
                    `Ada ${pendingCount} perubahan belum tersinkronisasi. Yakin keluar?`
                )
                if (!confirmed) return
            }

            // Disable sync when signing out
            if (prefs.enabled) {
                updatePrefsImmediate({ ...prefs, enabled: false })
                showToast('info', 'Sync dimatikan karena logout')
            }

            await signOut()
            showToast('success', 'Berhasil keluar')
        } catch (error) {
            console.error('Sign out error:', error)
            showToast('error', 'Gagal keluar')
        }
    }

    /**
     * Handle Google Sign-In with error handling
     */
    const handleSignInWithGoogle = async () => {
        try {
            const result = await signInWithGoogle()
            if (result.success) {
                showToast('success', `Selamat datang, ${result.user.displayName || result.user.email}!`)
            } else {
                showToast('error', result.message || 'Gagal masuk dengan Google')
            }
        } catch (error) {
            console.error('Google sign-in error:', error)
            showToast('error', error.message || 'Gagal masuk dengan Google')
        }
    }

    const handleRequestPersist = async () => {
        setRequestingPersist(true)
        try {
            const result = await requestPersistentStorage()
            showToast(result.persisted ? 'success' : 'warning', result.message)
            // Refresh health status
            const health = await getStorageHealth()
            setStorageHealth(health)
        } catch (error) {
            showToast('error', 'Gagal meminta proteksi storage')
        } finally {
            setRequestingPersist(false)
        }
    }

    const handleExport = async () => {
        try {
            setExportStatus('loading')
            const result = await downloadExport()

            if (result.cancelled) {
                // User cancelled file picker
                setExportStatus(null)
                return
            }

            setExportStatus('success')
            showToast('success', 'Backup berhasil diunduh!')
            setTimeout(() => setExportStatus(null), 3000)
        } catch (error) {
            console.error('Export error:', error)
            setExportStatus('error')
            showToast('error', 'Gagal mengekspor data')
            setTimeout(() => setExportStatus(null), 3000)
        }
    }

    const handleCSVExport = async (storeId, label) => {
        try {
            setCSVExporting(storeId)
            const result = await exportStoreAsCSV(storeId)
            if (result.success) {
                showToast('success', `${label} diekspor (${result.count} item)`)
            } else {
                showToast('error', result.error || 'Tidak ada data')
            }
        } catch (error) {
            console.error('CSV export error:', error)
            showToast('error', 'Gagal mengekspor CSV')
        } finally {
            setCSVExporting(null)
        }
    }

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setImportStatus('validating')
            const data = await readImportFile(file)
            const validation = validateImportData(data)

            if (!validation.valid) {
                setImportStatus('error')
                setImportResult({ error: validation.error })
                return
            }

            setPreviewData(data)
            setImportStatus('preview')
        } catch (error) {
            console.error('Import error:', error)
            setImportStatus('error')
            setImportResult({ error: error.message })
        }
    }

    const handleImport = async () => {
        if (!previewData) return

        try {
            setImportStatus('importing')
            const result = await importData(previewData, importMode === 'replace')
            setImportStatus('success')
            setImportResult(result)
            setPreviewData(null)

            setTimeout(() => {
                setImportStatus(null)
                setImportResult(null)
                window.location.reload()
            }, 2000)
        } catch (error) {
            console.error('Import error:', error)
            setImportStatus('error')
            setImportResult({ error: error.message })
        }
    }

    const handleCancelImport = () => {
        setPreviewData(null)
        setImportStatus(null)
        setImportResult(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const themeOptions = [
        { value: 'light', label: 'Terang', icon: IconSun },
        { value: 'dark', label: 'Gelap', icon: IconMoon },
        { value: 'system', label: 'Sistem', icon: IconDeviceDesktop },
    ]

    return (
        <div className="flex flex-col -mt-5 lg:-mt-6 overflow-x-hidden">
            {/* Header with back button */}
            <header className="shrink-0 flex items-center gap-4 py-3">
                <button
                    onClick={() => navigate('/more')}
                    className="flex items-center justify-center min-w-11 min-h-11 transition-colors rounded-lg hover:bg-paper-warm"
                    aria-label="Kembali"
                >
                    <IconArrowLeft size={24} stroke={2} className="text-ink" />
                </button>
                <div>
                    <h1 className="text-h1 text-ink">Pengaturan</h1>
                    <p className="text-small text-ink-muted">Konfigurasi & preferensi aplikasi</p>
                </div>
            </header>

            {/* Tab bar (ARIA tabs) */}
            <div className="-mx-4 lg:-mx-6">
                <SettingsTabBar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>

            {/* Panel container */}
            <div className="mt-4 space-y-6">
                <section
                    role="tabpanel"
                    id="panel-tampilan"
                    aria-labelledby="tab-tampilan"
                    hidden={activeTab !== 'tampilan'}
                    className="space-y-6"
                >
                    <NotificationSettings />
                    
                    <NotificationMetrics />

                    {/* PWA Install Section */}
                    <PWAInstallSection />

                    {/* Tampilan Section */}
                    <section id="tampilan" className="space-y-4 card">
                        <h2 className="text-h2 text-ink">Tampilan</h2>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {isDark ? (
                                    <IconMoon size={20} stroke={1.5} className="text-ink-muted" />
                                ) : (
                                    <IconSun size={20} stroke={1.5} className="text-ink-muted" />
                                )}
                                <div>
                                    <p className="text-h3 text-ink">Tema</p>
                                    <p className="text-small text-ink-muted">Pilih tampilan yang nyaman</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {themeOptions.map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => {
                                            try {
                                                setMode(value)
                                            } catch (error) {
                                                console.error('Failed to set theme:', error)
                                                showToast('error', 'Gagal mengubah tema')
                                            }
                                        }}
                                        className={`
                                    p-3 rounded-lg border-2 transition-all
                                    flex flex-col items-center gap-2
                                    ${mode === value
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-line hover:border-primary/50 text-ink-muted hover:text-ink'
                                            }
                                `}
                                        aria-label={`Pilih tema ${label}`}
                                        aria-pressed={mode === value}
                                    >
                                        <Icon size={24} stroke={1.5} />
                                        <span className="font-medium text-small">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Density toggle */}
                        <div className="lento-section-gap">
                            <label className="block text-small font-medium text-ink-muted mb-2">
                                Kepadatan Tampilan
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            setDensity(UI_DENSITY.COZY)
                                        } catch (error) {
                                            console.error('Failed to set density:', error)
                                            showToast('error', 'Gagal mengubah kepadatan tampilan')
                                        }
                                    }}
                                    className={`
                                px-4 py-3 rounded-xl border-2 transition-all
                                flex flex-col items-start gap-1
                                ${density === UI_DENSITY.COZY
                                            ? 'border-primary bg-primary/5'
                                            : 'border-line hover:border-primary/30'
                                        }
                            `}
                                    aria-pressed={density === UI_DENSITY.COZY}
                                    aria-label="Mode nyaman"
                                >
                                    <span className={`text-body font-medium ${density === UI_DENSITY.COZY ? 'text-primary' : 'text-ink'
                                        }`}>
                                        Nyaman
                                    </span>
                                    <span className="text-tiny text-ink-muted">
                                        Spacing lega
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            setDensity(UI_DENSITY.COMPACT)
                                        } catch (error) {
                                            console.error('Failed to set density:', error)
                                            showToast('error', 'Gagal mengubah kepadatan tampilan')
                                        }
                                    }}
                                    className={`
                                px-4 py-3 rounded-xl border-2 transition-all
                                flex flex-col items-start gap-1
                                ${density === UI_DENSITY.COMPACT
                                            ? 'border-primary bg-primary/5'
                                            : 'border-line hover:border-primary/30'
                                        }
                            `}
                                    aria-pressed={density === UI_DENSITY.COMPACT}
                                    aria-label="Mode ringkas"
                                >
                                    <span className={`text-body font-medium ${density === UI_DENSITY.COMPACT ? 'text-primary' : 'text-ink'
                                        }`}>
                                        Ringkas
                                    </span>
                                    <span className="text-tiny text-ink-muted">
                                        Lebih padat
                                    </span>
                                </button>
                            </div>

                            <p className="text-tiny text-ink-muted mt-2">
                            </p>
                        </div>

                        {/* Floating Buttons */}
                        <div className="lento-section-gap">
                            <label className="block text-small font-medium text-ink-muted mb-2">
                                Tombol Cepat (FAB)
                            </label>

                            <div className="space-y-3">
                                {/* Quick Capture FAB toggle */}
                                <label className="flex items-center justify-between p-3 rounded-xl border border-line hover:border-primary/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="min-w-11 min-h-11 rounded-full bg-primary flex items-center justify-center text-white">
                                            <IconPlus size={20} />
                                        </div>
                                        <div>
                                            <span className="block text-body text-ink">Tambah Cepat</span>
                                            <span className="text-tiny text-ink-muted">Tombol + di pojok kanan</span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={appPrefs.showQuickCaptureFab}
                                        onChange={() => {
                                            haptics.light()
                                            togglePref('showQuickCaptureFab')
                                        }}
                                        className="toggle-checkbox"
                                    />
                                </label>

                                {/* Soundscapes FAB toggle */}
                                <label className="flex items-center justify-between p-3 rounded-xl border border-line hover:border-primary/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="min-w-11 min-h-11 rounded-full bg-paper border-2 border-line flex items-center justify-center text-ink">
                                            <IconHeadphones size={20} />
                                        </div>
                                        <div>
                                            <span className="block text-body text-ink">Soundscapes</span>
                                            <span className="text-tiny text-ink-muted">Tombol 🎧 untuk musik fokus</span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={appPrefs.showSoundscapesFab}
                                        onChange={() => {
                                            haptics.light()
                                            togglePref('showSoundscapesFab')
                                        }}
                                        className="toggle-checkbox"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Notification Permission */}
                        <div className="lento-section-gap">
                            <label className="block text-small font-medium text-ink-muted mb-2">
                                Notifikasi
                            </label>

                            <div className="p-4 rounded-xl border border-line space-y-3">
                                {getNotificationPermission() === 'granted' ? (
                                    <div className="flex items-center gap-3 text-green-600">
                                        <div className="min-w-11 min-h-11 rounded-full bg-green-100 flex items-center justify-center">
                                            <IconCheck size={18} />
                                        </div>
                                        <div>
                                            <span className="block text-body text-ink">Notifikasi Aktif</span>
                                            <span className="text-tiny text-ink-muted">Reminder habit akan muncul sebagai notifikasi</span>
                                        </div>
                                    </div>
                                ) : getNotificationPermission() === 'denied' ? (
                                    <div className="flex items-center gap-3 text-ink-muted">
                                        <div className="min-w-11 min-h-11 rounded-full bg-paper-warm flex items-center justify-center">
                                            <IconBell size={18} />
                                        </div>
                                        <div>
                                            <span className="block text-body text-ink">Notifikasi Diblokir</span>
                                            <span className="text-tiny text-ink-muted">
                                                Ubah di pengaturan browser untuk mengaktifkan
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="min-w-11 min-h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <IconBell size={18} />
                                            </div>
                                            <div>
                                                <span className="block text-body text-ink">Aktifkan Notifikasi</span>
                                                <span className="text-tiny text-ink-muted">Terima pengingat habit di luar app</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const result = await requestNotificationPermission()
                                                if (result === 'granted') {
                                                    showToast('success', 'Notifikasi diaktifkan!')
                                                }
                                            }}
                                            className="btn-primary btn-sm"
                                        >
                                            Aktifkan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </section>

                {/* Akun Panel */}
                <section
                    role="tabpanel"
                    id="panel-akun"
                    aria-labelledby="tab-akun"
                    hidden={activeTab !== 'akun'}
                    className="space-y-6"
                >
                    <AccountSection
                        user={user}
                        isLoggedIn={isAuthenticated}
                        displayName={displayName}
                        onDisplayNameChange={handleDisplayNameChange}
                        onSignInWithGoogle={handleSignInWithGoogle}
                        onSignInWithEmail={signInWithEmail}
                        onSignUpWithEmail={signUpWithEmail}
                        onSetupRecaptcha={setupRecaptcha}
                        onSendPhoneOTP={sendPhoneOTP}
                        onVerifyPhoneOTP={verifyPhoneOTP}
                        hasOTPPending={hasOTPPending}
                        onSignOut={handleSignOut}
                        loading={authLoading}
                    />
                </section>

                {/* Sync Panel */}
                <section
                    role="tabpanel"
                    id="panel-sync"
                    aria-labelledby="tab-sync"
                    hidden={activeTab !== 'sync'}
                    className="space-y-6"
                >
                    <SyncSection
                        prefs={prefs}
                        updatePrefs={updatePrefs}
                        updatePrefsImmediate={updatePrefsImmediate}
                        pendingCount={pendingCount}
                        onRefreshPending={refreshPendingCount}
                        syncStatus={{ syncing, error: syncError, lastSync }}
                        onSync={handleSync}
                        isLoggedIn={isAuthenticated}
                        onSignInWithGoogle={handleSignInWithGoogle}
                        authLoading={authLoading}
                        saveError={saveError}
                        onDismissSaveError={() => {
                            // Trigger re-render by calling updatePrefs (no-op but clears error)
                            // Error is cleared automatically on next successful save
                        }}
                    />
                </section>

                {/* Data Panel */}
                <section
                    role="tabpanel"
                    id="panel-data"
                    aria-labelledby="tab-data"
                    hidden={activeTab !== 'data'}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <h2 className="text-h2 text-ink">Data & Backup</h2>

                        {/* Backup & Restore */}
                        <div className="space-y-4 card">
                            <div>
                                <h3 className="text-h3 text-ink">Backup & Restore</h3>
                                <p className="mt-1 text-small text-ink-muted">
                                    Schema v{SCHEMA_VERSION}
                                </p>
                            </div>

                            {/* Storage Protection */}
                            <div className="p-3 rounded-lg bg-paper-warm">
                                <div className="flex items-center gap-3 mb-2">
                                    <IconDatabase size={20} stroke={1.5} className="text-ink-muted" />
                                    <div className="flex-1">
                                        <p className="font-medium text-body text-ink">Proteksi Data Offline</p>
                                        <p className="text-tiny text-ink-muted">
                                            {storageHealth?.persisted
                                                ? 'Data dilindungi dari penghapusan otomatis'
                                                : 'Data bisa dihapus browser saat storage penuh'}
                                        </p>
                                    </div>
                                </div>

                                {storageHealth && (
                                    <div className="flex items-center justify-between mb-2 text-tiny text-ink-muted">
                                        <span>Storage: {storageHealth.usageText} / {storageHealth.quotaText}</span>
                                        <span className={storageHealth.critical ? 'text-red-500' : storageHealth.warning ? 'text-amber-500' : 'text-success'}>
                                            {storageHealth.percent}% terpakai
                                        </span>
                                    </div>
                                )}

                                {!storageHealth?.persisted && (
                                    <button
                                        onClick={handleRequestPersist}
                                        disabled={requestingPersist}
                                        className="flex items-center justify-center w-full gap-2 btn-secondary text-small"
                                    >
                                        {requestingPersist ? (
                                            <IconLoader2 size={16} className="animate-spin" />
                                        ) : (
                                            <IconShield size={16} />
                                        )}
                                        <span>Lindungi Data Offline</span>
                                    </button>
                                )}

                                {storageHealth?.persisted && (
                                    <div className="flex items-center gap-2 text-small text-success">
                                        <IconShieldCheck size={16} />
                                        <span>Data terlindungi</span>
                                    </div>
                                )}
                            </div>

                            {/* Export */}
                            <div>
                                <div className="flex items-start gap-3 mb-2">
                                    <IconDownload size={20} stroke={1.5} className="text-ink-muted mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-body text-ink">Ekspor Data</p>
                                        <p className="text-small text-ink-muted">Download semua data sebagai file JSON</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleExport}
                                    disabled={exportStatus === 'loading'}
                                    className="flex items-center justify-center w-full gap-2 btn-secondary"
                                    aria-label="Ekspor semua data"
                                >
                                    {exportStatus === 'loading' ? (
                                        <>
                                            <IconLoader2 size={18} stroke={2} className="animate-spin" />
                                            <span>Ekspor...</span>
                                        </>
                                    ) : exportStatus === 'success' ? (
                                        <>
                                            <IconCheck size={18} stroke={2} className="text-success" />
                                            <span>Berhasil!</span>
                                        </>
                                    ) : (
                                        <>
                                            <IconDownload size={18} stroke={2} />
                                            <span>Ekspor Full Backup</span>
                                        </>
                                    )}
                                </button>

                                {/* CSV Export Options */}
                                <div className="mt-3">
                                    <button
                                        onClick={() => setShowCSVOptions(!showCSVOptions)}
                                        className="flex items-center gap-2 transition-colors text-small text-ink-muted hover:text-ink"
                                    >
                                        <IconFileSpreadsheet size={16} stroke={2} />
                                        <span>Ekspor sebagai CSV</span>
                                        <IconChevronDown
                                            size={14}
                                            className={`transition-transform ${showCSVOptions ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {showCSVOptions && (
                                        <div className="p-3 mt-2 space-y-2 rounded-lg bg-paper-warm">
                                            <p className="mb-2 text-tiny text-ink-muted">Pilih data untuk diekspor:</p>
                                            {getExportableStores().map(store => (
                                                <button
                                                    key={store.id}
                                                    onClick={() => handleCSVExport(store.id, store.label)}
                                                    disabled={csvExporting === store.id}
                                                    className="flex items-center w-full gap-2 p-2 text-left transition-colors rounded-lg hover:bg-surface"
                                                >
                                                    <span>{store.icon}</span>
                                                    <span className="flex-1 text-small text-ink">{store.label}</span>
                                                    {csvExporting === store.id ? (
                                                        <IconLoader2 size={14} className="animate-spin text-primary" />
                                                    ) : (
                                                        <IconDownload size={14} className="text-ink-muted" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Import */}
                            <div>
                                <div className="flex items-start gap-3 mb-2">
                                    <IconUpload size={20} stroke={1.5} className="text-ink-muted mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-body text-ink">Impor Data</p>
                                        <p className="text-small text-ink-muted">Pulihkan dari file backup</p>
                                    </div>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    aria-label="Pilih file backup untuk diimpor"
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={importStatus === 'validating' || importStatus === 'importing'}
                                    className="flex items-center justify-center w-full gap-2 btn-secondary"
                                    aria-label="Pilih file untuk diimpor"
                                >
                                    {importStatus === 'validating' || importStatus === 'importing' ? (
                                        <>
                                            <IconLoader2 size={18} stroke={2} className="animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IconUpload size={18} stroke={2} />
                                            <span>Pilih File</span>
                                        </>
                                    )}
                                </button>

                                {/* Import Preview/Result */}
                                {importStatus && importStatus !== 'validating' && (
                                    <div className="p-3 mt-3 space-y-3 border rounded-lg border-line">
                                        {importStatus === 'preview' && previewData && (
                                            <>
                                                <div>
                                                    <p className="mb-2 font-medium text-small text-ink">Preview Data:</p>
                                                    <div className="grid grid-cols-2 gap-1 text-tiny text-ink-muted">
                                                        {Object.entries(getImportPreview(previewData) || {}).slice(0, 8).map(([store, count]) => (
                                                            <p key={store}>• {store}: {count}</p>
                                                        ))}
                                                    </div>
                                                    {Object.keys(getImportPreview(previewData) || {}).length > 8 && (
                                                        <p className="mt-1 text-tiny text-ink-light">
                                                            +{Object.keys(getImportPreview(previewData) || {}).length - 8} lainnya
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-small text-ink">Mode Import:</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => setImportMode('merge')}
                                                            className={`px-3 py-2 rounded-lg border text-small ${importMode === 'merge'
                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                : 'border-line text-ink-muted'
                                                                }`}
                                                        >
                                                            Gabung
                                                        </button>
                                                        <button
                                                            onClick={() => setImportMode('replace')}
                                                            className={`px-3 py-2 rounded-lg border text-small ${importMode === 'replace'
                                                                ? 'border-danger bg-danger/10 text-danger'
                                                                : 'border-line text-ink-muted'
                                                                }`}
                                                        >
                                                            Ganti
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleCancelImport}
                                                        className="flex-1 btn-secondary"
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        onClick={handleImport}
                                                        className="flex-1 btn-primary"
                                                    >
                                                        Import
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {importStatus === 'success' && importResult && (
                                            <div className="flex items-center gap-2 text-success">
                                                <IconCheck size={18} stroke={2} />
                                                <span className="text-small">Import berhasil!</span>
                                            </div>
                                        )}

                                        {importStatus === 'error' && importResult?.error && (
                                            <div className="flex items-start gap-2 text-danger">
                                                <IconAlertCircle size={18} stroke={2} className="mt-0.5 shrink-0" />
                                                <span className="text-small">{importResult.error}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tentang Panel */}
                <section
                    role="tabpanel"
                    id="panel-tentang"
                    aria-labelledby="tab-tentang"
                    hidden={activeTab !== 'tentang'}
                    className="space-y-6"
                >
                    <div className="space-y-4 card">
                        <h2 className="text-h2 text-ink">Tentang</h2>

                        <div className="flex flex-col items-center gap-4 py-4">
                            <img
                                src={isDark
                                    ? "/Lento_Logo_Pack_Calm_v1/svg/lento_lockup_stacked_id_white.svg"
                                    : "/Lento_Logo_Pack_Calm_v1/svg/lento_lockup_stacked_id_full.svg"
                                }
                                alt="Lento"
                                className="h-24"
                            />
                            <div className="text-center">
                                <p className="text-small text-ink-muted">Lebih tenang. Lebih bermakna.</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-center">
                            <div className="p-3 rounded-lg bg-paper-warm">
                                <p className="text-tiny text-ink-muted">Versi</p>
                                <p className="font-semibold text-body text-ink">0.1.0</p>
                            </div>

                            <div className="p-3 rounded-lg bg-paper-warm">
                                <p className="text-tiny text-ink-muted">Made by</p>
                                <p className="font-semibold text-body text-ink">Alfarabi</p>
                            </div>

                            <button
                                disabled
                                className="w-full p-3 border rounded-lg cursor-not-allowed border-line text-ink-muted"
                                aria-label="Privacy Policy (segera hadir)"
                            >
                                <p className="text-small">Privacy Policy</p>
                                <p className="text-tiny opacity-60">Segera hadir</p>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Settings
