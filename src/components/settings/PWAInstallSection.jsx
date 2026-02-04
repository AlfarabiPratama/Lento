import { IconDownload, IconCheck, IconShare, IconPlus, IconDeviceMobile } from '@tabler/icons-react'
import { usePWAInstall } from '../../hooks/usePWAInstall'

/**
 * PWA Install Section for Settings
 * Manual install option for users who didn't get the automatic prompt
 */
export function PWAInstallSection() {
    const { isInstallable, isInstalled, promptInstall, platform } = usePWAInstall()

    // Don't show if already installed
    if (isInstalled) {
        return (
            <section className="space-y-4 card">
                <div className="flex items-center gap-3">
                    <div className="min-w-11 min-h-11 rounded-full bg-green-100 flex items-center justify-center">
                        <IconCheck size={20} className="text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-h3 text-ink">Lento Terinstall</h3>
                        <p className="text-small text-ink-muted">
                            Aplikasi sudah terpasang di perangkat Anda
                        </p>
                    </div>
                </div>
            </section>
        )
    }

    // iOS - Show manual instructions
    if (platform === 'ios') {
        return (
            <section className="space-y-4 card">
                <div className="flex items-center gap-3">
                    <div className="min-w-11 min-h-11 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconDeviceMobile size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-h3 text-ink">Install Lento (iOS)</h3>
                        <p className="text-small text-ink-muted">
                            Safari tidak mendukung install otomatis
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-paper-warm border border-line space-y-3">
                    <p className="text-small font-medium text-ink">Cara install di iPhone/iPad:</p>
                    
                    <ol className="space-y-3 text-small text-ink-muted">
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-tiny font-semibold">
                                1
                            </span>
                            <div className="flex-1">
                                <p>Tap tombol <IconShare size={16} className="inline -mt-0.5 mx-1" /> <strong>Share</strong> di bagian bawah Safari</p>
                            </div>
                        </li>
                        
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-tiny font-semibold">
                                2
                            </span>
                            <div className="flex-1">
                                <p>Scroll ke bawah dan tap <strong>"Add to Home Screen"</strong></p>
                            </div>
                        </li>
                        
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-tiny font-semibold">
                                3
                            </span>
                            <div className="flex-1">
                                <p>Tap <strong>"Add"</strong> di pojok kanan atas</p>
                            </div>
                        </li>
                        
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-tiny font-semibold">
                                4
                            </span>
                            <div className="flex-1">
                                <p>Lento akan muncul di home screen Anda! 🎉</p>
                            </div>
                        </li>
                    </ol>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-tiny text-ink-muted">
                            💡 <strong>Tips:</strong> Setelah install, buka Lento dari home screen untuk pengalaman fullscreen tanpa Safari UI
                        </p>
                    </div>
                </div>

                <div className="p-3 rounded-lg bg-paper-warm">
                    <p className="text-tiny text-ink-muted">
                        <strong>Keuntungan install PWA:</strong>
                    </p>
                    <ul className="mt-2 space-y-1 text-tiny text-ink-muted">
                        <li className="flex items-start gap-1.5">
                            <IconCheck size={14} className="text-success flex-shrink-0 mt-0.5" />
                            <span>Akses cepat dari home screen</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <IconCheck size={14} className="text-success flex-shrink-0 mt-0.5" />
                            <span>Fullscreen tanpa browser bar</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <IconCheck size={14} className="text-success flex-shrink-0 mt-0.5" />
                            <span>Bekerja offline</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <IconCheck size={14} className="text-success flex-shrink-0 mt-0.5" />
                            <span>Data tersimpan lokal</span>
                        </li>
                    </ul>
                </div>
            </section>
        )
    }

    // Android/Desktop - Show install button
    if (isInstallable) {
        return (
            <section className="space-y-4 card">
                <div className="flex items-center gap-3">
                    <div className="min-w-11 min-h-11 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconDownload size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-h3 text-ink">Install Aplikasi</h3>
                        <p className="text-small text-ink-muted">
                            Install Lento sebagai aplikasi standalone
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-paper-warm border border-line space-y-4">
                    <div>
                        <p className="text-small font-medium text-ink mb-3">Keuntungan install PWA:</p>
                        <ul className="space-y-2 text-small text-ink-muted">
                            <li className="flex items-center gap-2">
                                <IconCheck size={16} className="text-green-600 flex-shrink-0" />
                                <span>Akses cepat dari home screen/desktop</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <IconCheck size={16} className="text-green-600 flex-shrink-0" />
                                <span>Fullscreen tanpa browser bar</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <IconCheck size={16} className="text-green-600 flex-shrink-0" />
                                <span>Bekerja offline sepenuhnya</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <IconCheck size={16} className="text-green-600 flex-shrink-0" />
                                <span>Notifikasi push untuk reminder</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <IconCheck size={16} className="text-green-600 flex-shrink-0" />
                                <span>Lebih hemat data & baterai</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={promptInstall}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        <IconDownload size={20} stroke={2} />
                        <span>Install Sekarang</span>
                    </button>

                    <p className="text-tiny text-center text-ink-muted">
                        Gratis, tidak perlu download dari app store
                    </p>
                </div>
            </section>
        )
    }

    // Not installable - might be desktop browser that doesn't support PWA
    return (
        <section className="space-y-4 card">
            <div className="flex items-center gap-3">
                <div className="min-w-11 min-h-11 rounded-full bg-paper-warm flex items-center justify-center">
                    <IconDeviceMobile size={20} className="text-ink-muted" />
                </div>
                <div>
                    <h3 className="text-h3 text-ink">Install Aplikasi</h3>
                    <p className="text-small text-ink-muted">
                        Gunakan browser Chrome/Edge untuk install
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-paper-warm border border-line">
                <p className="text-small text-ink-muted">
                    Browser Anda saat ini tidak mendukung instalasi PWA. 
                    Untuk pengalaman terbaik, gunakan:
                </p>
                <ul className="mt-3 space-y-2 text-small text-ink-muted">
                    <li>• <strong>Mobile:</strong> Chrome, Edge, atau Samsung Internet</li>
                    <li>• <strong>Desktop:</strong> Chrome atau Edge</li>
                </ul>
                
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-tiny text-ink-muted">
                        💡 Safari desktop tidak mendukung PWA install. Gunakan Safari iOS untuk install di iPhone/iPad.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default PWAInstallSection
