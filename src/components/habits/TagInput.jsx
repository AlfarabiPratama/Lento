import { useState } from 'react'
import { IconX, IconPlus } from '@tabler/icons-react'

/**
 * TagInput - Input untuk custom tags dengan chips
 * 
 * @param {Object} props
 * @param {Array<string>} props.tags - Array of tags
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label for the field
 * @param {number} props.maxTags - Maximum number of tags (default: 5)
 */
export function TagInput({ tags = [], onChange, label = 'Tags', maxTags = 5 }) {
    const [inputValue, setInputValue] = useState('')

    const handleAddTag = () => {
        const trimmed = inputValue.trim()
        
        if (!trimmed) return
        if (tags.length >= maxTags) return
        if (tags.includes(trimmed)) {
            setInputValue('')
            return
        }

        onChange([...tags, trimmed])
        setInputValue('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            // Remove last tag on backspace when input is empty
            onChange(tags.slice(0, -1))
        }
    }

    const handleRemoveTag = (indexToRemove) => {
        onChange(tags.filter((_, index) => index !== indexToRemove))
    }

    return (
        <div>
            {label && (
                <label className="text-small text-ink-muted mb-2 block">
                    {label} (opsional)
                </label>
            )}

            {/* Tags display */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                        <div
                            key={index}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-small"
                        >
                            <span>{tag}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                aria-label={`Hapus tag ${tag}`}
                            >
                                <IconX size={14} stroke={2.5} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            {tags.length < maxTags && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik dan tekan Enter..."
                        className="input flex-1"
                        maxLength={20}
                    />
                    <button
                        type="button"
                        onClick={handleAddTag}
                        disabled={!inputValue.trim()}
                        className="min-w-11 min-h-11 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Tambah tag"
                    >
                        <IconPlus size={20} stroke={2} />
                    </button>
                </div>
            )}

            {/* Helper text */}
            <p className="text-tiny text-ink-muted mt-1">
                {tags.length}/{maxTags} tags • Tekan Enter atau klik + untuk menambah
            </p>
        </div>
    )
}
