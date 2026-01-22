import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IconPlus, IconX, IconSearch, IconChevronLeft, IconFileText, IconFolderShare } from '@tabler/icons-react'
import { usePages, usePage } from '../hooks/usePages'
import EmptyState from '../components/EmptyState'
import { ShareButton } from '../components/ui/ShareButton'
import { buildNoteShareText } from '../lib/share'
import { TagsSidebar } from '../components/space/TagsSidebar'
import { InlineTagChip, TagChipList } from '../components/space/TagChip'
import { LinkChipList, BacklinksPanel } from '../components/space/LinkChips'
import { extractTags } from '../features/space/tagParser'
import { extractLinks } from '../features/space/linkParser'
import { SlashMenu } from '../components/space/SlashMenu'
import { getFilteredCommands, getDynamicInsert } from '../features/space/slashCommands'

// Notebooks
import { useNotebooks } from '../features/space/notebooks/useNotebooks'
import { NotebookList } from '../components/space/NotebookList'
import { CreateNotebookModal } from '../components/space/CreateNotebookModal'
import { DEFAULT_NOTEBOOK_ID } from '../features/space/notebooks/notebookRepo'

/**
 * Space - dengan Tags, Links, Backlinks, dan Slash Commands
 */
function Space() {
    const [searchParams, setSearchParams] = useSearchParams()
    const {
        pages,
        loading,
        create,
        remove,
        search,
        updateOptimistic,
        // Tag related props
        allTags,
        selectedTags,
        tagFilterMode,
        setTagFilterMode,
        toggleTag,
        activeSmartFilter,
        setSmartFilter,
        // Link related
        resolveLink,
        getBacklinks,
        // Notebook related
        activeNotebookId: hookActiveNotebookId,
        setNotebookFilter,
        moveToNotebook,
        moveAllToNotebook,
        refresh: refreshPages,
    } = usePages()

    const [selectedId, setSelectedId] = useState(null)
    const { page, update: updatePage } = usePage(selectedId)

    const [searchQuery, setSearchQuery] = useState('')
    const [editContent, setEditContent] = useState('')
    const [editTitle, setEditTitle] = useState('')
    const [saveStatus, setSaveStatus] = useState('saved')

    // Slash Command State
    const [slashState, setSlashState] = useState({
        isOpen: false,
        query: '',
        index: 0, // Selection index in menu
        position: { top: 0, left: 0 },
        startPos: 0 // Position where slash started
    })

    const editorRef = useRef(null)

    // Notebooks
    const {
        notebooks,
        loading: notebooksLoading,
        create: createNotebook,
        update: updateNotebook,
        remove: removeNotebook,
        refresh: refreshNotebooks,
    } = useNotebooks()
    const [showCreateNotebook, setShowCreateNotebook] = useState(false)
    const [editingNotebook, setEditingNotebook] = useState(null) // null = create mode, notebook = edit mode

    // Note context menu for "Move to notebook"
    const [noteContextMenu, setNoteContextMenu] = useState(null) // { noteId, x, y }

    // Derived commands for SlashMenu
    const filteredCommands = useMemo(() => {
        if (!slashState.isOpen) return []
        return getFilteredCommands(slashState.query)
    }, [slashState.isOpen, slashState.query])

    // Handle ?open=quicknote query param from shortcuts
    useEffect(() => {
        const openParam = searchParams.get('open')

        if (openParam === 'quicknote') {
            // Create new note immediately
            create({ title: 'Quick Note' }).then(newPage => {
                setSelectedId(newPage.id)
            })
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams, create])

    useEffect(() => {
        if (page) {
            setEditTitle(page.title)
            setEditContent(page.content)
            setSaveStatus('saved')
        }
    }, [page])

    // Compute tags from active content for instant feedback
    const currentTags = useMemo(() => {
        return extractTags(editContent)
    }, [editContent])

    // Compute links from active content for instant feedback
    const currentLinks = useMemo(() => {
        const extracted = extractLinks(editContent)
        // Enhance with resolution status
        return extracted.map(link => {
            const params = resolveLink(link.titleNorm)
            return {
                ...link,
                isResolved: !!params,
                targetId: params?.id
            }
        })
    }, [editContent, resolveLink])

    // Get backlinks for current page
    const currentBacklinks = useMemo(() => {
        if (!page) return []
        return getBacklinks(page.title)
    }, [page, getBacklinks])

    // Debounced save to DB
    useEffect(() => {
        if (!selectedId || saveStatus !== 'dirty') return

        const timer = setTimeout(async () => {
            setSaveStatus('saving')
            await updatePage({ title: editTitle, content: editContent })
            setSaveStatus('saved')
        }, 800)

        return () => clearTimeout(timer)
    }, [editContent, editTitle, selectedId, updatePage, saveStatus])

    // Optimistic update
    const updateContent = (newContent) => {
        setEditContent(newContent)
        setSaveStatus('dirty')
        if (selectedId) {
            updateOptimistic(selectedId, { content: newContent })
        }
    }

    const handleContentChange = (e) => {
        updateContent(e.target.value)
    }

    const handleTitleChange = (e) => {
        const value = e.target.value
        setEditTitle(value)
        setSaveStatus('dirty')
        if (selectedId) {
            updateOptimistic(selectedId, { title: value })
        }
    }

    // --- Slash Command Handlers ---

    // Execute command using safe range insertion
    const executeCommand = (cmd) => {
        const textarea = editorRef.current
        if (!textarea) return

        let insert = cmd.insert
        if (cmd.type === 'dynamic') {
            insert = getDynamicInsert(cmd.id)
        }

        // Calculate range to replace: from slashState.startPos to current selectionEnd
        // Assuming current cursor is at end of query
        const endPos = textarea.selectionEnd
        const startPos = slashState.startPos

        // Validate sanity: startPos should be < endPos, and char at startPos should be '/'
        if (startPos >= endPos || textarea.value[startPos] !== '/') {
            // Something wrong, just close
            setSlashState(prev => ({ ...prev, isOpen: false }))
            return
        }

        textarea.setRangeText(insert, startPos, endPos, 'end')

        // Trigger generic change handler update
        // setRangeText doesn't fire input event automatically in React state land usually?
        // Actually we need to update React state
        updateContent(textarea.value)

        setSlashState(prev => ({ ...prev, isOpen: false, query: '', index: 0 }))

        textarea.focus()
    }

    const handleKeyDown = (e) => {
        const textarea = e.target

        // Slash Menu Navigation
        if (slashState.isOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSlashState(prev => ({
                    ...prev,
                    index: Math.min(prev.index + 1, filteredCommands.length - 1)
                }))
                return
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSlashState(prev => ({
                    ...prev,
                    index: Math.max(prev.index - 1, 0)
                }))
                return
            }
            if (e.key === 'Enter') {
                e.preventDefault()
                if (filteredCommands[slashState.index]) {
                    executeCommand(filteredCommands[slashState.index])
                }
                return
            }
            if (e.key === 'Escape') {
                e.preventDefault()
                setSlashState(prev => ({ ...prev, isOpen: false }))
                return
            }
            if (e.key === ' ') {
                // Close menu if space is typed (optional rule, but good for "not annoying")
                // Unless we want to support multi-word queries?
                // For MVP single word query is safer and cleaner
                setSlashState(prev => ({ ...prev, isOpen: false }))
                return
            }
        }

        // Trigger Slash Menu
        if (e.key === '/') {
            const cursor = textarea.selectionStart
            const text = textarea.value

            // Rule 1: Only trigger if at start of line OR after whitespace
            const prevChar = cursor > 0 ? text[cursor - 1] : '\n'

            if (/\s/.test(prevChar)) {
                // Rule 5: Positioning fallback
                // Calculate position relative to container
                const rect = textarea.getBoundingClientRect()
                // Simple logic: Fixed offset from top-left, or try to guess line height
                // Since we don't have caret-xy, use a fixed position near the "typing area" 
                // or just absolute bottom-left of the textarea wrapper for stability

                setSlashState({
                    isOpen: true,
                    query: '',
                    index: 0,
                    startPos: cursor, // Save where the slash is
                    position: {
                        top: rect.top + 50, // Arbitrary "near top" or we can do better?
                        left: rect.left + 20
                    }
                })
            }
        }
    }

    // Monitor input while menu is open to update query
    const handleInput = (e) => {
        if (!slashState.isOpen) return

        const textarea = e.target
        const cursor = textarea.selectionStart
        const text = e.target.value
        const startPos = slashState.startPos

        // Calculate Query: Text between startPos+1 and cursor
        // Check if slash is still there at startPos
        if (text[startPos] !== '/') {
            setSlashState(prev => ({ ...prev, isOpen: false }))
            return
        }

        // Rule 2: Query should not contain newlines or be too long?
        // If cursor moved before startPos (user moved back), close
        if (cursor <= startPos) {
            setSlashState(prev => ({ ...prev, isOpen: false }))
            return
        }

        const query = text.slice(startPos + 1, cursor)

        // Rule: If query contains whitespace, close (assuming single word commands)
        // This makes it behave like "type command, space to cancel if not found"
        if (/\s/.test(query)) {
            setSlashState(prev => ({ ...prev, isOpen: false }))
        } else {
            setSlashState(prev => ({ ...prev, query, index: 0 }))
        }
    }

    const handleSearch = useCallback(async (query) => {
        setSearchQuery(query)
        await search(query)
    }, [search])

    const handleCreate = async () => {
        // Create note in active notebook, or Inbox if viewing all
        const notebookId = hookActiveNotebookId || DEFAULT_NOTEBOOK_ID
        const newPage = await create({ title: 'Catatan baru', notebookId })
        setSelectedId(newPage.id)
    }

    const handleDelete = async (id) => {
        await remove(id)
        if (selectedId === id) {
            setSelectedId(null)
        }
    }

    // Handle Wikilink click
    const handleLinkClick = async (link) => {
        if (link.isResolved && link.targetId) {
            // Navigate to existing note
            setSelectedId(link.targetId)
        } else {
            // Prompt to create new note
            if (window.confirm(`Catatan "${link.originalTitle}" belum ada. Buat baru?`)) {
                const newPage = await create({ title: link.originalTitle })
                setSelectedId(newPage.id)
            }
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }

    const saveStatusConfig = {
        saved: { icon: '✓', text: 'Tersimpan', class: 'text-success' },
        saving: { icon: '●', text: 'Menyimpan...', class: 'text-secondary animate-pulse' },
        dirty: { icon: '●', text: 'Belum disimpan', class: 'text-ink-soft' },
    }

    const status = saveStatusConfig[saveStatus]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <span className="text-ink-muted">Memuat...</span>
            </div>
        )
    }

    return (
        <div className="flex -mx-4 lg:-mx-6 -my-5 lg:-my-6 min-h-screen-nav animate-in max-w-[100vw] overflow-x-hidden">
            {/* Left pane - Sidebar */}
            <div className={`w-full lg:w-72 shrink-0 border-r border-line bg-surface flex flex-col ${selectedId ? 'hidden lg:flex' : ''}`}>
                <div className="p-4 border-b border-line/60">
                    <h1 className="text-h2 text-ink mb-3">Space</h1>
                    {/* Search - icon di input: 18px */}
                    <div className="relative">
                        <IconSearch
                            size={18}
                            stroke={1.5}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                        />
                        <input
                            type="search"
                            placeholder={hookActiveNotebookId
                                ? `Cari di ${notebooks.find(nb => nb.id === hookActiveNotebookId)?.name || 'ruang ini'}...`
                                : 'Cari semua catatan...'}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="input-search text-small"
                            aria-label="Cari catatan"
                        />
                    </div>
                    {/* Scope toggle - only show when inside a notebook */}
                    {hookActiveNotebookId && (
                        <button
                            onClick={() => setNotebookFilter(null)}
                            className="mt-2 text-tiny text-primary hover:text-primary-dark transition-colors"
                        >
                            🔍 Cari di semua ruang
                        </button>
                    )}
                </div>

                {/* Notebooks Section */}
                <div className="py-3 border-b border-line/60 overflow-hidden max-w-full">
                    <p className="text-overline mb-2 px-4">Ruang</p>
                    <div className="overflow-x-auto px-4 max-w-full" style={{ scrollbarWidth: 'none' }}>
                        <NotebookList
                            notebooks={notebooks}
                            activeNotebookId={hookActiveNotebookId}
                            onSelect={(nb) => setNotebookFilter(nb.id)}
                            onCreateNew={() => {
                                setEditingNotebook(null)
                                setShowCreateNotebook(true)
                            }}
                            onEdit={(nb) => {
                                setEditingNotebook(nb)
                                setShowCreateNotebook(true)
                            }}
                            onDelete={async (notebookId) => {
                                // Move all notes to Inbox first
                                await moveAllToNotebook(notebookId, 'inbox')
                                // Then delete the notebook
                                await removeNotebook(notebookId)
                                // Clear filter if deleted notebook was active
                                if (hookActiveNotebookId === notebookId) {
                                    setNotebookFilter(null)
                                }
                                // Refresh
                                refreshNotebooks()
                                refreshPages()
                            }}
                        />
                    </div>
                </div>

                {/* Tags Sidebar */}
                <TagsSidebar
                    allTags={allTags}
                    selectedTags={selectedTags}
                    tagFilterMode={tagFilterMode}
                    setTagFilterMode={setTagFilterMode}
                    onToggleTag={toggleTag}
                    activeSmartFilter={activeSmartFilter}
                    onSetSmartFilter={setSmartFilter}
                />

                <div className="flex-1 overflow-y-auto p-2">
                    {pages.length > 0 ? (
                        <div className="space-y-1">
                            {pages.map((p) => (
                                <div
                                    key={p.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedId(p.id)}
                                    onContextMenu={(e) => {
                                        e.preventDefault()
                                        setNoteContextMenu({
                                            noteId: p.id,
                                            x: e.clientX,
                                            y: e.clientY,
                                        })
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setSelectedId(p.id)
                                        }
                                    }}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-normal group cursor-pointer ${selectedId === p.id
                                        ? 'bg-primary-50 border border-primary-100'
                                        : 'hover:bg-paper-warm border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                            {/* Icon dokumen inline: 16px */}
                                            <IconFileText size={16} stroke={1.5} className={`mt-0.5 shrink-0 ${selectedId === p.id ? 'text-primary' : 'text-ink-muted'
                                                }`} />
                                            <div className="min-w-0">
                                                <p className={`text-small font-medium truncate ${selectedId === p.id ? 'text-primary' : 'text-ink'
                                                    }`}>
                                                    {p.title || 'Untitled'}
                                                </p>

                                                {/* Notebook badge - only show when viewing all notes */}
                                                {!hookActiveNotebookId && (() => {
                                                    const noteNotebook = notebooks.find(nb => nb.id === (p.notebookId || DEFAULT_NOTEBOOK_ID))
                                                    if (!noteNotebook) return null
                                                    return (
                                                        <span className="inline-flex items-center gap-1 text-tiny text-ink-muted bg-paper-warm px-1.5 py-0.5 rounded mt-0.5">
                                                            <span>{noteNotebook.emoji}</span>
                                                            <span className="truncate max-w-[80px]">{noteNotebook.name}</span>
                                                        </span>
                                                    )
                                                })()}

                                                {/* Tags in list */}
                                                {p.tags && p.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {p.tags.slice(0, 3).map(tag => (
                                                            <InlineTagChip key={tag} tag={tag} />
                                                        ))}
                                                        {p.tags.length > 3 && (
                                                            <span className="text-tiny text-ink-muted">+{p.tags.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-caption text-ink-muted mt-0.5">
                                                    {formatDate(p.updated_at)} · {p.word_count} kata
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                            {/* Move to notebook button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setNoteContextMenu({
                                                        noteId: p.id,
                                                        x: e.clientX,
                                                        y: e.clientY,
                                                    })
                                                }}
                                                className="min-w-11 min-h-11 flex items-center justify-center rounded text-ink-muted hover:text-primary hover:bg-primary/10"
                                                aria-label="Pindahkan ke ruang lain"
                                                title="Pindahkan ke ruang lain"
                                            >
                                                <IconFolderShare size={16} stroke={1.5} />
                                            </button>
                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                                                className="min-w-11 min-h-11 flex items-center justify-center rounded text-ink-muted hover:text-danger hover:bg-danger/10"
                                                aria-label="Hapus catatan"
                                            >
                                                <IconX size={16} stroke={1.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="📄"
                            title="Belum ada catatan"
                            description="Catat ide, pikiran, atau apapun yang ingin kamu simpan."
                            primaryAction={handleCreate}
                            primaryLabel="Buat catatan pertama"
                        />
                    )}
                </div>

                {pages.length > 0 && (
                    <div className="p-3 border-t border-line/60">
                        <button
                            onClick={handleCreate}
                            className="btn-primary w-full"
                            aria-label="Buat catatan baru"
                        >
                            {/* Icon tombol: 20px */}
                            <IconPlus size={20} stroke={2} />
                            <span>Catatan baru</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Right pane - Editor */}
            <div className={`flex-1 flex flex-col bg-paper min-w-0 max-w-full overflow-x-hidden ${!selectedId ? 'hidden lg:flex' : ''} relative`}>
                {selectedId && page ? (
                    <>
                        <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-line/60 bg-surface">
                            <button
                                onClick={() => setSelectedId(null)}
                                className="lg:hidden btn-ghost btn-sm"
                                aria-label="Kembali ke daftar"
                            >
                                {/* Icon tombol: 20px */}
                                <IconChevronLeft size={20} stroke={2} />
                                <span>Kembali</span>
                            </button>
                            <div className="hidden lg:block" />
                            <div className="flex items-center gap-2">
                                <ShareButton
                                    title={`${editTitle || 'Catatan'} — Lento`}
                                    text={buildNoteShareText({
                                        title: editTitle,
                                        content: editContent
                                    })}
                                    size="sm"
                                />
                                <span className={`text-caption flex items-center gap-1.5 ${status.class}`}>
                                    <span>{status.icon}</span>
                                    <span>{status.text}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col max-w-narrow mx-auto w-full overflow-y-auto pb-20 relative">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={handleTitleChange}
                                placeholder="Judul catatan"
                                className="px-4 lg:px-6 py-4 text-h1 text-ink bg-transparent border-none focus:outline-none placeholder:text-ink-soft shrink-0"
                            />

                            {/* Tag chips below title */}
                            {(currentTags?.length > 0 || currentLinks?.length > 0) && (
                                <div className="px-4 lg:px-6 pb-2 flex flex-wrap gap-3 shrink-0">
                                    {currentTags?.length > 0 && (
                                        <TagChipList
                                            tags={currentTags.map(t => ({ tag: t }))}
                                            selectedTags={[]}
                                            onTagClick={() => { }}
                                        />
                                    )}
                                    {currentLinks?.length > 0 && (
                                        <LinkChipList
                                            links={currentLinks}
                                            onLinkClick={handleLinkClick}
                                        />
                                    )}
                                </div>
                            )}

                            <div className="relative flex-1 flex flex-col">
                                <textarea
                                    id="note-editor"
                                    ref={editorRef}
                                    value={editContent}
                                    onChange={handleContentChange}
                                    onKeyDown={handleKeyDown}
                                    onInput={handleInput}
                                    placeholder="Ketik '/' untuk perintah..."
                                    className="flex-none min-h-[50vh] px-4 lg:px-6 py-2 text-body text-ink bg-transparent border-none resize-none focus:outline-none placeholder:text-ink-soft leading-relaxed"
                                />

                                {/* Slash Menu Popup */}
                                {slashState.isOpen && (
                                    <SlashMenu
                                        commands={filteredCommands}
                                        selectedIndex={slashState.index}
                                        onSelect={executeCommand}
                                        onClose={() => setSlashState({ ...slashState, isOpen: false })}
                                        position={{
                                            // Fallback fixed position inside editor area relative to container
                                            // Simple: 100px from top, 20px from left of textarea
                                            // or floating near bottom left
                                            top: slashState.position.top,
                                            left: slashState.position.left
                                        }}
                                    />
                                )}
                            </div>

                            <div className="px-4 lg:px-6">
                                <BacklinksPanel
                                    backlinks={currentBacklinks}
                                    onNavigate={setSelectedId}
                                />
                            </div>

                            <div className="px-4 lg:px-6 py-6 border-t border-line/40 mt-6 flex items-center justify-between text-caption text-ink-muted">
                                <span>{editContent.trim().split(/\s+/).filter(Boolean).length} kata</span>
                                <span>Diperbarui {formatDate(page.updated_at)}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-ink-muted p-6">
                        <div>
                            {/* Icon besar: 48px untuk empty state */}
                            <IconFileText size={48} stroke={1} className="mx-auto mb-4 text-ink-light" />
                            <p className="text-body mb-4">Pilih catatan atau buat baru</p>
                            <button
                                onClick={handleCreate}
                                className="btn-primary"
                                aria-label="Buat catatan baru"
                            >
                                <IconPlus size={20} stroke={2} />
                                <span>Catatan baru</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Notebook Modal */}
            {showCreateNotebook && (
                <CreateNotebookModal
                    notebook={editingNotebook}
                    onSubmit={async (data) => {
                        if (editingNotebook) {
                            // Edit mode
                            await updateNotebook(editingNotebook.id, data)
                        } else {
                            // Create mode
                            await createNotebook(data)
                        }
                        refreshNotebooks()
                    }}
                    onClose={() => {
                        setShowCreateNotebook(false)
                        setEditingNotebook(null)
                    }}
                />
            )}

            {/* Note Context Menu - Move to Notebook */}
            {noteContextMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setNoteContextMenu(null)}
                    />

                    {/* Menu */}
                    <div
                        className="fixed z-50 bg-surface rounded-xl shadow-xl border border-line p-2 min-w-[180px]"
                        style={{
                            top: noteContextMenu.y,
                            left: Math.min(noteContextMenu.x, window.innerWidth - 200),
                            transform: 'translateY(8px)'
                        }}
                    >
                        <p className="text-tiny text-ink-muted px-2 py-1">Pindahkan ke:</p>
                        {notebooks.map(nb => (
                            <button
                                key={nb.id}
                                onClick={async () => {
                                    await moveToNotebook(noteContextMenu.noteId, nb.id)
                                    refreshPages()
                                    refreshNotebooks()
                                    setNoteContextMenu(null)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-small text-ink hover:bg-paper-warm rounded-lg transition-colors"
                            >
                                <span>{nb.emoji}</span>
                                <span className="truncate">{nb.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default Space
