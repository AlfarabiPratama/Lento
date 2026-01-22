/**
 * Track Row Component
 * 
 * Displays a single track in the soundscapes panel.
 * Shows active state with checkmark indicator.
 */

import { IconCheck } from '@tabler/icons-react'

export function SoundRow({ track, active, onClick }) {
    const Icon = track.icon

    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 p-3 rounded-lg
        transition-all duration-200
        ${active
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'border-2 border-transparent hover:bg-surface hover:border-line'
                }
      `}
            aria-pressed={active}
            aria-label={`${track.label}${active ? ' (dipilih)' : ''}`}
        >
            {Icon && <Icon size={20} className={active ? 'text-primary' : 'text-ink-muted'} />}

            <div className="flex-1 text-left">
                <p className={`text-body font-medium ${active ? 'text-primary' : 'text-ink'}`}>
                    {track.label}
                </p>
                <p className="text-tiny text-ink-muted">
                    {track.description}
                </p>
            </div>

            {active && (
                <IconCheck size={16} className="text-primary flex-shrink-0" />
            )}
        </button>
    )
}

export default SoundRow
