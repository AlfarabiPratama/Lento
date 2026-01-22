import { IconX } from '@tabler/icons-react'

/**
 * BookPreview - Preview modal for Open Library lookup results
 */
export function BookPreview({ book, onConfirm, onCancel }) {
    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div
                className="bg-surface rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-8 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Tutup"
                >
                    <IconX size={20} stroke={2} className="text-ink-muted" />
                </button>

                {/* Cover Image */}
                {book.coverUrl && (
                    <div className="mb-4 flex justify-center">
                        <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-32 h-48 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                                e.target.style.display = 'none'
                            }}
                        />
                    </div>
                )}

                {/* Book Info */}
                <h3 className="text-h2 text-ink mb-2">{book.title}</h3>

                {book.authors && book.authors.length > 0 && (
                    <p className="text-body text-ink-muted mb-3">
                        {book.authors.join(', ')}
                    </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-small text-ink-muted mb-4">
                    {book.pages && (
                        <span className="px-2 py-1 bg-paper-warm rounded">
                            📄 {book.pages} halaman
                        </span>
                    )}
                    {book.publishYear && (
                        <span className="px-2 py-1 bg-paper-warm rounded">
                            📅 {book.publishYear}
                        </span>
                    )}
                    {book.publisher && (
                        <span className="px-2 py-1 bg-paper-warm rounded truncate max-w-[200px]">
                            🏢 {book.publisher}
                        </span>
                    )}
                </div>

                {/* ISBN */}
                {book.isbn && (
                    <p className="text-tiny text-ink-light mb-3">
                        ISBN: {book.isbn}
                    </p>
                )}

                {/* Description */}
                {book.description && (
                    <div className="mb-6">
                        <h4 className="text-small font-medium text-ink mb-2">Deskripsi</h4>
                        <p className="text-small text-ink-muted line-clamp-6">
                            {book.description}
                        </p>
                    </div>
                )}

                {/* Subjects/Tags */}
                {book.subjects && book.subjects.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-small font-medium text-ink mb-2">Subjek</h4>
                        <div className="flex flex-wrap gap-2">
                            {book.subjects.slice(0, 5).map((subject, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-primary/10 text-primary text-tiny rounded"
                                >
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Source attribution */}
                <p className="text-tiny text-ink-light mb-6 italic">
                    Data dari Open Library
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 btn-secondary"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 btn-primary"
                    >
                        Gunakan Data Ini
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookPreview
