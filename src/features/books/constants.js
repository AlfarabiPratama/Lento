import {
    IconBook,
    IconBook2,
    IconHeadphones,
    IconDeviceTablet,
    IconBookmark,
    IconBookmarkFilled,
    IconCircleCheck,
    IconX,
    IconClock,
    IconNote,
    IconQuote,
    IconHighlight
} from '@tabler/icons-react'

/**
 * Book Tracking Constants
 */

export const BOOK_FORMATS = {
    paper: {
        value: 'paper',
        label: 'Buku Fisik',
        icon: IconBook,
        defaultUnit: 'pages'
    },
    ebook: {
        value: 'ebook',
        label: 'E-book',
        icon: IconDeviceTablet,
        defaultUnit: 'pages'
    },
    audio: {
        value: 'audio',
        label: 'Audiobook',
        icon: IconHeadphones,
        defaultUnit: 'minutes'
    }
}

export const BOOK_STATUSES = {
    tbr: {
        value: 'tbr',
        label: 'Belum Dibaca',
        shortLabel: 'Belum',
        icon: IconBookmark,
        description: 'Belum dimulai'
    },
    reading: {
        value: 'reading',
        label: 'Sedang Dibaca',
        shortLabel: 'Dibaca',
        icon: IconBook2,
        description: 'Sedang dibaca'
    },
    finished: {
        value: 'finished',
        label: 'Selesai',
        shortLabel: 'Selesai',
        icon: IconCircleCheck,
        description: 'Sudah selesai'
    },
    dnf: {
        value: 'dnf',
        label: 'Tidak Selesai',
        shortLabel: 'Berhenti',
        icon: IconX,
        description: 'Tidak dilanjutkan'
    }
}

export const PROGRESS_UNITS = {
    pages: {
        value: 'pages',
        label: 'Halaman',
        singular: 'halaman',
        shortLabel: 'hal',
        presets: [5, 10, 20, 50]
    },
    minutes: {
        value: 'minutes',
        label: 'Menit',
        singular: 'menit',
        shortLabel: 'min',
        presets: [10, 20, 30, 60]
    }
}

export const SESSION_SOURCES = {
    manual: {
        value: 'manual',
        label: 'Manual',
        icon: IconNote
    },
    pomodoro: {
        value: 'pomodoro',
        label: 'Pomodoro',
        icon: IconClock
    },
    quickcapture: {
        value: 'quickcapture',
        label: 'Quick Capture',
        icon: IconNote
    }
}

export const NOTE_TYPES = {
    quote: {
        value: 'quote',
        label: 'Quote',
        icon: IconQuote
    },
    note: {
        value: 'note',
        label: 'Catatan',
        icon: IconNote
    },
    highlight: {
        value: 'highlight',
        label: 'Highlight',
        icon: IconHighlight
    }
}

// Helper functions
export function getFormatConfig(format) {
    return BOOK_FORMATS[format] || BOOK_FORMATS.paper
}

export function getStatusConfig(status) {
    return BOOK_STATUSES[status] || BOOK_STATUSES.tbr
}

export function getUnitConfig(unit) {
    return PROGRESS_UNITS[unit] || PROGRESS_UNITS.pages
}

export function formatProgress(current, total, unit) {
    const config = getUnitConfig(unit)

    if (total) {
        return `${current}/${total} ${config.shortLabel}`
    }

    return `${current} ${config.shortLabel}`
}

export function getProgressPercentage(current, total) {
    if (!total || total === 0) return null
    return Math.min(Math.round((current / total) * 100), 100)
}
