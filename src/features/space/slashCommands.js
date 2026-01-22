import {
    IconH1, IconH2, IconH3,
    IconList, IconListNumbers, IconSquareCheck,
    IconCalendar, IconClock
} from '@tabler/icons-react'

// Perintah slash yang tersedia
export const SLASH_COMMANDS = [
    // --- BLOCKS ---
    {
        id: 'h1',
        label: 'Heading 1',
        description: 'Judul besar',
        icon: IconH1,
        command: '/h1',
        insert: '# ',
        group: 'Basic Blocks'
    },
    {
        id: 'h2',
        label: 'Heading 2',
        description: 'Judul sedang',
        icon: IconH2,
        command: '/h2',
        insert: '## ',
        group: 'Basic Blocks'
    },
    {
        id: 'h3',
        label: 'Heading 3',
        description: 'Judul kecil',
        icon: IconH3,
        command: '/h3',
        insert: '### ',
        group: 'Basic Blocks'
    },
    {
        id: 'todo',
        label: 'To-do List',
        description: 'Daftar tugas',
        icon: IconSquareCheck,
        command: '/todo',
        insert: '- [ ] ',
        group: 'Basic Blocks'
    },
    {
        id: 'bullet',
        label: 'Bullet List',
        description: 'Daftar poin',
        icon: IconList,
        command: '/bullet',
        insert: '- ',
        group: 'Basic Blocks'
    },
    {
        id: 'number',
        label: 'Numbered List',
        description: 'Daftar angka',
        icon: IconListNumbers,
        command: '/number',
        insert: '1. ',
        group: 'Basic Blocks'
    },
    // --- INSERT ---
    {
        id: 'date',
        label: 'Tanggal Hari Ini',
        description: 'Insert YYYY-MM-DD',
        icon: IconCalendar,
        command: '/date',
        // Dynamic insert logic handled in handler
        type: 'dynamic',
        group: 'Insert'
    },
    {
        id: 'time',
        label: 'Waktu Sekarang',
        description: 'Insert HH:mm',
        icon: IconClock,
        command: '/time',
        type: 'dynamic',
        group: 'Insert'
    }
]

/**
 * Filter perintah berdasarkan query
 */
export function getFilteredCommands(query) {
    // Note: query is whatever comes after '/'
    const cleanQuery = query.toLowerCase()

    return SLASH_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(cleanQuery) ||
        cmd.command.toLowerCase().includes(cleanQuery)
    )
}

/**
 * Mendapatkan text insert untuk dynamic commands
 */
export function getDynamicInsert(commandId) {
    const now = new Date()
    switch (commandId) {
        case 'date':
            return now.toISOString().split('T')[0]
        case 'time':
            return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        default:
            return ''
    }
}

export default {
    SLASH_COMMANDS,
    getFilteredCommands,
    getDynamicInsert
}
