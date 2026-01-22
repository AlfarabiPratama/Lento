import { ResultBadge } from '../atoms/ResultBadge'
import { IconChevronRight } from '@tabler/icons-react'

/**
 * ResultRow - Single search result item
 */
export function ResultRow({ result, onClick, className = '' }) {
    const { doc, snippet } = result

    const formatMeta = () => {
        if (doc.module === 'finance' && doc.meta?.amount) {
            const sign = doc.meta.type === 'income' ? '+' : doc.meta.type === 'expense' ? '-' : ''
            return `${sign}Rp ${doc.meta.amount.toLocaleString('id-ID')}`
        }
        if (doc.module === 'pomodoro' && doc.meta?.duration_min) {
            return `${doc.meta.duration_min} menit`
        }
        if (doc.module === 'habit' && doc.meta?.streak) {
            return `🔥 ${doc.meta.streak} hari`
        }
        if (doc.module === 'book') {
            const parts = []
            if (doc.meta?.authors?.length) {
                parts.push(doc.meta.authors[0])
            }
            if (doc.meta?.status) {
                const statusLabels = { tbr: 'Belum', reading: 'Dibaca', finished: 'Selesai', dnf: 'Berhenti' }
                parts.push(statusLabels[doc.meta.status] || doc.meta.status)
            }
            return parts.join(' • ') || null
        }
        return null
    }

    const meta = formatMeta()

    return (
        <button
            onClick={() => onClick(result)}
            className={`
        w-full flex items-start gap-3 p-3 rounded-lg text-left
        hover:bg-paper-warm transition-colors group
        ${className}
      `}
        >
            <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-body font-medium text-ink truncate">
                        {doc.title}
                    </h4>
                    <ResultBadge module={doc.module} />
                </div>

                {/* Snippet */}
                {snippet && (
                    <p className="text-small text-ink-muted line-clamp-2 mb-1">
                        {snippet}
                    </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-2 text-tiny text-ink-muted">
                    {meta && (
                        <span className={doc.meta?.type === 'income' ? 'text-success' : doc.meta?.type === 'expense' ? 'text-danger' : ''}>
                            {meta}
                        </span>
                    )}
                    {doc.meta?.account_name && (
                        <span>• {doc.meta.account_name}</span>
                    )}
                    <span>
                        {new Date(doc.updated_at || doc.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                        })}
                    </span>
                </div>
            </div>

            <IconChevronRight
                size={18}
                stroke={1.5}
                className="text-ink-light group-hover:text-primary mt-1 shrink-0"
            />
        </button>
    )
}

export default ResultRow
