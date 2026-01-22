/**
 * Tag Parser for Space Notes
 * 
 * Parses inline #tags from note content following Apple Notes pattern:
 * - Tag is activated after whitespace/punctuation boundary
 * - Supports Unicode characters (Japanese, Cyrillic, Arabic, etc.)
 * - Allows dash and underscore in tag names
 * - Max 50 characters per tag
 */

/**
 * Regex for extracting tags:
 * - (^|\s) - Must start at beginning or after whitespace
 * - #([\p{L}\p{N}_-]{1,50}) - Hash + 1-50 unicode letters/numbers/dash/underscore
 * - (?=$|\s|[.,!?;:，。！？；：]) - Must end at whitespace/punctuation/end
 * 
 * Uses Unicode property escapes (requires 'u' flag)
 */
export const TAG_REGEX = /(^|\s)#([\p{L}\p{N}_-]{1,50})(?=$|\s|[.,!?;:，。！？；：])/gu

/**
 * False positive patterns to exclude
 */
const FALSE_POSITIVE_PATTERNS = [
    /^[0-9a-fA-F]{3,6}$/, // Hex colors (#fff, #a1b2c3)
    /^[0-9]+$/,           // Pure numbers (#123)
]

/**
 * Extract tags from content
 * Returns canonical (lowercase) deduplicated tags in order of first appearance
 * 
 * @param {string} content - Note content
 * @returns {string[]} Array of canonical tag names (without #)
 */
export function extractTags(content) {
    if (!content || typeof content !== 'string') {
        return []
    }

    const tags = []
    const seen = new Set()

    // Reset regex state
    TAG_REGEX.lastIndex = 0

    let match
    while ((match = TAG_REGEX.exec(content)) !== null) {
        const rawTag = match[2]

        // Skip false positives
        if (isFalsePositive(rawTag)) {
            continue
        }

        // Normalize to lowercase for canonical form
        const canonical = rawTag.toLowerCase()

        // Deduplicate
        if (!seen.has(canonical)) {
            seen.add(canonical)
            tags.push(canonical)
        }
    }

    return tags
}

/**
 * Check if a potential tag is actually a false positive
 */
function isFalsePositive(tag) {
    return FALSE_POSITIVE_PATTERNS.some(pattern => pattern.test(tag))
}

/**
 * Extract tags with their positions (for highlighting)
 * 
 * @param {string} content 
 * @returns {{ tag: string, start: number, end: number }[]}
 */
export function extractTagsWithPositions(content) {
    if (!content || typeof content !== 'string') {
        return []
    }

    const results = []
    TAG_REGEX.lastIndex = 0

    let match
    while ((match = TAG_REGEX.exec(content)) !== null) {
        const rawTag = match[2]

        if (isFalsePositive(rawTag)) {
            continue
        }

        // Calculate position (account for leading whitespace in match)
        const leadingWhitespace = match[1].length
        const start = match.index + leadingWhitespace
        const end = start + rawTag.length + 1 // +1 for #

        results.push({
            tag: rawTag.toLowerCase(),
            start,
            end
        })
    }

    return results
}

/**
 * Get unique tags from multiple pages
 * Returns map of tag -> count
 * 
 * @param {Array<{ tags: string[] }>} pages
 * @returns {Map<string, number>}
 */
export function aggregateTags(pages) {
    const tagCounts = new Map()

    for (const page of pages) {
        if (!page.tags || !Array.isArray(page.tags)) continue

        for (const tag of page.tags) {
            const count = tagCounts.get(tag) || 0
            tagCounts.set(tag, count + 1)
        }
    }

    return tagCounts
}

/**
 * Sort tags by count (descending) then alphabetically
 * 
 * @param {Map<string, number>} tagCounts
 * @returns {{ tag: string, count: number }[]}
 */
export function sortedTagList(tagCounts) {
    return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => {
            // Sort by count descending
            if (b.count !== a.count) return b.count - a.count
            // Then alphabetically
            return a.tag.localeCompare(b.tag)
        })
}

/**
 * Filter pages by tags
 * 
 * @param {Array<{ tags: string[] }>} pages
 * @param {string[]} selectedTags
 * @param {'all' | 'any'} mode - 'all' = AND logic, 'any' = OR logic
 * @returns {Array}
 */
export function filterByTags(pages, selectedTags, mode = 'all') {
    if (!selectedTags || selectedTags.length === 0) {
        return pages
    }

    return pages.filter(page => {
        if (!page.tags || !Array.isArray(page.tags)) {
            return false
        }

        if (mode === 'all') {
            // Must have ALL selected tags (AND)
            return selectedTags.every(tag => page.tags.includes(tag))
        } else {
            // Must have ANY of selected tags (OR)
            return selectedTags.some(tag => page.tags.includes(tag))
        }
    })
}

export default {
    extractTags,
    extractTagsWithPositions,
    aggregateTags,
    sortedTagList,
    filterByTags,
    TAG_REGEX
}
