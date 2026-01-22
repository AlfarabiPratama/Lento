/**
 * WikiLink Parser for Space Notes
 * 
 * Supports standard Obsidian-flavor wikilinks:
 * - [[Note Title]]
 * - [[Note Title|Custom Alias]]
 * - [[Note Title#Heading]]
 * - [[Note Title#^block-id]]
 * - ![[Embed Note]]
 */

/**
 * Regex for extracting wikilinks:
 * Captures optional embed flag (!) and the content inside [[...]]
 * Handles typical filename characters.
 * 
 * Group 1: Embed flag (! or undefined)
 * Group 2: Content inside [[ ]]
 */
export const WIKILINK_REGEX = /(!?)\[\[((?:[^\]]|\](?!\]))+)\]\]/g

/**
 * Parse wikilinks from content
 * 
 * @param {string} content - Note content
 * @returns {Array} Array of link objects
 */
export function extractLinks(content) {
    if (!content || typeof content !== 'string') {
        return []
    }

    const links = []
    const seen = new Set()

    // Reset regex state
    WIKILINK_REGEX.lastIndex = 0

    let match
    while ((match = WIKILINK_REGEX.exec(content)) !== null) {
        const isEmbed = match[1] === '!'
        const rawContent = match[2]

        // Split alias if exists (Note|Alias)
        const [targetPart, ...aliasParts] = rawContent.split('|')
        const alias = aliasParts.length > 0 ? aliasParts.join('|') : null

        // Split anchor if exists (Note#Heading)
        // Be careful not to split # inside alias, but we already split alias off
        const [titlePart, ...anchorParts] = targetPart.split('#')
        const anchor = anchorParts.length > 0 ? '#' + anchorParts.join('#') : null

        const originalTitle = titlePart.trim()
        const titleNorm = originalTitle.toLowerCase()

        // Skip empty titles (e.g. [[#Heading]] self-ref without title, or empty [[]])
        // For MVP we ignore self-ref anchors without title
        if (!titleNorm) continue

        // Create unique key for deduplication
        // We deduplicate based on target (title + anchor) to avoid noisy lists
        // But for "Outgoing Links" display we might want all unique TARGETS (notes)
        // Let's store full details
        const key = `${isEmbed ? '!' : ''}${titleNorm}${anchor || ''}|${alias || ''}`

        if (!seen.has(key)) {
            seen.add(key)
            links.push({
                raw: match[0],
                originalTitle,
                titleNorm,
                alias,
                anchor,
                isEmbed,
                index: match.index
            })
        }
    }

    return links
}

/**
 * Get unique outgoing target titles (normalized)
 * Useful for simple indexing
 * 
 * @param {Array<{ titleNorm: string }>} links
 * @returns {string[]} Unique normalized titles
 */
export function getUniqueOutgoingTitles(links) {
    const titles = new Set()
    for (const link of links) {
        if (link.titleNorm) {
            titles.add(link.titleNorm)
        }
    }
    return Array.from(titles)
}

export default {
    extractLinks,
    getUniqueOutgoingTitles,
    WIKILINK_REGEX
}
