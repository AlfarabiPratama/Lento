/**
 * Checkbox Parser for Task Management in Notes
 * 
 * Supports syntax:
 * - [ ] Incomplete task
 * - [x] Completed task
 * - [X] Completed task (uppercase also works)
 */

/**
 * Regex to match checkbox lines
 * Matches: "- [ ] Task" or "- [x] Task" with optional leading whitespace
 */
const CHECKBOX_REGEX = /^(\s*)-\s\[([ xX])\]\s(.+)$/gm

/**
 * Regex to match due date in task text
 * Matches: @due(2026-01-25) or @due(25/01/2026)
 */
const DUE_DATE_REGEX = /@due\(([^)]+)\)/i

/**
 * Regex to match priority markers
 * Matches: ! (low), !! (medium), !!! (high)
 */
const PRIORITY_REGEX = /^(!{1,3})\s/

/**
 * Parse due date from task text
 * @param {string} text - Task text
 * @returns {Object|null} { date: Date, raw: string } or null
 */
function parseDueDate(text) {
    const match = text.match(DUE_DATE_REGEX)
    if (!match) return null
    
    const dateStr = match[1]
    let date
    
    // Try parsing different formats
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // YYYY-MM-DD
        date = new Date(dateStr)
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        // DD/MM/YYYY
        const [day, month, year] = dateStr.split('/')
        date = new Date(`${year}-${month}-${day}`)
    } else {
        date = new Date(dateStr)
    }
    
    return isNaN(date.getTime()) ? null : { date, raw: match[0] }
}

/**
 * Parse priority from task text
 * @param {string} text - Task text
 * @returns {Object} { level: number (1-3), marker: string }
 */
function parsePriority(text) {
    const match = text.match(PRIORITY_REGEX)
    if (!match) return { level: 0, marker: '' }
    
    return {
        level: match[1].length, // 1, 2, or 3
        marker: match[1]
    }
}

/**
 * Parse content and extract all checkboxes with their positions
 * @param {string} content - Note content
 * @returns {Array} Array of checkbox objects with metadata
 */
export function parseCheckboxes(content) {
    const checkboxes = []
    let match

    // Reset regex lastIndex
    CHECKBOX_REGEX.lastIndex = 0

    while ((match = CHECKBOX_REGEX.exec(content)) !== null) {
        const [fullMatch, indent, status, text] = match
        const isChecked = status.toLowerCase() === 'x'
        const cleanText = text.trim()
        
        // Parse metadata
        const dueDate = parseDueDate(cleanText)
        const priority = parsePriority(cleanText)
        
        // Clean text (remove priority marker)
        let displayText = cleanText
        if (priority.level > 0) {
            displayText = displayText.replace(PRIORITY_REGEX, '')
        }
        
        checkboxes.push({
            index: match.index,
            length: fullMatch.length,
            fullMatch,
            indent: indent || '',
            isChecked,
            text: displayText,
            rawText: cleanText,
            lineStart: match.index,
            lineEnd: match.index + fullMatch.length,
            dueDate: dueDate?.date || null,
            dueDateRaw: dueDate?.raw || null,
            priority: priority.level,
            priorityMarker: priority.marker,
        })
    }

    return checkboxes
}

/**
 * Toggle checkbox at specific position in content
 * @param {string} content - Original content
 * @param {number} lineIndex - Index of the checkbox line to toggle
 * @returns {string} Updated content with toggled checkbox
 */
export function toggleCheckboxAtLine(content, lineIndex) {
    const lines = content.split('\n')
    
    if (lineIndex < 0 || lineIndex >= lines.length) {
        return content
    }

    const line = lines[lineIndex]
    const checkboxMatch = line.match(/^(\s*)-\s\[([ xX])\]\s(.+)$/)
    
    if (!checkboxMatch) {
        return content
    }

    const [, indent, status, text] = checkboxMatch
    const newStatus = status.toLowerCase() === 'x' ? ' ' : 'x'
    const newLine = `${indent}- [${newStatus}] ${text}`
    
    lines[lineIndex] = newLine
    return lines.join('\n')
}

