import { 
    IconChevronDown, 
    IconHeart, 
    IconRocket, 
    IconBook, 
    IconRun, 
    IconBrain, 
    IconCoin, 
    IconUsers, 
    IconPalette, 
    IconDots 
} from '@tabler/icons-react'
import { HABIT_CATEGORIES } from '../../lib/habitCategories'

// Icon mapping
const iconMap = {
    IconHeart,
    IconRocket,
    IconBook,
    IconRun,
    IconBrain,
    IconCoin,
    IconUsers,
    IconPalette,
    IconDots
}

/**
 * CategorySelector - Dropdown untuk memilih kategori habit
 * 
 * @param {Object} props
 * @param {string} props.value - Selected category ID
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label for the field
 * @param {string} props.error - Error message
 */
export function CategorySelector({ value, onChange, label = 'Kategori', error }) {
    const selectedCategory = HABIT_CATEGORIES.find(c => c.id === value) || null

    return (
        <div>
            {label && (
                <label className="text-small text-ink-muted mb-2 block">
                    {label}
                </label>
            )}
            
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`input pr-10 appearance-none ${selectedCategory ? 'pl-10' : ''} ${error ? 'border-danger' : ''}`}
                >
                    <option value="">Pilih kategori (opsional)</option>
                    {HABIT_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.label}
                        </option>
                    ))}
                </select>

                {/* Chevron Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IconChevronDown size={18} className="text-ink-muted" />
                </div>

                {/* Selected category icon preview */}
                {selectedCategory && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {(() => {
                            const IconComponent = iconMap[selectedCategory.icon]
                            return IconComponent ? (
                                <IconComponent size={18} className={selectedCategory.color} />
                            ) : null
                        })()}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-tiny text-danger mt-1">{error}</p>
            )}
        </div>
    )
}

/**
 * CategoryBadge - Display category badge with icon
 */
export function CategoryBadge({ categoryId, size = 'md' }) {
    const category = HABIT_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return null

    const IconComponent = iconMap[category.icon]
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-tiny gap-1',
        md: 'px-2.5 py-1 text-small gap-1.5',
        lg: 'px-3 py-1.5 text-small gap-2'
    }

    return (
        <div className={`inline-flex items-center rounded-full bg-paper-warm border border-line ${sizeClasses[size]}`}>
            {IconComponent && (
                <IconComponent 
                    size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} 
                    className={category.color} 
                />
            )}
            <span className="text-ink-soft">{category.label}</span>
        </div>
    )
}
