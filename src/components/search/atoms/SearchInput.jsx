import { IconSearch, IconX } from '@tabler/icons-react'

/**
 * SearchInput - Search input with icon and clear button
 */
export function SearchInput({
    value,
    onChange,
    onClear,
    placeholder = 'Cari...',
    autoFocus = false,
    className = '',
}) {
    return (
        <div className={`relative flex-1 ${className}`}>
            <IconSearch
                size={20}
                stroke={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-paper-warm border border-line
                   text-body text-ink placeholder:text-ink-muted
                   focus:border-primary focus:ring-2 focus:ring-teal-200 focus:outline-none
                   transition-all"
            />
            {value && (
                <button
                    onClick={onClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                     text-ink-muted hover:text-ink hover:bg-line/50 transition-colors"
                    aria-label="Hapus pencarian"
                >
                    <IconX size={18} stroke={2} />
                </button>
            )}
        </div>
    )
}

export default SearchInput
