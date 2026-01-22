import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useJournals } from '../hooks/useJournals'
import EmptyState from '../components/EmptyState'
import { ShareButton } from '../components/ui/ShareButton'
import { buildJournalShareText } from '../lib/share'

const moods = [
    { value: 'great', emoji: '😊', label: 'Senang' },
    { value: 'good', emoji: '🙂', label: 'Baik' },
    { value: 'okay', emoji: '😐', label: 'Biasa' },
    { value: 'bad', emoji: '😔', label: 'Kurang' },
    { value: 'awful', emoji: '😢', label: 'Buruk' },
]

const journalPrompts = [
    "Apa yang membuatmu bersyukur hari ini?",
    "Apa yang ingin kamu capai minggu ini?",
    "Bagaimana perasaanmu tentang pekerjaan/sekolah?",
    "Apa yang membuatmu tersenyum hari ini?",
]

/**
 * Journal - dengan icon sizing sesuai guideline
 */
function Journal() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { journals, loading, create, remove } = useJournals()
    const [content, setContent] = useState('')
    const [mood, setMood] = useState(null)
    const [saving, setSaving] = useState(false)
    const [showComposer, setShowComposer] = useState(false)

    // Handle ?open=quick query param from shortcuts
    useEffect(() => {
        const openParam = searchParams.get('open')

        if (openParam === 'quick') {
            setShowComposer(true)
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim()) return

        try {
            setSaving(true)
            await create({ content, mood, type: 'quick' })
            setContent('')
            setMood(null)
            setShowComposer(false)
        } finally {
            setSaving(false)
        }
    }

    const handleUsePrompt = (prompt) => {
        setContent(prompt + '\n\n')
        setShowComposer(true)
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()

        if (isToday) {
            return `Hari ini, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
        }

        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getMoodEmoji = (moodValue) => {
        const found = moods.find(m => m.value === moodValue)
        return found ? found.emoji : ''
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <span className="text-ink-muted">Memuat...</span>
            </div>
        )
    }

    // Empty state
    if (journals.length === 0 && !showComposer) {
        return (
            <div className="space-y-6 animate-in">
                <header>
                    <h1 className="text-h1 text-ink">Jurnal</h1>
                    <p className="text-body text-ink-muted mt-1">Tuliskan apa yang kamu rasakan.</p>
                </header>

                <EmptyState
                    icon="📝"
                    title="Belum ada jurnal"
                    description="Menulis membantu menjernihkan pikiran. Mulai dengan 3 menit setiap hari."
                    primaryAction={() => setShowComposer(true)}
                    primaryLabel="Tulis jurnal pertama"
                />

                <div className="card">
                    <h3 className="text-h2 text-ink mb-3">Butuh inspirasi?</h3>
                    <div className="space-y-2">
                        {journalPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleUsePrompt(prompt)}
                                className="w-full text-left p-3 rounded-lg border border-line hover:border-primary hover:bg-primary-50/30 transition-all text-body text-ink"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-h1 text-ink">Jurnal</h1>
                    <p className="text-body text-ink-muted mt-1">Tuliskan apa yang kamu rasakan.</p>
                </div>
                {!showComposer && journals.length > 0 && (
                    <button
                        onClick={() => setShowComposer(true)}
                        className="btn-primary btn-sm"
                        aria-label="Tulis jurnal baru"
                    >
                        {/* Icon tombol: 20px */}
                        <IconPlus size={20} stroke={2} />
                        <span>Tulis</span>
                    </button>
                )}
            </header>

            {/* Composer */}
            {showComposer && (
                <form onSubmit={handleSubmit} className="card space-y-4 animate-in">
                    <div className="flex items-center justify-between">
                        <h2 className="text-h2 text-ink">Jurnal 3 menit</h2>
                        <span className="tag-secondary">
                            {content.trim().split(/\s+/).filter(Boolean).length} kata
                        </span>
                    </div>

                    {/* Mood selector - tidak butuh icon, pakai emoji saja */}
                    <div className="space-y-2">
                        <p className="text-small text-ink-muted">Bagaimana perasaanmu?</p>
                        <div className="flex gap-2">
                            {moods.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setMood(mood === m.value ? null : m.value)}
                                    className={`flex-1 py-2.5 rounded-lg text-center transition-all duration-normal ${mood === m.value
                                        ? 'bg-primary-50 border-2 border-primary shadow-sm'
                                        : 'bg-paper-warm hover:bg-paper-cream border-2 border-transparent'
                                        }`}
                                    title={m.label}
                                    aria-label={m.label}
                                >
                                    <span className="text-xl">{m.emoji}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <textarea
                        placeholder="Hari ini aku merasa..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="textarea"
                        rows={5}
                        autoFocus
                    />

                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary" disabled={!content.trim() || saving}>
                            {saving ? 'Menyimpan...' : 'Simpan jurnal'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowComposer(false); setContent(''); setMood(null); }}
                            className="btn-secondary"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            )}

            {/* Journal history */}
            {journals.length > 0 && (
                <section className="space-y-3">
                    <div className="section-header">
                        <h2 className="section-title">Histori</h2>
                        <span className="tag-secondary">{journals.length} entri</span>
                    </div>

                    <div className="space-y-3">
                        {journals.map((entry) => (
                            <div key={entry.id} className="card group">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        {entry.mood && <span className="text-xl">{getMoodEmoji(entry.mood)}</span>}
                                        <span className="text-small text-ink-muted">{formatDate(entry.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShareButton
                                            title="Jurnal — Lento"
                                            text={buildJournalShareText({
                                                date: entry.created_at,
                                                mood: getMoodEmoji(entry.mood),
                                                content: entry.content
                                            })}
                                            size="sm"
                                        />
                                        <button
                                            onClick={() => remove(entry.id)}
                                            className="opacity-0 group-hover:opacity-100 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-danger hover:bg-danger/10 transition-all"
                                            aria-label="Hapus jurnal"
                                        >
                                            <IconX size={20} stroke={1.5} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-body text-ink whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                                <p className="text-caption text-ink-soft mt-3">{entry.word_count} kata</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

export default Journal
