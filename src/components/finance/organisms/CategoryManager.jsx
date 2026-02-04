import { useState } from 'react'
import { IconPlus, IconX, IconCheck } from '@tabler/icons-react'

// Comprehensive icon library for categories
const CATEGORY_ICONS = [
    // Food & Dining
    '🍽️', '🍔', '🍕', '🍜', '☕', '🧋', '🍰', '🍱', '🥗', '🍳',
    // Transportation
    '🚗', '🚌', '🚕', '🏍️', '🚲', '✈️', '🚂', '⛽', '🅿️',
    // Housing
    '🏠', '🏡', '🏢', '🛏️', '🔌', '💡', '🚿', '🧹',
    // Education
    '📚', '📖', '✏️', '📝', '🎓', '🖊️', '📐', '💻',
    // Entertainment
    '🎮', '🎬', '🎵', '🎨', '🎭', '🎪', '🎰', '🎲', '📺',
    // Shopping
    '🛍️', '👕', '👔', '👗', '👠', '💄', '📱', '🎁', '📦',
    // Health
    '💊', '🏥', '⚕️', '🩺', '💉', '🧘', '🏋️', '🏃', '⚽',
    // Money
    '💰', '💵', '💴', '💶', '💷', '💸', '💳', '🏦', '📈', '💼',
    // Services
    '📶', '📞', '💻', '🔧', '🔨', '🧰', '🧼', '🧺',
    // Social
    '❤️', '👨‍👩‍👧', '👶', '🐕', '🐈', '🎉', '🎂',
    // Others
    '📅', '🎯', '⭐', '🔖', '📌', '💡', '🔔', '🎁',
]

/**
 * CategoryManager - UI for managing custom categories
 * 
 * @param {Object[]} customCategories - Array of custom categories
 * @param {function} onAdd - Callback when adding new category
 * @param {function} onRemove - Callback when removing category
 * @param {function} onClose - Callback to close manager
 */
export function CategoryManager({ customCategories = [], onAdd, onRemove, onClose }) {
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [newName, setNewName] = useState('')
    const [newIcon, setNewIcon] = useState('📦')
    const [newType, setNewType] = useState('expense')
    const [showIconPicker, setShowIconPicker] = useState(false)

    const handleAdd = () => {
        if (!newName.trim()) return
        
        onAdd({
            name: newName.trim(),
            icon: newIcon,
            type: newType,
        })

        // Reset form
        setNewName('')
        setNewIcon('📦')
        setNewType('expense')
        setIsAddingNew(false)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-line">
                    <h2 className="text-h3 font-semibold text-ink">Kelola Kategori</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-paper-warm transition-colors flex items-center justify-center"
                        aria-label="Tutup"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Custom categories list */}
                    {customCategories.length > 0 && (
                        <div>
                            <h3 className="text-small font-medium text-ink-muted mb-2">Kategori Kustom</h3>
                            <div className="space-y-2">
                                {customCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-paper border border-line"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-body">{cat.icon}</span>
                                            <div>
                                                <p className="text-small font-medium text-ink">{cat.name}</p>
                                                <p className="text-xs text-ink-muted">
                                                    {cat.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?\n\nKategori yang sudah digunakan di transaksi akan tetap tersimpan di transaksi tersebut.`)) {
                                                    onRemove(cat.id)
                                                }
                                            }}
                                            className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 transition-colors flex items-center justify-center"
                                            aria-label={`Hapus ${cat.name}`}
                                        >
                                            <IconX size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add new category form */}
                    {!isAddingNew ? (
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line hover:border-primary hover:bg-primary/5 transition-colors text-sm text-ink-muted"
                        >
                            <IconPlus size={20} />
                            <span>Tambah Kategori Baru</span>
                        </button>
                    ) : (
                        <div className="p-4 rounded-xl bg-paper border border-line space-y-4">
                            <h3 className="text-small font-medium text-ink">Kategori Baru</h3>

                            {/* Icon picker button */}
                            <div>
                                <label className="text-sm text-ink-muted mb-2 block">Icon</label>
                                <button
                                    type="button"
                                    onClick={() => setShowIconPicker(!showIconPicker)}
                                    className="w-16 h-16 rounded-xl border-2 border-line hover:border-primary transition-colors flex items-center justify-center text-3xl"
                                >
                                    {newIcon}
                                </button>
                            </div>

                            {/* Icon picker grid */}
                            {showIconPicker && (
                                <div className="grid grid-cols-10 gap-1 p-2 rounded-xl bg-surface border border-line max-h-48 overflow-y-auto">
                                    {CATEGORY_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => {
                                                setNewIcon(icon)
                                                setShowIconPicker(false)
                                            }}
                                            className={`w-10 h-10 rounded-lg hover:bg-paper-warm transition-colors flex items-center justify-center text-xl ${
                                                newIcon === icon ? 'bg-primary/10 ring-2 ring-primary' : ''
                                            }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Name input */}
                            <div>
                                <label className="text-sm text-ink-muted mb-2 block">Nama Kategori</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Contoh: Ojol, Skincare, dll"
                                    className="w-full h-12 px-4 rounded-xl border border-line bg-white lento-focus"
                                    autoFocus
                                />
                            </div>

                            {/* Type selector */}
                            <div>
                                <label className="text-sm text-ink-muted mb-2 block">Tipe</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewType('expense')}
                                        className={`flex-1 h-10 rounded-lg border transition-colors ${
                                            newType === 'expense'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-line bg-white text-ink-muted'
                                        }`}
                                    >
                                        Pengeluaran
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewType('income')}
                                        className={`flex-1 h-10 rounded-lg border transition-colors ${
                                            newType === 'income'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-line bg-white text-ink-muted'
                                        }`}
                                    >
                                        Pemasukan
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingNew(false)
                                        setNewName('')
                                        setNewIcon('📦')
                                        setShowIconPicker(false)
                                    }}
                                    className="flex-1 h-10 rounded-lg border border-line hover:bg-paper-warm transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={!newName.trim()}
                                    className="flex-1 h-10 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <IconCheck size={18} />
                                    <span>Simpan</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-line">
                    <p className="text-xs text-ink-muted text-center">
                        Kategori kustom akan digabung dengan kategori default
                    </p>
                </div>
            </div>
        </div>
    )
}
