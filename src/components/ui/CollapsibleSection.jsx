/**
 * CollapsibleSection - Expandable section with persistent state
 * 
 * Remembers user preference in localStorage after first interaction.
 * Perfect for progressive disclosure of secondary content.
 */

import { useState, useEffect } from 'react'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'

const STORAGE_KEY_PREFIX = 'lento.collapse.'

export function CollapsibleSection({
    id,
    title,
    defaultOpen = true,
    children,
    className = '',
    badge,
}) {
    const storageKey = `${STORAGE_KEY_PREFIX}${id}`

    // Initialize from localStorage or default
    const [isOpen, setIsOpen] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey)
            if (saved !== null) {
                return saved === 'true'
            }
            return defaultOpen
        } catch {
            return defaultOpen
        }
    })

    // Persist state changes
    const toggle = () => {
        const next = !isOpen
        setIsOpen(next)
        try {
            localStorage.setItem(storageKey, String(next))
        } catch {
            // localStorage might be full or disabled
        }
    }

    return (
        <section className={className}>
            <button
                type="button"
                onClick={toggle}
                className="w-full flex items-center justify-between py-2 text-left group"
                aria-expanded={isOpen}
                aria-controls={`collapse-content-${id}`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-ink-muted group-hover:text-ink transition-colors">
                        {isOpen ? (
                            <IconChevronDown size={18} stroke={2} />
                        ) : (
                            <IconChevronRight size={18} stroke={2} />
                        )}
                    </span>
                    <span className="text-overline">{title}</span>
                    {badge && (
                        <span className="text-tiny text-ink-muted bg-paper-warm px-1.5 py-0.5 rounded">
                            {badge}
                        </span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div
                    id={`collapse-content-${id}`}
                    className="pt-2 space-y-4"
                >
                    {children}
                </div>
            )}
        </section>
    )
}

export default CollapsibleSection
