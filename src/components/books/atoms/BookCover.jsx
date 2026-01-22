import { IconBook } from '@tabler/icons-react'

/**
 * BookCover - Display book cover with fallback
 */
export function BookCover({ book, size = 'medium', className = '' }) {
    const sizes = {
        small: 'w-12 h-16',
        medium: 'w-20 h-28',
        large: 'w-32 h-44'
    }

    const sizeClass = sizes[size] || sizes.medium

    // Try to get cover URL from various possible fields
    // Priority: cover.url (manual upload) > coverUrlLarge/Small (OpenLibrary)
    const getCoverUrl = () => {
        if (book.cover?.url) {
            return book.cover.url
        }
        if (book.cover?.coverUrlSmall || book.cover?.coverUrlLarge) {
            return size === 'large'
                ? (book.cover.coverUrlLarge || book.cover.coverUrlSmall)
                : (book.cover.coverUrlSmall || book.cover.coverUrlLarge)
        }
        // Also check top-level coverUrl (used in some contexts)
        if (book.coverUrl) {
            return book.coverUrl
        }
        return null
    }

    const coverUrl = getCoverUrl()

    if (coverUrl) {
        return (
            <div className={`${sizeClass} ${className} relative overflow-hidden rounded-lg border border-line bg-surface`}>
                <img
                    src={coverUrl}
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to gradient on error
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                    }}
                />
                <div
                    className="w-full h-full absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40"
                    style={{ display: 'none' }}
                >
                    <div className="text-center text-white p-2">
                        <div className="text-2xl font-bold">
                            {book.title.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Fallback: Gradient + First Letter
    const firstLetter = book.title.charAt(0).toUpperCase()
    const hash = book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue = hash % 360

    return (
        <div
            className={`${sizeClass} ${className} rounded-lg border border-line flex items-center justify-center`}
            style={{
                background: `linear-gradient(135deg, hsl(${hue}, 60%, 50%) 0%, hsl(${hue + 30}, 60%, 40%) 100%)`
            }}
        >
            <div className="text-center text-white p-2">
                <div className={`font-bold ${size === 'large' ? 'text-4xl' : size === 'medium' ? 'text-2xl' : 'text-lg'}`}>
                    {firstLetter}
                </div>
            </div>
        </div>
    )
}

export default BookCover
