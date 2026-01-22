/**
 * Quick Capture Constants
 */

import {
    IconNotes,
    IconNotebook,
    IconWallet,
    IconCheckbox,
    IconClock,
    IconPlus,
    IconX,
    IconBook,
} from '@tabler/icons-react'

/**
 * Capture type configurations
 */
export const CAPTURE_CONFIG = {
    note: {
        id: 'note',
        label: 'Catatan',
        description: 'Tulis ide atau catatan cepat',
        icon: IconNotes,
        color: 'bg-blue-100 text-blue-700',
        route: '/space',
    },
    journal: {
        id: 'journal',
        label: 'Jurnal',
        description: 'Rekam perasaan hari ini',
        icon: IconNotebook,
        color: 'bg-purple-100 text-purple-700',
        route: '/journal',
    },
    transaction: {
        id: 'transaction',
        label: 'Transaksi',
        description: 'Catat pemasukan/pengeluaran',
        icon: IconWallet,
        color: 'bg-green-100 text-green-700',
        route: '/more/finance',
    },
    reading: {
        id: 'reading',
        label: 'Log Bacaan',
        description: 'Catat progress membaca',
        icon: IconBook,
        color: 'bg-teal-100 text-teal-700',
        route: null, // Handled specially - opens sheet
        useSheet: true,
    },
    habit: {
        id: 'habit',
        label: 'Kebiasaan',
        description: 'Tandai habit selesai',
        icon: IconCheckbox,
        color: 'bg-orange-100 text-orange-700',
        route: '/habits',
    },
    pomodoro: {
        id: 'pomodoro',
        label: 'Fokus',
        description: 'Mulai sesi fokus',
        icon: IconClock,
        color: 'bg-pink-100 text-pink-700',
        route: '/more/fokus',
    },
}

export const CAPTURE_ICONS = {
    plus: IconPlus,
    close: IconX,
}

/**
 * Get ordered capture types for menu
 */
export const CAPTURE_TYPES_ORDER = ['note', 'journal', 'transaction', 'reading', 'habit', 'pomodoro']

