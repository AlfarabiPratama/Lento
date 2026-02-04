import { useNavigate } from 'react-router-dom'
import { IconChevronRight } from '@tabler/icons-react'
import BookCover from '../atoms/BookCover'
import StatusChip from '../atoms/StatusChip'
import { calcPercent, clampProgress } from '../../../features/books/domain/bookProgress.js'

/**
 * BookRow - List item for books library
 * Click progress area to open quick log sheet (absolute input)
 */
export function BookRow({ book, onProgressClick }) {
    const navigate = useNavigate()

    const current = clampProgress(book.progress?.current, book.progress?.total)
    const total = book.progress?.total || null
    const unit = book.progress?.unit || 'pages'
    const unitLabel = unit === 'pages' ? 'hal' : 'min'
    const percent = calcPercent(current, total)

    function handleClick() {
        navigate(`/books/${book.id}`)
    }

    function handleProgressClick(e) {
        e.stopPropagation()
        if (onProgressClick) {
            onProgressClick(book)
        }
    }

    return (
        <div
            onClick={handleClick}
            className="card p-3 sm:p-4 flex items-center gap-2 sm:gap-3 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group w-full min-w-0"
        >
            <BookCover book={book} size="small" className="shrink-0" />

            <div className="flex-1 min-w-0">
                <h3 className="text-body font-medium text-ink truncate group-hover:text-primary transition-colors">
                    {book.title}
                </h3>
                {book.authors?.length > 0 && (
                    <p className="text-small text-ink-muted truncate">
                        {book.authors.join(', ')}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusChip status={book.status} />

                    {/* Clickable Progress Area */}
                    <button
                        onClick={handleProgressClick}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-paper-warm hover:bg-primary/10 text-tiny text-ink-muted hover:text-primary transition-colors"
                        title="Update progres"
                    >
                        <span>
                            {total ? `${current}/${total}` : current} {unitLabel}
                        </span>
                        <span className="text-ink-light">
                            {percent !== null ? `${percent}%` : '—%'}
                        </span>
                    </button>
                </div>
            </div>

            <IconChevronRight size={20} stroke={1.5} className="text-ink-light shrink-0" />
        </div>
    )
}

export default BookRow

