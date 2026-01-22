/**
 * Lento Share Utility
 * 
 * Native Web Share API with clipboard fallback
 * IMPORTANT: Must be called from user gesture (click/tap)
 */

/**
 * Share content using native share or copy to clipboard
 * @param {{ title?: string, text?: string, url?: string, files?: File[] }} options
 * @returns {Promise<{ ok: boolean, method: 'share' | 'copy' | 'prompt' }>}
 */
export async function shareOrCopy({ title, text, url, files }) {
    // 1) Try native share (if available)
    try {
        if (navigator.share) {
            const data = { title, text, url }

            // Share files only if supported
            if (files?.length) {
                if (navigator.canShare && navigator.canShare({ files })) {
                    data.files = files
                }
            }

            await navigator.share(data)
            return { ok: true, method: 'share' }
        }
    } catch (err) {
        // User cancelled or not supported - fallback to copy
        if (err.name === 'AbortError') {
            return { ok: false, method: 'share' }
        }
    }

    // 2) Fallback: copy to clipboard
    const payload = [title, text, url].filter(Boolean).join('\n\n')
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(payload)
            return { ok: true, method: 'copy' }
        }
    } catch (err) {
        // Clipboard not available - fallback to prompt
    }

    // 3) Last resort: prompt dialog
    window.prompt('Salin teks ini:', payload)
    return { ok: true, method: 'prompt' }
}

/**
 * Check if native share is available
 */
export function canShare() {
    return typeof navigator !== 'undefined' && !!navigator.share
}

/**
 * Build share text for budget summary
 */
export function buildBudgetShareText({ monthLabel, totalBudgeted, totalSpent, remaining, topCategories = [] }) {
    const top = topCategories
        .slice(0, 3)
        .map(c => `- ${c.name}: Rp ${c.spent?.toLocaleString('id-ID') || 0} / Rp ${c.budget?.toLocaleString('id-ID') || 0}`)
        .join('\n')

    return `Lento — Ringkasan Budget (${monthLabel})

Total Budget: Rp ${totalBudgeted.toLocaleString('id-ID')}
Terpakai: Rp ${totalSpent.toLocaleString('id-ID')}
Sisa: Rp ${remaining.toLocaleString('id-ID')}
${top ? `\nTop kategori:\n${top}` : ''}

Less rush. More rhythm.`
}

/**
 * Build share text for finance insights
 */
export function buildInsightsShareText({ monthLabel, income, expense, balance }) {
    const status = balance >= 0 ? '✅ Surplus' : '⚠️ Defisit'

    return `Lento — Keuangan (${monthLabel})

Pemasukan: Rp ${income.toLocaleString('id-ID')}
Pengeluaran: Rp ${expense.toLocaleString('id-ID')}
Selisih: Rp ${balance.toLocaleString('id-ID')} ${status}

Less rush. More rhythm.`
}

/**
 * Build share text for journal entry
 */
export function buildJournalShareText({ date, mood, content }) {
    const dateStr = new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return `Jurnal — ${dateStr}
${mood ? `Mood: ${mood}` : ''}

${content}

— Lento`
}

/**
 * Build share text for space note
 */
export function buildNoteShareText({ title, content }) {
    const snippet = content.length > 200 ? content.slice(0, 200) + '...' : content

    return `${title}

${snippet}

— Lento`
}
