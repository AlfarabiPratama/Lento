import { useState, useRef, useEffect } from 'react'

/**
 * MoneyInput - Amount input with Rp prefix
 * 
 * Formats number as you type, stores as integer
 */

/**
 * @param {Object} props
 * @param {number} props.value - Amount in IDR (integer)
 * @param {(value: number) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {boolean} [props.autoFocus]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export function MoneyInput({
    value,
    onChange,
    placeholder = '0',
    autoFocus = false,
    disabled = false,
    className = '',
}) {
    const [displayValue, setDisplayValue] = useState('')
    const inputRef = useRef(null)

    // Sync display value with prop
    useEffect(() => {
        if (value > 0) {
            setDisplayValue(formatNumber(value))
        } else {
            setDisplayValue('')
        }
    }, [value])

    // Auto focus
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus()
        }
    }, [autoFocus])

    /**
     * Format number with thousand separators
     * @param {number} num
     * @returns {string}
     */
    function formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num)
    }

    /**
     * Parse formatted string back to number
     * @param {string} str
     * @returns {number}
     */
    function parseNumber(str) {
        // Remove all non-digit characters
        const cleaned = str.replace(/\D/g, '')
        return parseInt(cleaned, 10) || 0
    }

    const handleChange = (e) => {
        const raw = e.target.value
        const num = parseNumber(raw)

        // Update display with formatting
        if (num > 0) {
            setDisplayValue(formatNumber(num))
        } else {
            setDisplayValue('')
        }

        // Emit integer value
        onChange(num)
    }

    const handleFocus = (e) => {
        // Select all on focus for easy replacement
        e.target.select()
    }

    return (
        <div className={`relative ${className}`}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-medium select-none">
                Rp
            </span>
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                disabled={disabled}
                className="
          input pl-10 text-h3 font-semibold tabular-nums
          focus:ring-2 focus:ring-primary/20
        "
            />
        </div>
    )
}

export default MoneyInput
