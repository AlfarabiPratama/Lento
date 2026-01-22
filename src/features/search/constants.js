/**
 * Search Constants - Scopes, filters, and icon mappings
 */

import {
    IconFileText,
    IconNotebook,
    IconWallet,
    IconCheckbox,
    IconClock,
    IconSearch,
    IconFilter,
    IconX,
    IconTag,
    IconCalendarMonth,
    IconBook,
} from '@tabler/icons-react'

/**
 * Search scopes
 */
export const SEARCH_SCOPES = {
    ALL: 'all',
    SPACE: 'space',
    JOURNAL: 'journal',
    FINANCE: 'finance',
    HABIT: 'habit',
    POMODORO: 'pomodoro',
    BOOK: 'book',
}

/**
 * Scope labels (Indonesian)
 */
export const SCOPE_LABELS = {
    [SEARCH_SCOPES.ALL]: 'Semua',
    [SEARCH_SCOPES.SPACE]: 'Space',
    [SEARCH_SCOPES.JOURNAL]: 'Jurnal',
    [SEARCH_SCOPES.FINANCE]: 'Keuangan',
    [SEARCH_SCOPES.HABIT]: 'Kebiasaan',
    [SEARCH_SCOPES.POMODORO]: 'Pomodoro',
    [SEARCH_SCOPES.BOOK]: 'Buku',
}

/**
 * Scope icons mapping
 */
export const SCOPE_ICONS = {
    [SEARCH_SCOPES.ALL]: IconSearch,
    [SEARCH_SCOPES.SPACE]: IconFileText,
    [SEARCH_SCOPES.JOURNAL]: IconNotebook,
    [SEARCH_SCOPES.FINANCE]: IconWallet,
    [SEARCH_SCOPES.HABIT]: IconCheckbox,
    [SEARCH_SCOPES.POMODORO]: IconClock,
    [SEARCH_SCOPES.BOOK]: IconBook,
}

/**
 * Date filter presets
 */
export const DATE_FILTERS = {
    ALL: 'all',
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    CUSTOM: 'custom',
}

/**
 * Date filter labels
 */
export const DATE_FILTER_LABELS = {
    [DATE_FILTERS.ALL]: 'Semua waktu',
    [DATE_FILTERS.TODAY]: 'Hari ini',
    [DATE_FILTERS.WEEK]: '7 hari terakhir',
    [DATE_FILTERS.MONTH]: 'Bulan ini',
    [DATE_FILTERS.CUSTOM]: 'Kustom',
}

/**
 * Finance transaction types for filter
 */
export const FINANCE_TYPES = {
    ALL: 'all',
    INCOME: 'income',
    EXPENSE: 'expense',
    TRANSFER: 'transfer',
}

/**
 * Finance type labels
 */
export const FINANCE_TYPE_LABELS = {
    [FINANCE_TYPES.ALL]: 'Semua',
    [FINANCE_TYPES.INCOME]: 'Pemasukan',
    [FINANCE_TYPES.EXPENSE]: 'Pengeluaran',
    [FINANCE_TYPES.TRANSFER]: 'Transfer',
}

/**
 * Search UI icons
 */
export const SEARCH_ICONS = {
    search: IconSearch,
    filter: IconFilter,
    clear: IconX,
    tag: IconTag,
    calendar: IconCalendarMonth,
}

/**
 * Default search options
 */
export const SEARCH_DEFAULTS = {
    debounceMs: 150,
    maxResults: 50,
    snippetLength: 100,
}
