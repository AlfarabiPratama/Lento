import { IconBook, IconPlus, IconSearch, IconRepeat, IconNotebook, IconWallet, IconSparkles } from '@tabler/icons-react'

/**
 * EmptyState - Educative empty state component
 * 
 * Purpose:
 * 1. Explain what this page is for
 * 2. Teach the user how to use it  
 * 3. Provide clear next step + optional quick templates
 * 
 * Best Practice: Empty states should explain, guide, and invite action.
 * Reference: Nielsen Norman Group - Empty States
 */
export function EmptyState({
    icon: Icon = IconBook,
    title,
    description,
    action,
    templates = [],
    onTemplateSelect,
    className = ''
}) {
    return (
        <div className={`text-center py-12 ${className}`}>
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
                <Icon size={32} stroke={1.5} className="text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-h2 text-ink mb-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
                {title}
            </h3>

            {/* Description (calm messaging) */}
            {description && (
                <p className="text-body text-ink-muted mb-6 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
                    {description}
                </p>
            )}

            {/* Quick Templates (optional) */}
            {templates.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
                    {templates.map((template, i) => (
                        <button
                            key={i}
                            onClick={() => onTemplateSelect?.(template)}
                            className="px-3 py-1.5 text-small bg-paper-warm hover:bg-paper-warm/80 text-ink-muted hover:text-ink rounded-full border border-line transition-colors"
                        >
                            {template.emoji && <span className="mr-1">{template.emoji}</span>}
                            {template.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Primary Action */}
            {action && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
                    {action}
                </div>
            )}
        </div>
    )
}

/**
 * Predefined empty state variants with calm messaging
 */
export const EmptyStates = {
    // Books
    NoBooks: ({ onAddBook }) => (
        <EmptyState
            icon={IconBook}
            title="Mulai Rak Buku"
            description="Catat buku yang sedang atau ingin kamu baca. Satu buku sekarang lebih baik dari 10 nanti."
            action={
                <button onClick={onAddBook} className="btn-primary inline-flex items-center gap-2">
                    <IconPlus size={18} stroke={2} />
                    <span>Tambah Buku</span>
                </button>
            }
        />
    ),

    NoSearchResults: ({ query }) => (
        <EmptyState
            icon={IconSearch}
            title="Tidak Ditemukan"
            description={`Tidak ada yang cocok dengan "${query}"`}
        />
    ),

    NoSessions: () => (
        <EmptyState
            icon={IconBook}
            title="Belum Ada Sesi"
            description="Mulai catat progress bacaan kamu"
        />
    ),

    // Habits
    NoHabits: ({ onAddHabit, onTemplateSelect }) => (
        <EmptyState
            icon={IconRepeat}
            title="Mulai dari Satu"
            description="Kebiasaan kecil yang konsisten lebih baik dari target besar yang berhenti. Pilih satu dulu."
            templates={[
                { emoji: '💧', label: 'Minum air', value: 'Minum 2 gelas air' },
                { emoji: '📖', label: 'Baca 5 menit', value: 'Baca 5 menit' },
                { emoji: '🚶', label: 'Jalan kaki', value: 'Jalan 5 menit' },
            ]}
            onTemplateSelect={onTemplateSelect}
            action={
                <button onClick={onAddHabit} className="btn-primary inline-flex items-center gap-2">
                    <IconPlus size={18} stroke={2} />
                    <span>Buat Sendiri</span>
                </button>
            }
        />
    ),

    // Journal
    NoJournals: ({ onWriteJournal }) => (
        <EmptyState
            icon={IconNotebook}
            title="Ruang Jurnal"
            description="Jurnal hanya untukmu, tidak dibagikan ke siapa pun. Cukup tulis 1 hal yang kamu syukuri hari ini."
            action={
                <button onClick={onWriteJournal} className="btn-primary inline-flex items-center gap-2">
                    <IconSparkles size={18} stroke={2} />
                    <span>Tulis Sekarang</span>
                </button>
            }
        />
    ),

    // Finance
    NoTransactions: ({ onAddTransaction, onTemplateSelect }) => (
        <EmptyState
            icon={IconWallet}
            title="Catat Kecil-Kecilan"
            description="Ini bukan app keuangan rumit—cuma tempat catat pengeluaran harian supaya lebih sadar."
            templates={[
                { emoji: '🍔', label: 'Makan', value: { category: 'Makan' } },
                { emoji: '🚗', label: 'Transport', value: { category: 'Transport' } },
                { emoji: '☕', label: 'Ngopi', value: { category: 'Ngopi' } },
            ]}
            onTemplateSelect={onTemplateSelect}
            action={
                <button onClick={onAddTransaction} className="btn-primary inline-flex items-center gap-2">
                    <IconPlus size={18} stroke={2} />
                    <span>Catat Transaksi</span>
                </button>
            }
        />
    ),
}

export default EmptyState