/**
 * Toggle checkbox by finding it in content
 * @param {string} content - Original content
 * @param {number} characterIndex - Character position where checkbox starts
 * @returns {string} Updated content
 */
export function toggleCheckboxAtPosition(content, characterIndex) {
    const lines = content.split('\n')
    let currentPosition = 0
    
    for (let i = 0; i < lines.length; i++) {
        const lineStart = currentPosition
        const lineEnd = currentPosition + lines[i].length
        
        if (characterIndex >= lineStart && characterIndex <= lineEnd) {
            return toggleCheckboxAtLine(content, i)
        }
        
        // +1 for newline character
        currentPosition = lineEnd + 1
    }
    
    return content
}

/**
 * Get task statistics from content
 * @param {string} content - Note content
 * @returns {Object} Task stats: { total, completed, incomplete, percentage }
 */
export function getTaskStats(content) {
    const checkboxes = parseCheckboxes(content)
    const total = checkboxes.length
    const completed = checkboxes.filter(cb => cb.isChecked).length
    const incomplete = total - completed
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return {
        total,
        completed,
        incomplete,
        percentage,
    }
}

/**
 * Check if line contains a checkbox
 * @param {string} line - Text line to check
 * @returns {boolean}
 */
export function isCheckboxLine(line) {
    return /^(\s*)-\s\[([ xX])\]\s.+$/.test(line)
}

/**
 * Create a new checkbox line
 * @param {string} text - Task text
 * @param {boolean} checked - Whether task is completed
 * @param {string} indent - Indentation (for nested tasks)
 * @returns {string} Formatted checkbox line
 */
export function createCheckboxLine(text, checked = false, indent = '') {
    const status = checked ? 'x' : ' '
    return `${indent}- [${status}] ${text}`
}

/**
 * Check if task is overdue
 * @param {Date} dueDate - Due date
 * @returns {boolean}
 */
export function isOverdue(dueDate) {
    if (!dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
}

/**
 * Check if task is due today
 * @param {Date} dueDate - Due date
 * @returns {boolean}
 */
export function isDueToday(dueDate) {
    if (!dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return due.getTime() === today.getTime()
}

/**
 * Convert checkbox content to line-by-line structure for rendering
 * @param {string} content - Note content
 * @returns {Array} Array of line objects with checkbox info
 */
export function parseContentLines(content) {
    const lines = content.split('\n')
    const result = []
    
    lines.forEach((line, index) => {
        const checkboxMatch = line.match(/^(\s*)-\s\[([ xX])\]\s(.+)$/)
        
        if (checkboxMatch) {
            const [, indent, status, rawText] = checkboxMatch
            const isChecked = status.toLowerCase() === 'x'
            const cleanText = rawText.trim()
            
            // Parse metadata
            const dueDate = parseDueDate(cleanText)
            const priority = parsePriority(cleanText)
            
            // Clean text
            let displayText = cleanText
            if (priority.level > 0) {
                displayText = displayText.replace(PRIORITY_REGEX, '')
            }
            
            result.push({
                type: 'checkbox',
                lineIndex: index,
                indent: indent || '',
                isChecked,
                text: displayText,
                rawText: cleanText,
                raw: line,
                dueDate: dueDate?.date || null,
                dueDateRaw: dueDate?.raw || null,
                priority: priority.level,
                priorityMarker: priority.marker,
            })
        } else {
            result.push({
                type: 'text',
                lineIndex: index,
                content: line,
                raw: line,
            })
        }
    })
    
    return result
}

export default {
    parseCheckboxes,
    toggleCheckboxAtLine,
    toggleCheckboxAtPosition,
    getTaskStats,
    isCheckboxLine,
    createCheckboxLine,
    parseContentLines,
    isOverdue,
    isDueToday,
}
