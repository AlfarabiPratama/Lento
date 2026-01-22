/**
 * NotebookList - Horizontal scrollable list of notebooks with navigation arrows
 */

import { useState, useRef, useEffect } from 'react'
import { IconPlus, IconTrash, IconChevronLeft, IconChevronRight, IconEdit } from '@tabler/icons-react'
import { NotebookCard } from './NotebookCard'

export function NotebookList({
    notebooks = [],
    activeNotebookId = null,
    onSelect,
    onCreateNew,
    onEdit,
    onDelete,
    className = '',
}) {
    const [contextMenu, setContextMenu] = useState(null)
    const scrollRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    // Check scroll state
    const checkScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }

    useEffect(() => {
        checkScroll()
        // Check on resize
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [notebooks])

    const scroll = (direction) => {
        if (!scrollRef.current) return
        const amount = 150
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth'
        })
        setTimeout(checkScroll, 300)
    }

    const handleContextMenu = (e, notebook) => {
        if (notebook.isDefault) return
        e.preventDefault()
        setContextMenu({
            notebookId: notebook.id,
            notebookName: notebook.name,
            x: e.clientX || e.touches?.[0]?.clientX || 0,
            y: e.clientY || e.touches?.[0]?.clientY || 0,
        })
    }

    const handleDelete = () => {
        if (contextMenu && onDelete) {
            onDelete(contextMenu.notebookId)
        }
        setContextMenu(null)
    }

    return (
        <div className={`relative min-w-0 ${className}`}>
            {/* Left arrow */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 
                        flex items-center justify-center
                        bg-surface/90 rounded-full shadow-sm border border-line
                        hover:bg-paper-warm transition-colors"
                    aria-label="Geser kiri"
                >
                    <IconChevronLeft size={14} className="text-ink-muted" />
                </button>
            )}

            {/* Right arrow */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 
                        flex items-center justify-center
                        bg-surface/90 rounded-full shadow-sm border border-line
                        hover:bg-paper-warm transition-colors"
                    aria-label="Geser kanan"
                >
                    <IconChevronRight size={14} className="text-ink-muted" />
                </button>
            )}

            {/* Scrollable strip */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-2 overflow-x-auto pb-1 px-1"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {notebooks.map(notebook => (
                    <div
                        key={notebook.id}
                        className="shrink-0"
                        onContextMenu={(e) => handleContextMenu(e, notebook)}
                        onTouchStart={(e) => {
                            if (notebook.isDefault) return
                            const timer = setTimeout(() => {
                                handleContextMenu(e, notebook)
                            }, 500)
                            e.target._longPressTimer = timer
                        }}
                        onTouchEnd={(e) => {
                            clearTimeout(e.target._longPressTimer)
                        }}
                    >
                        <NotebookCard
                            notebook={notebook}
                            isActive={activeNotebookId === notebook.id}
                            onClick={onSelect}
                        />
                    </div>
                ))}

                {/* Add new notebook */}
                <button
                    type="button"
                    onClick={onCreateNew}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0
                        border border-dashed border-line
                        hover:border-primary hover:bg-primary/5
                        transition-all text-small text-ink-muted"
                    aria-label="Tambah ruang baru"
                >
                    <IconPlus size={16} />
                    <span>Baru</span>
                </button>
            </div>

            {/* Context menu for edit/delete */}
            {contextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setContextMenu(null)}
                    />
                    <div
                        className="fixed z-50 bg-surface rounded-lg shadow-lg border border-line py-1 min-w-[160px]"
                        style={{
                            top: contextMenu.y,
                            left: contextMenu.x,
                            transform: 'translate(-50%, 8px)'
                        }}
                    >
                        {/* Edit option */}
                        <button
                            onClick={() => {
                                if (onEdit) {
                                    const nb = notebooks.find(n => n.id === contextMenu.notebookId)
                                    if (nb) onEdit(nb)
                                }
                                setContextMenu(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-small text-ink hover:bg-paper-warm transition-colors"
                        >
                            <IconEdit size={16} />
                            <span>Edit ruang</span>
                        </button>
                        {/* Delete option */}
                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center gap-2 px-3 py-2 text-small text-danger hover:bg-danger/10 transition-colors"
                        >
                            <IconTrash size={16} />
                            <span>Hapus ruang</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default NotebookList

