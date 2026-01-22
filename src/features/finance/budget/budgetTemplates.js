/**
 * Budget Templates - Pre-defined budget allocations
 * @ts-check
 */

/**
 * Category groups for 50/30/20 rule
 */
export const CATEGORY_GROUPS = {
    needs: 'needs',     // 50% - Kebutuhan
    wants: 'wants',     // 30% - Keinginan
    savings: 'savings', // 20% - Tabungan
}

/**
 * Mahasiswa category templates
 * Based on common student expenses
 */
export const MAHASISWA_CATEGORIES = [
    { id: 'makan', label: 'Makan', group: 'needs', defaultAmount: 800000 },
    { id: 'transport', label: 'Transport', group: 'needs', defaultAmount: 300000 },
    { id: 'kuota', label: 'Kuota & Internet', group: 'needs', defaultAmount: 100000 },
    { id: 'print', label: 'Print & ATK', group: 'needs', defaultAmount: 50000 },
    { id: 'nongkrong', label: 'Nongkrong', group: 'wants', defaultAmount: 200000 },
    { id: 'hiburan', label: 'Hiburan', group: 'wants', defaultAmount: 150000 },
    { id: 'belanja', label: 'Belanja', group: 'wants', defaultAmount: 100000 },
    { id: 'tabungan', label: 'Tabungan', group: 'savings', defaultAmount: 300000 },
]

/**
 * Get total from mahasiswa template
 */
export function getMahasiswaTotal() {
    return MAHASISWA_CATEGORIES.reduce((sum, cat) => sum + cat.defaultAmount, 0)
}

/**
 * Apply 50/30/20 rule to a total amount
 * @param {number} totalIncome - Total income for the month (integer IDR)
 * @returns {{ needs: number, wants: number, savings: number }}
 */
export function apply503020(totalIncome) {
    return {
        needs: Math.round(totalIncome * 0.5),
        wants: Math.round(totalIncome * 0.3),
        savings: Math.round(totalIncome * 0.2),
    }
}

/**
 * Distribute amount across categories based on group
 * @param {number} totalIncome
 * @returns {Object[]} Categories with calculated amounts
 */
export function distribute503020(totalIncome) {
    const allocation = apply503020(totalIncome)

    // Count categories per group
    const groupCounts = {
        needs: MAHASISWA_CATEGORIES.filter(c => c.group === 'needs').length,
        wants: MAHASISWA_CATEGORIES.filter(c => c.group === 'wants').length,
        savings: MAHASISWA_CATEGORIES.filter(c => c.group === 'savings').length,
    }

    // Distribute evenly within each group
    return MAHASISWA_CATEGORIES.map(cat => ({
        ...cat,
        amount: Math.round(allocation[cat.group] / groupCounts[cat.group]),
    }))
}

/**
 * Template options for budget setup wizard
 */
export const BUDGET_TEMPLATES = [
    {
        id: 'mahasiswa',
        label: 'Template Mahasiswa',
        description: 'Budget umum untuk mahasiswa',
        categories: MAHASISWA_CATEGORIES,
    },
    {
        id: 'custom',
        label: 'Buat Manual',
        description: 'Set budget sendiri per kategori',
        categories: [],
    },
]

/**
 * Preset suggestions for quick setup
 */
export const BUDGET_PRESETS = [
    { id: '1jt', label: 'Rp 1 juta/bulan', amount: 1000000 },
    { id: '2jt', label: 'Rp 2 juta/bulan', amount: 2000000 },
    { id: '3jt', label: 'Rp 3 juta/bulan', amount: 3000000 },
    { id: '5jt', label: 'Rp 5 juta/bulan', amount: 5000000 },
]

export default {
    CATEGORY_GROUPS,
    MAHASISWA_CATEGORIES,
    getMahasiswaTotal,
    apply503020,
    distribute503020,
    BUDGET_TEMPLATES,
    BUDGET_PRESETS,
}
