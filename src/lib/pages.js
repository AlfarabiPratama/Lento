import { getDB, createBaseFields, markUpdated, markDeleted } from './db'
import { addToOutbox } from './outbox'
import { extractTags } from '../features/space/tagParser'
import { extractLinks } from '../features/space/linkParser'

const STORE = 'pages'
const TAGS_STORE = 'tags'

/**
 * Pages Service - CRUD operations untuk Space (notes)
 */

/**
 * Get all pages (not deleted)
 */
export async function getAllPages() {
    const db = await getDB()
    const all = await db.getAll(STORE)
    return all.filter(p => !p.deleted_at).sort((a, b) =>
        new Date(b.updated_at) - new Date(a.updated_at)
    )
}

/**
 * Get page by ID
 */
export async function getPage(id) {
    const db = await getDB()
    return db.get(STORE, id)
}

/**
 * Create new page
 */
export async function createPage({ title = 'Untitled', content = '' }) {
    const db = await getDB()

    // Auto-extract tags from content (Apple Notes style inline #tags)
    const tags = extractTags(content)

    // Auto-extract wikilinks from content ([[Link]])
    const outgoing_links = extractLinks(content)

    const page = {
        ...createBaseFields(),
        title,
        content,
        tags, // Auto-extracted from content
        outgoing_links, // Auto-extracted from content
        word_count: content.trim().split(/\s+/).filter(Boolean).length,
    }

    await db.add(STORE, page)
    await addToOutbox(STORE, 'create', page)

    return page
}

/**
 * Update page
 */
export async function updatePage(id, updates) {
    const db = await getDB()
    const page = await db.get(STORE, id)

    if (!page) throw new Error('Page not found')

    // Re-extract tags and links if content changed
    const newContent = updates.content !== undefined ? updates.content : page.content
    const tags = extractTags(newContent)
    const outgoing_links = extractLinks(newContent)

    const updated = markUpdated({
        ...page,
        ...updates,
        tags, // Always re-extract from current content
        outgoing_links, // Always re-extract from current content
        word_count: updates.content !== undefined
            ? updates.content.trim().split(/\s+/).filter(Boolean).length
            : page.word_count,
    })

    await db.put(STORE, updated)
    await addToOutbox(STORE, 'update', updated)

    return updated
}

/**
 * Delete page (soft delete)
 */
export async function deletePage(id) {
    const db = await getDB()
    const page = await db.get(STORE, id)

    if (!page) throw new Error('Page not found')

    const deleted = markDeleted(page)

    await db.put(STORE, deleted)
    await addToOutbox(STORE, 'delete', deleted)

    return deleted
}

/**
 * Search pages by title or content
 */
export async function searchPages(query) {
    const all = await getAllPages()
    const q = query.toLowerCase()

    return all.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    )
}

/**
 * Get pages by tag
 */
export async function getPagesByTag(tagId) {
    const all = await getAllPages()
    return all.filter(p => p.tags.includes(tagId))
}

// ============ Tags ============

/**
 * Get all tags
 */
export async function getAllTags() {
    const db = await getDB()
    const all = await db.getAll(TAGS_STORE)
    return all.filter(t => !t.deleted_at).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Create tag
 */
export async function createTag({ name, color = 'primary' }) {
    const db = await getDB()

    // Check for duplicate
    const existing = await getAllTags()
    if (existing.some(t => t.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('Tag already exists')
    }

    const tag = {
        ...createBaseFields(),
        name,
        color,
    }

    await db.add(TAGS_STORE, tag)
    await addToOutbox(TAGS_STORE, 'create', tag)

    return tag
}

/**
 * Delete tag
 */
export async function deleteTag(id) {
    const db = await getDB()
    const tag = await db.get(TAGS_STORE, id)

    if (!tag) throw new Error('Tag not found')

    const deleted = markDeleted(tag)
    await db.put(TAGS_STORE, deleted)
    await addToOutbox(TAGS_STORE, 'delete', deleted)

    return deleted
}

/**
 * Get page stats
 */
export async function getPageStats() {
    const all = await getAllPages()
    const today = new Date().toISOString().split('T')[0]

    return {
        total: all.length,
        today: all.filter(p => p.created_at.startsWith(today)).length,
        total_words: all.reduce((sum, p) => sum + (p.word_count || 0), 0),
    }
}

export default {
    getAllPages,
    getPage,
    createPage,
    updatePage,
    deletePage,
    searchPages,
    getPagesByTag,
    getAllTags,
    createTag,
    deleteTag,
    getPageStats,
}
