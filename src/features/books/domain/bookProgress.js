import { updateBook } from '../../../lib/booksRepo.js'
import { createSession } from '../../../lib/bookSessionsRepo.js'

/**
 * Domain Logic: Book Progress Management
 */

/**
 * Safe percentage calculation - returns null if invalid
 * Prevents NaN% from displaying
 */
export function calcPercent(current, total) {
    if (current == null || isNaN(current)) return null
    if (!total || total <= 0 || isNaN(total)) return null
    const percent = Math.round((current / total) * 100)
    return Math.min(100, Math.max(0, percent))
}

/**
 * Clamp current progress within valid bounds
 */
export function clampProgress(value, total = null) {
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 0) return 0
    if (total && parsed > total) return total
    return parsed
}

/**
 * Format progress display string
 */
export function formatProgressDisplay(current, total, unit = 'pages') {
    const c = clampProgress(current, total)
    const unitLabel = unit === 'pages' ? 'hal' : 'min'

    if (total && total > 0) {
        const percent = calcPercent(c, total)
        return {
            text: `${c}/${total} ${unitLabel}`,
            percent: percent !== null ? `${percent}%` : '—%'
        }
    }

    return {
        text: `${c} ${unitLabel}`,
        percent: '—%'
    }
}

export function canLogSession(book) {
    if (book.status === 'tbr') return { allowed: true }
    if (book.status === 'reading') return { allowed: true }

    // Finished/DNF books: allowed but show prompt
    if (book.status === 'finished') {
        return {
            allowed: true,
            requiresPrompt: true,
            message: 'Membaca ulang? Sesi akan dicatat tanpa mengubah status selesai.'
        }
    }

    if (book.status === 'dnf') {
        return {
            allowed: true,
            requiresPrompt: true,
            message: 'Melanjutkan buku? Status akan berubah kembali ke "Sedang Dibaca".'
        }
    }

    return { allowed: false }
}

export async function applyBookProgress({ book, delta, unit, occurredAt, source = 'manual', note = null }) {
    // Validate delta
    if (delta <= 0) {
        throw new Error('Delta harus lebih dari 0')
    }

    // Check if logging is allowed
    const canLog = canLogSession(book)
    if (!canLog.allowed) {
        throw new Error('Tidak dapat mencatat sesi untuk buku ini')
    }

    // Check unit consistency (if already has sessions)
    const hasProgress = book.progress.current > 0
    if (hasProgress && unit !== book.progress.unit) {
        throw new Error('UNIT_MISMATCH')
    }

    // Auto-resume DNF
    let updates = {}
    if (book.status === 'dnf') {
        updates.status = 'reading'
    }

    // Auto-start TBR
    if (book.status === 'tbr') {
        updates.status = 'reading'
        updates.dates = { ...book.dates, startedAt: occurredAt }
    }

    // Update progress
    if (book.status === 'finished') {
        // Re-reading: add to total
        updates.progress = {
            ...book.progress,
            total: (book.progress.total || 0) + delta,
            current: (book.progress.current || 0) + delta
        }
    } else {
        // Normal reading: update current (clamp to total)
        const newCurrent = book.progress.current + delta
        const total = book.progress.total

        updates.progress = {
            ...book.progress,
            current: total ? Math.min(newCurrent, total) : newCurrent
        }

        // Check if finished
        if (total && newCurrent >= total) {
            return {
                type: 'prompt_finish',
                book,
                delta,
                unit,
                occurredAt,
                source,
                note,
                message: 'Progress mencapai total! Tandai sebagai selesai?'
            }
        }
    }

    // Create session
    const session = await createSession({
        bookId: book.id,
        delta,
        unit,
        occurredAt,
        source,
        note
    })

    // Update book
    const updatedBook = await updateBook(book.id, updates)

    return {
        type: 'success',
        book: updatedBook,
        session
    }
}

export async function markFinished(book) {
    const updates = {
        status: 'finished',
        dates: {
            ...book.dates,
            finishedAt: new Date().toISOString()
        },
        progress: {
            ...book.progress,
            current: book.progress.total || book.progress.current
        }
    }

    return await updateBook(book.id, updates)
}

export async function markDNF(book, reason = null) {
    const updates = {
        status: 'dnf'
    }

    const updatedBook = await updateBook(book.id, updates)

    // Save reason as book note for future insight/reflection
    if (reason) {
        const { saveDNFReason } = await import('../../../lib/bookNotesRepo.js')
        await saveDNFReason(book.id, reason)
    }

    return updatedBook
}
