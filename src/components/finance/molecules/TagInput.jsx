import { useState } from 'react'
import { IconX, IconPlus } from '@tabler/icons-react'

/**
 * TagInput - Chip-style input for multiple tags
 * 
 * @param {string[]} value - Array of tag strings
 * @param {function} onChange - Callback when tags change
 * @param {string} placeholder - Placeholder text
 */
export function TagInput({ value = [], onChange, placeholder = 'Tambah tag...' }) {
    const [inputValue, setInputValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const handleAddTag = () => {
        const trimmed = inputValue.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
            setInputValue('')
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // Remove last tag when backspace on empty input
            onChange(value.slice(0, -1))
        }
    }

    const handleRemoveTag = (tagToRemove) => {
        onChange(value.filter(t => t !== tagToRemove))
    }

    return (
        <div>
            <label className="text-sm text-[var(--lento-muted)] mb-2 block">Tag</label>
            <div 
                className={`min-h-12 px-3 py-2 rounded-xl border bg-white lento-focus transition-colors ${
                    isFocused ? 'border-[var(--lento-primary)] ring-2 ring-[var(--lento-primary)]/20' : 'border-[var(--lento-border)]'
                }`}
            >
                <div className="flex flex-wrap gap-1.5 items-center">
                    {/* Existing tags */}
                    {value.map((tag, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-sm"
                        >
                            <span>{tag}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:bg-primary/20 rounded-sm transition-colors"
                                aria-label={`Hapus tag ${tag}`}
                            >
                                <IconX size={14} />
                            </button>
                        </span>
                    ))}

                    {/* Input */}
                    <div className="flex-1 flex items-center gap-1 min-w-[120px]">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setIsFocused(false)
                                handleAddTag() // Add tag on blur if there's input
                            }}
                            placeholder={value.length === 0 ? placeholder : ''}
                            className="flex-1 h-8 bg-transparent border-none outline-none text-sm"
                        />
                        {inputValue && (
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="p-1 rounded-md hover:bg-primary/10 text-primary"
                                aria-label="Tambah tag"
                            >
                                <IconPlus size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {value.length > 0 && (
                <p className="text-xs text-[var(--lento-muted)] mt-1">
                    {value.length} tag • Tekan Enter untuk menambah
                </p>
            )}
        </div>
    )
}
