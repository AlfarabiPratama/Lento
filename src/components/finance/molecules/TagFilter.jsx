import { useMemo } from 'react'
import { IconTag } from '@tabler/icons-react'

/**
 * TagFilter - Dropdown to filter transactions by tags
 * 
 * @param {Object[]} allTransactions - All transactions to extract tags from
 * @param {string|null} value - Selected tag or null for all
 * @param {function} onChange - Callback when filter changes
 */
export function TagFilter({ allTransactions = [], value, onChange }) {
    // Extract all unique tags from transactions
    const availableTags = useMemo(() => {
        const tagSet = new Set()
        allTransactions.forEach(tx => {
            if (tx.tags && Array.isArray(tx.tags)) {
                tx.tags.forEach(tag => tagSet.add(tag))
            }
        })
        return Array.from(tagSet).sort()
    }, [allTransactions])

    if (availableTags.length === 0) {
        return null // Don't show filter if no tags exist
    }

    return (
        <div>
            <label className="text-sm text-[var(--lento-muted)] mb-2 block">Filter Tag</label>
            <div className="relative">
                <IconTag 
                    size={18} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lento-muted)] pointer-events-none" 
                />
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value || null)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--lento-border)] bg-white lento-focus appearance-none text-sm"
                >
                    <option value="">Semua Tag</option>
                    {availableTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-[var(--lento-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {value && (
                <p className="text-xs text-[var(--lento-muted)] mt-1">
                    Menampilkan transaksi dengan tag: <span className="font-medium text-primary">{value}</span>
                </p>
            )}
        </div>
    )
}
