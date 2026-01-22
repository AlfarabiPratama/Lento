/**
 * ISBN Validation Utilities
 */

export function validateISBN(input) {
    const cleaned = input.replace(/[-\s]/g, '').toUpperCase()

    if (cleaned.length === 13) {
        return validateISBN13(cleaned)
    }

    if (cleaned.length === 10) {
        return validateISBN10(cleaned)
    }

    return false
}

function validateISBN13(isbn) {
    // ISBN-13: mod 10 with alternating weights 1, 3
    const digits = isbn.split('').map(Number)

    // Check if all characters are digits
    if (digits.some(isNaN)) return false

    const sum = digits.reduce((acc, digit, i) => {
        const weight = i % 2 === 0 ? 1 : 3
        return acc + digit * weight
    }, 0)

    return sum % 10 === 0
}

function validateISBN10(isbn) {
    // ISBN-10: mod 11, check digit can be 'X' (=10)
    const chars = isbn.split('')
    const digits = chars.map((c, i) => {
        if (i === 9 && c === 'X') return 10
        const num = parseInt(c)
        return isNaN(num) ? NaN : num
    })

    // Check if all characters are valid
    if (digits.some(isNaN)) return false

    const sum = digits.reduce((acc, digit, i) => {
        return acc + digit * (10 - i)
    }, 0)

    return sum % 11 === 0
}

export function formatISBN(isbn) {
    const cleaned = isbn.replace(/[-\s]/g, '')

    if (cleaned.length === 13) {
        // Format: 978-0-123-45678-9
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7, 12)}-${cleaned.substring(12)}`
    }

    if (cleaned.length === 10) {
        // Format: 0-123-45678-9
        return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 4)}-${cleaned.substring(4, 9)}-${cleaned.substring(9)}`
    }

    return isbn
}
