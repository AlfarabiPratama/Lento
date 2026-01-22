import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconX, IconLoader2, IconSearch } from '@tabler/icons-react'
import { useSearchContext } from '../../../contexts/SearchContext'
import { SearchInput } from '../atoms/SearchInput'
import { KeyHint } from '../atoms/KeyHint'
import { ScopeTabs } from '../molecules/ScopeTabs'
import { FilterChipRow } from '../molecules/FilterChipRow'
import { ResultRow } from '../molecules/ResultRow'
import { LentoIconButton } from '../../ui/LentoIconButton'

/**
 * SearchOverlay - Global search overlay
 */
export function SearchOverlay() {
    const navigate = useNavigate()
    const {
        open,
        query,
        results,
        loading,
        filters,
        indexReady,
        closeSearch,
        setQuery,
        setScope,
        setDateFilter,
        setTags,
        clearSearch,
        getAllTags,
    } = useSearchContext()

    // Keyboard shortcut: Escape to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && open) {
                closeSearch()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, closeSearch])

    // Handle result click - navigate to detail
    const handleResultClick = (result) => {
        const { doc } = result

        switch (doc.module) {
            case 'finance':
                navigate('/more/finance')
                break
            case 'journal':
                navigate('/journal')
                break
            case 'space':
                navigate('/space')
                break
            case 'habit':
                navigate('/habits')
                break
            case 'pomodoro':
                navigate('/more/fokus')
                break
            case 'book':
                navigate(`/books/${doc.id}`)
                break
            default:
                navigate('/')
        }

        closeSearch()
    }

    // Handle tag toggle
    const handleTagToggle = (tag) => {
        const currentTags = filters.tags || []
        if (currentTags.includes(tag)) {
            setTags(currentTags.filter(t => t !== tag))
        } else {
            setTags([...currentTags, tag])
        }
    }

    if (!open) return null

    const allTags = indexReady ? getAllTags() : []

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                onClick={closeSearch}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-lg border border-line overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-line">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        onClear={clearSearch}
                        placeholder="Cari di semua modul..."
                        autoFocus
                    />
                    <div className="hidden sm:flex items-center gap-2">
                        <KeyHint keys={['Esc']} />
                    </div>
                    <LentoIconButton
                        icon={IconX}
                        onClick={closeSearch}
                        className="sm:hidden"
                        aria-label="Tutup"
                    />
                </div>

                {/* Scope tabs */}
                <div className="px-4 py-2 border-b border-line/50">
                    <ScopeTabs value={filters.scope} onChange={setScope} />
                </div>

                {/* Filter chips */}
                <div className="px-4 py-2 border-b border-line/50">
                    <FilterChipRow
                        dateFilter={filters.dateFilter}
                        onDateFilterChange={setDateFilter}
                        tags={allTags}
                        selectedTags={filters.tags}
                        onTagToggle={handleTagToggle}
                    />
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <IconLoader2 size={24} className="animate-spin text-primary" />
                            <span className="ml-2 text-body text-ink-muted">Membangun index...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="p-2">
                            {results.map((result) => (
                                <ResultRow
                                    key={result.doc.id}
                                    result={result}
                                    onClick={handleResultClick}
                                />
                            ))}
                        </div>
                    ) : query ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <IconSearch size={48} stroke={1} className="text-ink-light mb-3" />
                            <p className="text-body text-ink-muted">
                                Tidak ditemukan hasil untuk "{query}"
                            </p>
                            <p className="text-small text-ink-muted mt-1">
                                Coba kata kunci lain atau reset filter
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <IconSearch size={48} stroke={1} className="text-ink-light mb-3" />
                            <p className="text-body text-ink-muted">
                                Ketik untuk mencari
                            </p>
                            <p className="text-small text-ink-muted mt-1">
                                Cari di Space, Jurnal, Keuangan, dan lainnya
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchOverlay
