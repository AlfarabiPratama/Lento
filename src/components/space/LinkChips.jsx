import { IconLink, IconArrowRight, IconFileText } from '@tabler/icons-react'

/**
 * LinkChip - Forward wikilink chip
 * Displayed below title/above content
 */
export function LinkChip({ link, isResolved, onClick }) {
    // Determine status style
    const statusClasses = isResolved
        ? 'bg-primary-50 text-primary border-primary-200 hover:bg-primary-100'
        : 'bg-paper-warm text-ink-muted border-line-dashed hover:text-danger hover:border-danger hover:bg-danger/5' // Unresolved

    const display = link.alias || link.originalTitle

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-small transition-all ${statusClasses}`}
            title={isResolved ? `Go to ${link.originalTitle}` : `Create note "${link.originalTitle}"`}
        >
            <IconLink size={14} stroke={1.5} className={isResolved ? 'rotate-45' : ''} />
            <span className="truncate max-w-[200px]">{display}</span>
            {link.anchor && <span className="opacity-50 text-tiny">{link.anchor}</span>}
        </button>
    )
}

/**
 * LinkChipList - Container for forward links
 */
export function LinkChipList({ links, onLinkClick }) {
    if (!links || links.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link, idx) => (
                <LinkChip
                    key={`${link.titleNorm}-${idx}`}
                    link={link}
                    isResolved={link.isResolved}
                    onClick={() => onLinkClick(link)}
                />
            ))}
        </div>
    )
}

/**
 * BacklinkItem - Represents a page that links TO the current page
 */
export function BacklinkItem({ page, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-3 rounded-lg border border-line bg-surface hover:border-primary-200 transition-all group"
        >
            <div className="flex items-start gap-2">
                <IconFileText size={16} className="mt-0.5 text-ink-muted group-hover:text-primary" />
                <div>
                    <p className="text-small font-medium text-ink group-hover:text-primary">
                        {page.title || 'Untitled'}
                    </p>
                    <p className="text-caption text-ink-muted mt-0.5 line-clamp-1">
                        {page.content ? page.content.slice(0, 100) : 'No content'}
                    </p>
                </div>
            </div>
        </button>
    )
}

/**
 * BacklinksPanel - Collapsible panel showing incoming links
 */
export function BacklinksPanel({ backlinks, onNavigate }) {
    if (!backlinks || backlinks.length === 0) {
        return (
            <div className="mt-8 pt-6 border-t border-line/60">
                <h3 className="text-small font-medium text-ink-muted uppercase tracking-wider mb-4">
                    Linked to this note
                </h3>
                <p className="text-caption text-ink-light italic">
                    No other notes link to this one yet.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-8 pt-6 border-t border-line/60">
            <h3 className="text-small font-medium text-ink-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>Linked to this note</span>
                <span className="bg-paper-warm px-1.5 py-0.5 rounded text-tiny text-ink-muted">
                    {backlinks.length}
                </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {backlinks.map(page => (
                    <BacklinkItem
                        key={page.id}
                        page={page}
                        onClick={() => onNavigate(page.id)}
                    />
                ))}
            </div>
        </div>
    )
}
