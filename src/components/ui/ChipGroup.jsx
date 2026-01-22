/**
 * ChipGroup - Horizontal scrollable chips
 * 
 * Rules:
 * - Default 1 row with horizontal scroll
 * - Prevents chips from stacking 3+ rows
 * - Optional "More..." button
 */

export function ChipGroup({
    value,
    onChange,
    items = [],
    maxVisible = 6,
    showMore = true,
    onMoreClick,
    className = '',
}) {
    const visibleItems = showMore && items.length > maxVisible
        ? items.slice(0, maxVisible)
        : items
    const hasMore = showMore && items.length > maxVisible

    return (
        <div className={`flex gap-2 overflow-x-auto py-1 -my-1 scrollbar-hide ${className}`}>
            {visibleItems.map((item) => {
                const active = item.value === value

                return (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => onChange?.(item.value)}
                        className={`
              shrink-0 h-9 px-3 rounded-full border text-sm
              transition-all duration-[var(--dur-1)]
              lento-focus
              inline-flex items-center gap-1.5
              ${active
                                ? 'bg-[var(--lento-primary)] text-white border-[var(--lento-primary)]'
                                : 'bg-white text-[var(--lento-muted)] border-[var(--lento-border)] hover:bg-black/5'
                            }
            `}
                    >
                        {item.icon && <span>{item.icon}</span>}
                        <span>{item.label}</span>
                    </button>
                )
            })}

            {/* More button */}
            {hasMore && (
                <button
                    type="button"
                    onClick={onMoreClick}
                    className="
            shrink-0 h-9 px-3 rounded-full text-sm
            border border-dashed border-[var(--lento-border)]
            text-[var(--lento-muted)] hover:bg-black/5
            transition-all duration-[var(--dur-1)]
            lento-focus
          "
                >
                    +{items.length - maxVisible} lainnya
                </button>
            )}
        </div>
    )
}

export default ChipGroup
