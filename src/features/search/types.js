/**
 * Search Types - JSDoc typedefs for search system
 * @ts-check
 */

/**
 * @typedef {'space' | 'journal' | 'finance' | 'habit' | 'pomodoro'} SearchModule
 */

/**
 * @typedef {Object} SearchDocumentMeta
 * @property {number} [amount] - For finance: transaction amount
 * @property {'income' | 'expense' | 'transfer'} [type] - For finance: transaction type
 * @property {string} [category] - Category name
 * @property {string} [category_id] - Category ID
 * @property {string} [account_id] - Account ID
 * @property {string} [account_name] - Account name
 * @property {string} [mood] - For journal: mood
 * @property {string} [prompt] - For journal: prompt text
 * @property {string} [page_id] - For space: page ID
 * @property {string} [path] - For space: page path
 * @property {number} [streak] - For habit: current streak
 * @property {number} [duration_min] - For pomodoro: duration in minutes
 */

/**
 * Unified search document format
 * @typedef {Object} SearchDocument
 * @property {string} id - Unique ID
 * @property {SearchModule} module - Source module
 * @property {string} title - Main title/name
 * @property {string} body - Content for full-text search
 * @property {string[]} tags - Tags/labels
 * @property {string} created_at - ISO date string
 * @property {string} updated_at - ISO date string
 * @property {SearchDocumentMeta} meta - Module-specific metadata
 */

/**
 * Search result with relevance
 * @typedef {Object} SearchResult
 * @property {SearchDocument} doc - The matching document
 * @property {string} snippet - Text snippet with match highlighted
 * @property {number} score - Relevance score
 */

/**
 * Search filters
 * @typedef {Object} SearchFilters
 * @property {string} scope - Search scope (all, space, journal, etc.)
 * @property {string} dateFilter - Date filter preset
 * @property {Date} [dateFrom] - Custom date range start
 * @property {Date} [dateTo] - Custom date range end
 * @property {string[]} tags - Selected tags
 * @property {string} [financeType] - Finance type filter
 * @property {string} [accountId] - Finance account filter
 * @property {string} [categoryId] - Finance category filter
 */

/**
 * Search state
 * @typedef {Object} SearchState
 * @property {string} query - Current search query
 * @property {SearchFilters} filters - Active filters
 * @property {SearchResult[]} results - Search results
 * @property {boolean} loading - Loading state
 * @property {boolean} open - Overlay open state
 */

export { }
