import { useState } from 'react'
import {
    IconPlus,
    IconRepeat,
    IconTrash,
    IconToggleLeft,
    IconToggleRight,
    IconEdit,
    IconX
} from '@tabler/icons-react'
import { useRecurringTemplates } from '../../../hooks/useRecurring'
import { useAccounts, formatCurrency } from '../../../hooks/useFinance'
import { useToast } from '../../../contexts/ToastContext'
import { RECURRING_INTERVALS } from '../../../lib/recurringRepo'
import { LentoSheet } from '../../ui/LentoSheet'
import { LentoButton } from '../../ui/LentoButton'
import { MoneyInput } from '../molecules/MoneyInput'

/**
 * RecurringManager - Manage recurring transaction templates
 */
export function RecurringManager({ className = '' }) {
    const { templates, loading, create, update, remove, toggle, refresh } = useRecurringTemplates()
    const { accounts } = useAccounts()
    const { showToast } = useToast()
    const [showForm, setShowForm] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState(null)

    const handleCreate = async (data) => {
        try {
            await create(data)
            showToast('success', 'Recurring template created')
            setShowForm(false)
        } catch (error) {
            showToast('error', 'Failed to create template')
        }
    }

    const handleUpdate = async (id, data) => {
        try {
            await update(id, data)
            showToast('success', 'Template updated')
            setEditingTemplate(null)
        } catch (error) {
            showToast('error', 'Failed to update template')
        }
    }

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus recurring "${name}"?`)) return
        try {
            await remove(id)
            showToast('success', 'Template deleted')
        } catch (error) {
            showToast('error', 'Failed to delete template')
        }
    }

    const handleToggle = async (id) => {
        try {
            const updated = await toggle(id)
            showToast('success', updated.isActive ? 'Template activated' : 'Template paused')
        } catch (error) {
            showToast('error', 'Failed to toggle template')
        }
    }

    const getIntervalLabel = (interval) => {
        switch (interval) {
            case RECURRING_INTERVALS.DAILY: return 'Harian'
            case RECURRING_INTERVALS.WEEKLY: return 'Mingguan'
            case RECURRING_INTERVALS.MONTHLY: return 'Bulanan'
            default: return interval
        }
    }

    const getAccountName = (accountId) => {
        const account = accounts.find(a => a.id === accountId)
        return account?.name || 'Unknown'
    }

    if (loading) {
        return (
            <div className={`card p-4 ${className}`}>
                <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-paper-warm rounded w-40" />
                    <div className="h-16 bg-paper-warm rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className={`card space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <IconRepeat size={20} stroke={2} className="text-primary" />
                    <h3 className="text-h3 text-ink">Recurring</h3>
                    <span className="text-tiny text-ink-muted bg-paper-warm px-2 py-0.5 rounded-full">
                        {templates.length}
                    </span>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    aria-label="Add recurring"
                >
                    <IconPlus size={18} stroke={2} />
                </button>
            </div>

            {/* Templates List */}
            {templates.length === 0 ? (
                <div className="text-center py-6">
                    <IconRepeat size={32} stroke={1.5} className="mx-auto text-ink-light mb-2" />
                    <p className="text-small text-ink-muted">Belum ada recurring</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary text-small hover:underline mt-2"
                    >
                        Tambah recurring pertama
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {templates.map(template => (
                        <div
                            key={template.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${template.isActive
                                    ? 'border-line bg-surface'
                                    : 'border-line/50 bg-paper-warm/50 opacity-60'
                                }`}
                        >
                            {/* Toggle */}
                            <button
                                onClick={() => handleToggle(template.id)}
                                className="shrink-0"
                                aria-label={template.isActive ? 'Pause' : 'Activate'}
                            >
                                {template.isActive ? (
                                    <IconToggleRight size={24} className="text-primary" />
                                ) : (
                                    <IconToggleLeft size={24} className="text-ink-muted" />
                                )}
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-body font-medium text-ink truncate">
                                    {template.name}
                                </p>
                                <div className="flex items-center gap-2 text-tiny text-ink-muted">
                                    <span className={template.type === 'income' ? 'text-success' : 'text-danger'}>
                                        {template.type === 'income' ? '+' : '-'}{formatCurrency(template.amount)}
                                    </span>
                                    <span>•</span>
                                    <span>{getIntervalLabel(template.interval)}</span>
                                    <span>•</span>
                                    <span>{getAccountName(template.accountId)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => setEditingTemplate(template)}
                                    className="p-1.5 rounded-lg hover:bg-paper-warm text-ink-muted hover:text-ink transition-colors"
                                    aria-label="Edit"
                                >
                                    <IconEdit size={16} stroke={2} />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id, template.name)}
                                    className="p-1.5 rounded-lg hover:bg-danger/10 text-ink-muted hover:text-danger transition-colors"
                                    aria-label="Delete"
                                >
                                    <IconTrash size={16} stroke={2} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Form Sheet */}
            {showForm && (
                <RecurringFormSheet
                    onClose={() => setShowForm(false)}
                    onSave={handleCreate}
                    accounts={accounts}
                />
            )}

            {/* Edit Form Sheet */}
            {editingTemplate && (
                <RecurringFormSheet
                    template={editingTemplate}
                    onClose={() => setEditingTemplate(null)}
                    onSave={(data) => handleUpdate(editingTemplate.id, data)}
                    accounts={accounts}
                />
            )}
        </div>
    )
}

/**
 * RecurringFormSheet - Form for creating/editing recurring template
 */
function RecurringFormSheet({ template, onClose, onSave, accounts }) {
    const [formData, setFormData] = useState({
        name: template?.name || '',
        type: template?.type || 'expense',
        amount: template?.amount || 0,
        accountId: template?.accountId || accounts[0]?.id || '',
        categoryId: template?.categoryId || null,
        note: template?.note || '',
        interval: template?.interval || RECURRING_INTERVALS.MONTHLY,
        startDate: template?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    })

    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || formData.amount <= 0 || !formData.accountId) {
            return
        }

        setSaving(true)
        try {
            await onSave({
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-surface rounded-t-2xl shadow-lg 
                            animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-surface">
                    <div className="w-10 h-1 bg-line rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-line">
                    <h2 className="text-h2 text-ink">
                        {template ? 'Edit Recurring' : 'Tambah Recurring'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-paper-warm">
                        <IconX size={20} className="text-ink-muted" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-small text-ink-muted block mb-1">Nama</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Gaji Bulanan, Tagihan Internet"
                            className="input-primary"
                            required
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="text-small text-ink-muted block mb-1">Tipe</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['expense', 'income'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                                    className={`p-3 rounded-lg border-2 text-center transition-all ${formData.type === type
                                            ? type === 'income'
                                                ? 'border-success bg-success/10 text-success'
                                                : 'border-danger bg-danger/10 text-danger'
                                            : 'border-line text-ink-muted hover:border-primary/30'
                                        }`}
                                >
                                    {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-small text-ink-muted block mb-1">Jumlah</label>
                        <MoneyInput
                            value={formData.amount}
                            onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                        />
                    </div>

                    {/* Account */}
                    <div>
                        <label className="text-small text-ink-muted block mb-1">Akun</label>
                        <select
                            value={formData.accountId}
                            onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                            className="input-primary"
                            required
                        >
                            <option value="">Pilih akun</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Interval */}
                    <div>
                        <label className="text-small text-ink-muted block mb-1">Interval</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(RECURRING_INTERVALS).map(([key, value]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, interval: value }))}
                                    className={`p-2 rounded-lg border-2 text-center text-small transition-all ${formData.interval === value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-line text-ink-muted hover:border-primary/30'
                                        }`}
                                >
                                    {value === 'daily' ? 'Harian' : value === 'weekly' ? 'Mingguan' : 'Bulanan'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="text-small text-ink-muted block mb-1">Mulai dari</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            className="input-primary"
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <label className="text-small text-ink-muted block mb-1">
                            Catatan <span className="text-ink-light">(opsional)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.note}
                            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                            placeholder="Catatan tambahan..."
                            className="input-primary"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving || !formData.name || formData.amount <= 0}
                        className="btn-primary w-full"
                    >
                        {saving ? 'Menyimpan...' : template ? 'Simpan Perubahan' : 'Buat Recurring'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RecurringManager
