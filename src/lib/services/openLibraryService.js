/**
 * Open Library API Service
 * https://openlibrary.org/dev/docs/api/books
 */

const BASE_URL = 'https://openlibrary.org'
const COVERS_URL = 'https://covers.openlibrary.org/b'

// Simple in-memory cache for author names
const authorCache = new Map()

/**
 * Normalize ISBN (remove hyphens and spaces)
 */
function normalizeISBN(isbn) {
    return isbn.replace(/[-\s]/g, '')
}

/**
 * Lookup book by ISBN
 */
export async function lookupByISBN(isbn) {
    try {
        const normalized = normalizeISBN(isbn)
        const response = await fetch(`${BASE_URL}/isbn/${normalized}.json`)

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    message: 'Buku tidak ditemukan di Open Library. Silakan isi manual.'
                }
            }
            throw new Error('API request failed')
        }

        const data = await response.json()
        const bookData = await normalizeBookData(data)

        return {
            success: true,
            data: bookData
        }
    } catch (error) {
        console.error('Open Library lookup error:', error)
        return {
            success: false,
            error: 'NETWORK_ERROR',
            message: 'Gagal terhubung ke Open Library. Coba lagi nanti.'
        }
    }
}

/**
 * Get work details for additional metadata
 */
async function getWorkDetails(workKey) {
    try {
        const response = await fetch(`${BASE_URL}${workKey}.json`)
        if (!response.ok) return null

        const data = await response.json()
        return {
            description: typeof data.description === 'string'
                ? data.description
                : data.description?.value || null,
            subjects: data.subjects?.slice(0, 5) || []
        }
    } catch (error) {
        console.error('Failed to fetch work details:', error)
        return null
    }
}

/**
 * Get author name from author key
 */
async function getAuthorName(authorKey) {
    // Check cache first
    if (authorCache.has(authorKey)) {
        return authorCache.get(authorKey)
    }

    try {
        const response = await fetch(`${BASE_URL}${authorKey}.json`)
        if (!response.ok) return 'Unknown Author'

        const data = await response.json()
        const name = data.name || 'Unknown Author'

        // Cache the result
        authorCache.set(authorKey, name)
        return name
    } catch (error) {
        console.error('Failed to fetch author:', error)
        return 'Unknown Author'
    }
}

/**
 * Get cover image URL
 */
export function getCoverUrl(isbn, size = 'M') {
    const normalized = normalizeISBN(isbn)
    return `${COVERS_URL}/isbn/${normalized}-${size}.jpg`
}

/**
 * Normalize Open Library data to our book schema
 */
async function normalizeBookData(apiData) {
    // Extract basic info
    const title = apiData.title || 'Untitled'
    const isbn13 = apiData.isbn_13?.[0] || null
    const isbn10 = apiData.isbn_10?.[0] || null
    const pages = apiData.number_of_pages || null
    const publisher = apiData.publishers?.[0] || null

    // Extract publish year
    let publishYear = null
    if (apiData.publish_date) {
        const yearMatch = apiData.publish_date.match(/\d{4}/)
        publishYear = yearMatch ? parseInt(yearMatch[0]) : null
    }

    // Fetch author names
    let authors = []
    if (apiData.authors && apiData.authors.length > 0) {
        const authorPromises = apiData.authors.map(author =>
            getAuthorName(author.key)
        )
        authors = await Promise.all(authorPromises)
    }

    // Get work details if available
    let description = null
    let subjects = []
    if (apiData.works && apiData.works.length > 0) {
        const workDetails = await getWorkDetails(apiData.works[0].key)
        if (workDetails) {
            description = workDetails.description
            subjects = workDetails.subjects
        }
    }

    // Generate cover URL
    const isbn = isbn13 || isbn10
    const coverUrl = isbn ? getCoverUrl(isbn, 'M') : null

    return {
        title,
        authors: authors.filter(a => a !== 'Unknown Author'),
        isbn: isbn13 || isbn10,
        isbn13,
        isbn10,
        pages,
        publisher,
        publishYear,
        description,
        subjects,
        coverUrl,
        source: 'openlibrary',
        olid: apiData.key // e.g., "/books/OL25712751M"
    }
}

/**
 * Check if cover image exists
 */
export async function checkCoverExists(isbn) {
    try {
        const url = getCoverUrl(isbn, 'S')
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok
    } catch (error) {
        return false
    }
}

export default {
    lookupByISBN,
    getCoverUrl,
    checkCoverExists
}
