/**
 * YearMonthPicker - Quick navigation for calendar
 * 
 * Dropdown/popover to quickly jump to any month/year
 */

import { useState, useRef, useEffect } from 'react'
import { IconChevronDown } from '@tabler/icons-react'

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Generate range of years (current year ± 5)
function generateYears() {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
        years.push(y)
    }
    return years
}

export function YearMonthPicker({ year, month, onChange }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedYear, setSelectedYear] = useState(year)
    const containerRef = useRef(null)

    const years = generateYears()

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Sync selectedYear when year prop changes
    useEffect(() => {
        setSelectedYear(year)
    }, [year])

    const handleMonthClick = (monthIndex) => {
        onChange(selectedYear, monthIndex)
        setIsOpen(false)
    }

    const displayText = `${MONTHS[month]} ${year}`

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-h2 text-ink hover:text-primary transition-colors"
            >
                <span>{displayText}</span>
                <IconChevronDown
                    size={18}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-surface border border-line rounded-xl shadow-lg p-4 min-w-[280px] animate-in fade-in slide-in-from-top-2">
                    {/* Year selector */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setSelectedYear(y => Math.max(years[0], y - 1))}
                            className="p-1.5 rounded-lg hover:bg-paper-warm transition-colors"
                            disabled={selectedYear <= years[0]}
                        >
                            ←
                        </button>
                        <span className="text-h3 text-ink min-w-[60px] text-center">
                            {selectedYear}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedYear(y => Math.min(years[years.length - 1], y + 1))}
                            className="p-1.5 rounded-lg hover:bg-paper-warm transition-colors"
                            disabled={selectedYear >= years[years.length - 1]}
                        >
                            →
                        </button>
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((monthName, i) => {
                            const isSelected = selectedYear === year && i === month
                            const isCurrent = selectedYear === new Date().getFullYear() && i === new Date().getMonth()

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleMonthClick(i)}
                                    className={`
                                        py-2 px-3 rounded-lg text-small transition-all
                                        ${isSelected ? 'bg-primary text-white' : ''}
                                        ${isCurrent && !isSelected ? 'bg-primary/10 text-primary font-medium' : ''}
                                        ${!isSelected && !isCurrent ? 'hover:bg-paper-warm text-ink' : ''}
                                    `}
                                >
                                    {monthName.slice(0, 3)}
                                </button>
                            )
                        })}
                    </div>

                    {/* Quick actions */}
                    <div className="mt-4 pt-3 border-t border-line flex justify-center">
                        <button
                            type="button"
                            onClick={() => {
                                const now = new Date()
                                onChange(now.getFullYear(), now.getMonth())
                                setIsOpen(false)
                            }}
                            className="text-small text-primary hover:underline"
                        >
                            Hari Ini
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default YearMonthPicker
