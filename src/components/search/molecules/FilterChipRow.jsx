import { FilterChip } from '../atoms/FilterChip'
import { DATE_FILTERS, DATE_FILTER_LABELS } from '../../../features/search/constants'
import { IconCalendarMonth, IconTag } from '@tabler/icons-react'

/**
 * FilterChipRow - Horizontal scrollable filter chips
 */
export function FilterChipRow({
    dateFilter,
    onDateFilterChange,
    tags = [],
    selectedTags = [],
    onTagToggle,
    className = '',
}) {
    const dateFilters = Object.values(DATE_FILTERS).filter(f => f !== DATE_FILTERS.CUSTOM)

    return (
        <div className={`flex gap-2 overflow-x-auto scrollbar-hide py-1 ${className}`}>
            {/* Date filters */}
            {dateFilters.map((filter) => (
                <FilterChip
                    key={filter}
                    label={DATE_FILTER_LABELS[filter]}
                    selected={dateFilter === filter}
                    onClick={() => onDateFilterChange(filter)}
                    icon={IconCalendarMonth}
                />
            ))}

            {/* Separator */}
            {tags.length > 0 && (
                <div className="w-px bg-line mx-1 self-stretch" />
            )}

            {/* Tag filters */}
            {tags.slice(0, 5).map((tag) => (
                <FilterChip
                    key={tag}
                    label={tag}
                    selected={selectedTags.includes(tag)}
                    onClick={() => onTagToggle(tag)}
                    icon={IconTag}
                />
            ))}
        </div>
    )
}

export default FilterChipRow
