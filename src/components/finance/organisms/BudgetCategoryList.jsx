import { IconFilter, IconPlus, IconLoader2 } from '@tabler/icons-react'
import { BudgetCategoryRow } from '../molecules/BudgetCategoryRow'
import { FilterChip } from '../../search/atoms/FilterChip'

/**
 * BudgetCategoryList - List of budget categories with filters
 */
export function BudgetCategoryList({
    categories,
    filter,
    onFilterChange,
    onCategoryClick,
    onAddCategory,
    loading = false,
    className = ''
}) {
    const filters = [
        { id: 'all', label: 'Semua' },
        { id: 'over', label: 'Lewat' },
        { id: 'near', label: 'Hampir' },
        { id: 'ok', label: 'Aman' },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <IconLoader2 size={24} className="animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Filter chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <IconFilter size={16} stroke={2} className="text-ink-muted shrink-0" />
                {filters.map(f => (
                    <FilterChip
                        key={f.id}
                        label={f.label}
                        selected={filter === f.id}
                        onClick={() => onFilterChange(f.id)}
                    />
                ))}
            </div>

            {/* Category list */}
            {categories.length > 0 ? (
                <div className="space-y-3">
                    {categories.map(cat => (
                        <BudgetCategoryRow
                            key={cat.id}
                            budgetCategory={cat}
                            onClick={onCategoryClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-body text-ink-muted mb-2">
                        {filter === 'all'
                            ? 'Belum ada budget untuk bulan ini'
                            : 'Tidak ada kategori dengan status ini'
                        }
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={onAddCategory}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <IconPlus size={18} stroke={2} />
                            <span>Tambah Budget</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default BudgetCategoryList
