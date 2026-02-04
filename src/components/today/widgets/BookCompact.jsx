/**
 * BookCompact - Compact book widget for secondary strip
 * 
 * Enhanced with:
 * - Reading progress (pages + percentage)
 * - Progress bar
 * - Better visual hierarchy
 * Min tap target: 44px for accessibility
 */

import { useNavigate } from 'react-router-dom'
import { IconBook, IconPlus } from '@tabler/icons-react'
import { BookCompactSkeleton } from '../skeletons/WidgetSkeletons'

export function BookCompact({
    currentBook = null,
    isLoading = false,
    className = ''
}) {
    const navigate = useNavigate()

    // Show skeleton during loading
    if (isLoading) {
        return <BookCompactSkeleton />
    }

    // Calculate reading progress
    const currentPage = currentBook?.current_page || 0
    const totalPages = currentBook?.total_pages || 0
    const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0

    return (
        <button
            type="button"
            onClick={() => navigate(currentBook ? `/books/${currentBook.id}` : '/books')}
            className={`widget-secondary group hover:border-primary/30 transition-colors ${className}`}
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="min-w-10 min-h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <IconBook size={18} className="text-purple-600" />
                </div>

                <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-tiny text-ink-muted">Sedang Dibaca</p>
                        {currentBook && totalPages > 0 && (
                            <span className="text-tiny font-medium text-ink">{progressPercent}%</span>
                        )}
                    </div>
                    {currentBook ? (
                        <p className="text-small font-medium text-ink truncate">
                            {currentBook.title}
                        </p>
                    ) : (
                        <p className="text-small text-ink-muted">Pilih buku</p>
                    )}
                </div>

                {!currentBook && (
                    <div className="min-w-8 min-h-8 flex items-center justify-center flex-shrink-0">
                        <IconPlus size={16} className="text-ink-muted" />
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {currentBook && totalPages > 0 && (
                <>
                    <div className="mb-1.5">
                        <div className="h-1.5 bg-base-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-tiny text-ink-muted">
                        <span>Hal. {currentPage.toLocaleString('id-ID')}</span>
                        <span>{totalPages.toLocaleString('id-ID')} hal</span>
                    </div>
                </>
            )}
        </button>
    )
}

export default BookCompact
