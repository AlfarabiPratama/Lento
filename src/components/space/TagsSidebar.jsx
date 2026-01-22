import { useState } from 'react'
import { IconCalendar, IconCalendarEvent, IconBan, IconChevronDown, IconChevronRight, IconFilter } from '@tabler/icons-react'
import TagChip from './TagChip'

/**
 * Smart Filter Button
 */
function SmartFilterButton({ icon: Icon, label, isActive, onClick, count }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-small transition-colors ${isActive
                ? 'bg-primary text-white'
                : 'text-ink-muted hover:bg-paper-warm hover:text-ink'
                }`}
        >
            <div className="flex items-center gap-2">
                <Icon size={16} stroke={1.5} />
                <span>{label}</span>
            </div>
            {isActive && <IconFilter size={14} className="opacity-70" />}
        </button>
    )
}

/**
 * TagsSidebar - To be placed in the left pane of Space
 */
export function TagsSidebar({
    allTags,
    selectedTags,
    tagFilterMode,
    setTagFilterMode,
    onToggleTag,
    activeSmartFilter,
    onSetSmartFilter,
    show = true
}) {
    const [isTagsExpanded, setIsTagsExpanded] = useState(true)

    if (!show) return null

    return (
        <div className="px-2 py-2 space-y-4 border-b border-line/60">
            {/* Smart Filters */}
            <div className="space-y-0.5">
                <SmartFilterButton
                    icon={IconCalendar}
                    label="Hari ini"
                    isActive={activeSmartFilter === 'today'}
                    onClick={() => onSetSmartFilter('today')}
                />
                <SmartFilterButton
                    icon={IconCalendarEvent}
                    label="Minggu ini"
                    isActive={activeSmartFilter === 'week'}
                    onClick={() => onSetSmartFilter('week')}
                />
                <SmartFilterButton
                    icon={IconBan}
                    label="Tanpa tag"
                    isActive={activeSmartFilter === 'noTags'}
                    onClick={() => onSetSmartFilter('noTags')}
                />
            </div>

            {/* Tags Section */}
            {allTags.length > 0 && (
                <div className="space-y-2">
                    <button
                        onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                        className="w-full flex items-center justify-between px-3 text-tiny font-medium text-ink-muted uppercase tracking-wider hover:text-ink"
                    >
                        <span>Tags</span>
                        {isTagsExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    </button>

                    {isTagsExpanded && (
                        <div className="space-y-3 px-3">
                            <div className="flex flex-wrap gap-1.5">
                                {allTags.map(({ tag, count }) => (
                                    <TagChip
                                        key={tag}
                                        tag={tag}
                                        count={count}
                                        isActive={selectedTags.includes(tag)}
                                        onClick={() => onToggleTag(tag)}
                                    />
                                ))}
                            </div>

                            {/* Multi-select controls */}
                            {selectedTags.length > 1 && (
                                <div className="flex items-center gap-2 pt-1 border-t border-line/50">
                                    <span className="text-tiny text-ink-muted">Match:</span>
                                    <div className="flex bg-paper-warm rounded-md p-0.5">
                                        <button
                                            onClick={() => setTagFilterMode('all')}
                                            className={`px-2 py-0.5 rounded text-tiny transition-colors ${tagFilterMode === 'all'
                                                ? 'bg-white shadow-sm text-ink'
                                                : 'text-ink-muted hover:text-ink'
                                                }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setTagFilterMode('any')}
                                            className={`px-2 py-0.5 rounded text-tiny transition-colors ${tagFilterMode === 'any'
                                                ? 'bg-white shadow-sm text-ink'
                                                : 'text-ink-muted hover:text-ink'
                                                }`}
                                        >
                                            Any
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TagsSidebar
