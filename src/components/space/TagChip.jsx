import { IconHash } from '@tabler/icons-react'

/**
 * TagChip - Small clickable tag pill
 * Used for filtering notes by tag
 */
export function TagChip({
    tag,
    count,
    isActive = false,
    onClick,
    size = 'normal' // 'small' | 'normal'
}) {
    const sizeClasses = {
        small: 'text-tiny px-1.5 py-0.5 gap-0.5',
        normal: 'text-small px-2 py-1 gap-1'
    }

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center rounded-full transition-colors whitespace-nowrap ${sizeClasses[size]} ${isActive
                    ? 'bg-primary text-white'
                    : 'bg-paper-warm text-ink-muted hover:bg-primary/10 hover:text-primary'
                }`}
        >
            <IconHash size={size === 'small' ? 12 : 14} stroke={1.5} />
            <span>{tag}</span>
            {count !== undefined && (
                <span className={`${isActive ? 'text-white/70' : 'text-ink-light'}`}>
                    {count}
                </span>
            )}
        </button>
    )
}

/**
 * TagChipList - Horizontal scrollable list of tags
 */
export function TagChipList({ tags, selectedTags = [], onTagClick }) {
    if (!tags || tags.length === 0) return null

    return (
        <div className="flex flex-wrap gap-1">
            {tags.map(({ tag, count }) => (
                <TagChip
                    key={tag}
                    tag={tag}
                    count={count}
                    isActive={selectedTags.includes(tag)}
                    onClick={() => onTagClick?.(tag)}
                    size="small"
                />
            ))}
        </div>
    )
}

/**
 * InlineTagChip - Even smaller chip for display inside note items
 */
export function InlineTagChip({ tag }) {
    return (
        <span className="inline-flex items-center text-tiny px-1 py-0.5 rounded bg-primary/10 text-primary gap-0.5">
            <IconHash size={10} stroke={1.5} />
            <span>{tag}</span>
        </span>
    )
}

export default TagChip
