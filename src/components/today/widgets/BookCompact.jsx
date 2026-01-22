/**
 * BookCompact - Compact book widget for secondary strip
 * 
 * Shows: currently reading book + progress
 * Min tap target: 44px for accessibility
 */

import { useNavigate } from 'react-router-dom'
import { IconBook, IconPlus } from '@tabler/icons-react'

export function BookCompact({
    currentBook = null,
    className = ''
}) {
    const navigate = useNavigate()

    return (
        <button
            type="button"
            onClick={() => navigate(currentBook ? `/books/${currentBook.id}` : '/books')}
            className={`widget-secondary flex items-center gap-3 min-h-[44px] hover:border-primary/30 transition-colors ${className}`}
        >
            <div className="min-w-11 min-h-11 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <IconBook size={16} className="text-purple-600" />
            </div>

            <div className="flex-1 text-left min-w-0">
                <p className="text-tiny text-ink-muted">Sedang Dibaca</p>
                {currentBook ? (
                    <p className="text-small font-medium text-ink truncate">
                        {currentBook.title}
                    </p>
                ) : (
                    <p className="text-small text-ink-muted">Pilih buku</p>
                )}
            </div>

            {!currentBook && (
                <IconPlus size={16} className="text-ink-muted" />
            )}
        </button>
    )
}

export default BookCompact
