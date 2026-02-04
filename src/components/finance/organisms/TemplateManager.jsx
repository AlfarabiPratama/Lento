import { useState } from 'react'
import { IconTemplate, IconX, IconPlus, IconCheck, IconTrash } from '@tabler/icons-react'

/**
 * TemplateManager - Manage transaction templates
 * 
 * @param {Object[]} templates - Array of template objects
 * @param {function} onUseTemplate - Callback when template is selected
 * @param {function} onClose - Callback to close manager
 */
export function TemplateManager({ templates, onUseTemplate, onClose }) {
    const [selectedType, setSelectedType] = useState('expense')

    const filteredTemplates = templates.filter(t => t.type === selectedType)

    const handleUseTemplate = (template) => {
        onUseTemplate(template)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-line">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconTemplate size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-h3 font-semibold text-ink">Template Transaksi</h2>
                            <p className="text-xs text-ink-muted">Pilih template untuk input cepat</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-paper-warm transition-colors flex items-center justify-center"
                        aria-label="Tutup"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Type selector */}
                <div className="p-4 border-b border-line">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedType('expense')}
                            className={`flex-1 h-10 rounded-lg transition-colors ${
                                selectedType === 'expense'
                                    ? 'bg-red-50 text-red-700 border-2 border-red-500'
                                    : 'bg-white border border-line text-ink-muted'
                            }`}
                        >
                            Pengeluaran
                        </button>
                        <button
                            onClick={() => setSelectedType('income')}
                            className={`flex-1 h-10 rounded-lg transition-colors ${
                                selectedType === 'income'
                                    ? 'bg-green-50 text-green-700 border-2 border-green-500'
                                    : 'bg-white border border-line text-ink-muted'
                            }`}
                        >
                            Pemasukan
                        </button>
                        <button
                            onClick={() => setSelectedType('transfer')}
                            className={`flex-1 h-10 rounded-lg transition-colors ${
                                selectedType === 'transfer'
                                    ? 'bg-primary/10 text-primary border-2 border-primary'
                                    : 'bg-white border border-line text-ink-muted'
                            }`}
                        >
                            Transfer
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredTemplates.length > 0 ? (
                        <div className="space-y-2">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleUseTemplate(template)}
                                    className="w-full p-4 rounded-xl bg-paper border border-line hover:border-primary hover:bg-primary/5 transition-all text-left"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-small font-semibold text-ink mb-1">
                                                {template.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                                                {template.amount > 0 && (
                                                    <span>Rp {template.amount.toLocaleString('id-ID')}</span>
                                                )}
                                                {template.merchant && (
                                                    <span>• {template.merchant}</span>
                                                )}
                                                {template.note && (
                                                    <span>• {template.note}</span>
                                                )}
                                            </div>
                                            {template.tags && template.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {template.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <IconCheck size={18} className="text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <IconTemplate size={48} className="mx-auto text-ink-muted mb-3" />
                            <p className="text-body text-ink-muted mb-2">
                                Belum ada template {selectedType === 'expense' ? 'pengeluaran' : selectedType === 'income' ? 'pemasukan' : 'transfer'}
                            </p>
                            <p className="text-xs text-ink-muted">
                                Simpan transaksi sebagai template untuk input cepat
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-line">
                    <p className="text-xs text-ink-muted text-center">
                        Klik template untuk mengisi form transaksi secara otomatis
                    </p>
                </div>
            </div>
        </div>
    )
}
