import { useNavigate, Navigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useResponsive } from '../hooks/useResponsive'
import {
    IconWallet,
    IconFocus2,
    IconTarget,
    IconSettings,
    IconNotebook,
    IconRepeat,
    IconMoon,
    IconBook,
    IconCalendar,
    IconChartBar
} from '@tabler/icons-react'

/**
 * More - Feature discovery page (Mobile only)
 * Desktop users are redirected to homepage
 */
function More() {
    const navigate = useNavigate()
    const { isDark, toggle } = useTheme()
    const { isDesktop } = useResponsive()

    // Redirect desktop users to homepage
    if (isDesktop) {
        return <Navigate to="/" replace />
    }

    const menuItems = [
        {
            id: 'calendar',
            title: 'Kalender',
            icon: IconCalendar,
            path: '/calendar'
        },
        {
            id: 'stats',
            title: 'Statistik',
            icon: IconChartBar,
            path: '/stats'
        },
        {
            id: 'journal',
            title: 'Jurnal',
            icon: IconNotebook,
            path: '/journal'
        },
        {
            id: 'habits',
            title: 'Kebiasaan',
            icon: IconRepeat,
            path: '/habits'
        },
        {
            id: 'books',
            title: 'Buku',
            icon: IconBook,
            path: '/books'
        },
        {
            id: 'finance',
            title: 'Keuangan',
            icon: IconWallet,
            path: '/more/finance'
        },
        {
            id: 'fokus',
            title: 'Fokus',
            icon: IconFocus2,
            path: '/more/fokus'
        },
        {
            id: 'target',
            title: 'Target',
            icon: IconTarget,
            path: '/more/goals'
        },
        {
            id: 'settings',
            title: 'Pengaturan',
            icon: IconSettings,
            path: '/settings'
        }
    ]

    return (
        <div className="max-w-narrow mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-h1 text-ink">Menu Lainnya</h1>
                <p className="text-small text-ink-muted mt-1">Akses cepat ke fitur dan pengaturan</p>
            </header>

            {/* Menu Grid */}
            <section className="grid grid-cols-3 gap-3">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className="card p-4 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            aria-label={`Buka ${item.title}`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Icon size={24} stroke={1.5} className="text-primary" />
                            </div>
                            <span className="text-small text-ink font-medium text-center">{item.title}</span>
                        </button>
                    )
                })}
            </section>

            {/* Quick Dark Mode Toggle */}
            <section className="card">
                <button
                    onClick={toggle}
                    className="w-full flex items-center gap-3 p-4 hover:bg-paper-warm rounded-lg transition-colors"
                    aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                >
                    <div className="min-w-11 min-h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconMoon size={20} stroke={1.5} className="text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-body text-ink font-medium">Mode Malam</p>
                        <p className="text-small text-ink-muted">Tekan untuk beralih</p>
                    </div>
                    <div className={`
                        relative w-12 h-6 rounded-full transition-colors
                        ${isDark ? 'bg-primary' : 'bg-line'}
                    `}>
                        <div className={`
                            absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                            transition-transform duration-200
                            ${isDark ? 'translate-x-6' : 'translate-x-0.5'}
                        `} />
                    </div>
                </button>
            </section>

            {/* Footer Links */}
            <section className="text-center space-y-2">
                <button
                    onClick={() => navigate('/settings#tentang')}
                    className="text-small text-ink-muted hover:text-primary transition-colors"
                >
                    Tentang / Untuk Konektivitas
                </button>
                <p className="text-tiny text-ink-light">Versi 0.1.0</p>
            </section>
        </div>
    )
}

export default More
