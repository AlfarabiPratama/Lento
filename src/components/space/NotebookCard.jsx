/**
 * NotebookCard - Display single notebook
 */

import { IconFolder } from '@tabler/icons-react'
import { NOTEBOOK_COLORS } from '../../features/space/notebooks/notebookRepo'

export function NotebookCard({
    notebook,
    isActive = false,
    onClick,
    className = '',
}) {
    const { name, emoji, color, noteCount, isDefault } = notebook
    const colorStyle = NOTEBOOK_COLORS[color] || NOTEBOOK_COLORS.gray

    return (
        <button
            type="button"
            onClick={() => onClick?.(notebook)}
            className={`
        flex items-center gap-3 p-3 rounded-xl text-left
        transition-all duration-200 min-w-[140px]
        ${isActive
                    ? `${colorStyle.light} ${colorStyle.border} border-2 ${colorStyle.text}`
                    : 'bg-paper-warm border-2 border-transparent hover:border-line'
                }
        ${className}
      `}
        >
            <span className="text-xl" aria-hidden="true">{emoji || '📁'}</span>

            <div className="flex-1 min-w-0">
                <p className={`text-small font-medium truncate ${isActive ? '' : 'text-ink'}`}>
                    {name}
                </p>
                <p className="text-tiny text-ink-muted">
                    {noteCount || 0} catatan
                </p>
            </div>
        </button>
    )
}

export default NotebookCard
