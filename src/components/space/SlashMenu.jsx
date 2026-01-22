import { useEffect, useRef } from 'react'

/**
 * SlashMenu - Popup menu for slash commands with groups
 */
export function SlashMenu({
    commands,
    selectedIndex,
    onSelect,
    position,
    onClose
}) {
    const listRef = useRef(null)

    // Scroll active item into view
    useEffect(() => {
        if (listRef.current) {
            // Flatten logic to find active element implies we need to map flat index to grouped children
            // Simplified: we render flat list but with dividers.
            // But we need to find the element by index.
            // Let's rely on data-index attribute
            const activeItem = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' })
            }
        }
    }, [selectedIndex])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (listRef.current && !listRef.current.contains(e.target)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    if (!commands || commands.length === 0) return null

    // Group commands
    const grouped = commands.reduce((acc, cmd) => {
        const group = cmd.group || 'General'
        if (!acc[group]) acc[group] = []
        acc[group].push(cmd)
        return acc
    }, {})

    // Flatten for rendering with continuous index tracking
    let currentIndex = 0

    return (
        <div
            className="fixed z-50 w-64 bg-surface border border-line rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{
                top: position.top,
                left: position.left,
                maxHeight: '300px'
            }}
        >
            {/* Header / Hint */}
            <div className="text-tiny font-medium text-ink-muted px-3 py-2 bg-paper-warm border-b border-line/50 flex justify-between">
                <span>COMMANDS</span>
                <span className="text-ink-light">Esc to close</span>
            </div>

            <div ref={listRef} className="overflow-y-auto max-h-[260px] py-1">
                {Object.entries(grouped).map(([groupName, groupCommands]) => (
                    <div key={groupName}>
                        <div className="px-3 py-1.5 text-tiny font-bold text-ink-muted uppercase tracking-wider mt-1 mb-0.5">
                            {groupName}
                        </div>
                        {groupCommands.map((cmd) => {
                            const myIndex = currentIndex++
                            const Icon = cmd.icon
                            const isActive = myIndex === selectedIndex

                            return (
                                <button
                                    key={cmd.id}
                                    data-index={myIndex}
                                    onClick={() => onSelect(cmd)}
                                    // Make sure mouse enter updates selection for better feel?
                                    // For now just click handling to avoid battling keyboard state
                                    className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${isActive
                                            ? 'bg-primary-50 text-ink'
                                            : 'hover:bg-paper-warm text-ink-soft'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-md ${isActive ? 'bg-primary text-white' : 'bg-paper text-ink-muted border border-line'
                                        }`}>
                                        <Icon size={16} stroke={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-small font-medium truncate ${isActive ? 'text-primary' : 'text-ink'}`}>
                                            {cmd.label}
                                        </p>
                                        <p className="text-tiny text-ink-muted truncate">
                                            {cmd.description}
                                        </p>
                                    </div>
                                    {/* Hint for what will type */}
                                    {cmd.insert && !cmd.type && (
                                        <span className="text-tiny text-ink-light font-mono opacity-50">
                                            {cmd.insert.trim()}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SlashMenu
