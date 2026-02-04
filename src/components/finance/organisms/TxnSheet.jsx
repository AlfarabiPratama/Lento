import { useState, useEffect } from 'react'
import { IconPlus, IconMinus, IconArrowsExchange, IconChevronDown, IconChevronUp, IconX, IconTemplate } from '@tabler/icons-react'

// Lento UI Guard Components
import { LentoDialog } from '../../ui/LentoDialog'
import { LentoSheet } from '../../ui/LentoSheet'
import { LentoButton } from '../../ui/LentoButton'
import { LentoSegmented } from '../../ui/LentoSegmented'
import { ChipGroup } from '../../ui/ChipGroup'

// Local components
import MoneyInput from '../molecules/MoneyInput'
import { TagInput } from '../molecules/TagInput'
import { ImageUpload } from '../molecules/ImageUpload'
import { TXN_TYPES, PAYMENT_METHODS, BREAKPOINTS } from '../../../features/finance/constants'

/**
 * TxnSheet - Modal for add/edit transaction
 * 
 * Uses:
 * - LentoDialog on desktop (≥600px) → max 560px
 * - LentoSheet on mobile (<600px) → max 640px
 */
export function TxnSheet({
    open,
    onClose,
    mode = 'create',
    defaultType = 'expense',
    initialData = {},
    accounts = [],
    categories = [],
    onSubmit,
    onDelete,
    onDuplicate,
    onManageCategories,
    onUseTemplate,
    onSaveAsTemplate,
}) {
    const [type, setType] = useState(defaultType)
    const [amount, setAmount] = useState(initialData.amount || 0)
    const [accountId, setAccountId] = useState(initialData.account_id || '')
    const [toAccountId, setToAccountId] = useState(initialData.to_account_id || '')
    const [categoryId, setCategoryId] = useState(initialData.category_id || '')
    const [date, setDate] = useState(initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0])
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState(initialData.payment_method || '')
    const [merchant, setMerchant] = useState(initialData.merchant || '')
    const [note, setNote] = useState(initialData.note || '')
    const [tags, setTags] = useState(initialData.tags || [])
    const [attachment, setAttachment] = useState(initialData.attachment || null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < BREAKPOINTS.mobile : false)

    // Reset form when initialData changes (switching between create/edit)
    useEffect(() => {
        if (open) {
            setType(initialData.type || defaultType)
            setAmount(initialData.amount || 0)
            setAccountId(initialData.account_id || '')
            setToAccountId(initialData.to_account_id || '')
            setCategoryId(initialData.category_id || '')
            setDate(initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0])
            setPaymentMethod(initialData.payment_method || '')
            setMerchant(initialData.merchant || '')
            setNote(initialData.note || '')
            setTags(initialData.tags || [])
            setAttachment(initialData.attachment || null)
            setError('')
        }
    }, [open, initialData, defaultType])

    // Watch for resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Filter categories by type (deduplicated)
    const filteredCategories = categories
        .filter(c => c.type === type)
        .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)
        .map(c => ({ value: c.id, label: c.name, icon: c.icon }))

    // Set defaults from localStorage
    useEffect(() => {
        if (accounts.length > 0 && !accountId) {
            const lastAccountId = localStorage.getItem('lento_last_account')
            const validAccount = accounts.find(a => a.id === lastAccountId)
            setAccountId(validAccount ? validAccount.id : accounts[0].id)
        }
    }, [accounts, accountId])

    useEffect(() => {
        if (filteredCategories.length > 0 && !categoryId && type !== 'transfer') {
            const lastCategoryId = localStorage.getItem(`lento_last_category_${type}`)
            const validCat = filteredCategories.find(c => c.value === lastCategoryId)
            setCategoryId(validCat ? validCat.value : filteredCategories[0].value)
        }
    }, [filteredCategories, categoryId, type])

    // Reset category when type changes
    useEffect(() => {
        setCategoryId('')
    }, [type])

    const handleSubmit = async (e) => {
        e?.preventDefault()
        setError('')

        if (amount <= 0) {
            setError('Masukkan jumlah yang valid')
            return
        }

        if (!accountId) {
            setError('Pilih dompet')
            return
        }

        if (type === 'transfer' && !toAccountId) {
            setError('Pilih dompet tujuan')
            return
        }

        if (type === 'transfer' && accountId === toAccountId) {
            setError('Dompet asal dan tujuan harus berbeda')
            return
        }

        try {
            setSaving(true)

            await onSubmit({
                type,
                amount,
                account_id: accountId,
                to_account_id: type === 'transfer' ? toAccountId : null,
                category_id: type !== 'transfer' ? categoryId : null,
                date: date ? new Date(date).toISOString() : new Date().toISOString(),
                payment_method: paymentMethod || null,
                merchant: merchant || null,
                note: note || null,
                tags: tags.length > 0 ? tags : null,
                attachment: attachment || null,
            })

            // Remember last selections only for create mode
            if (mode === 'create') {
                localStorage.setItem('lento_last_account', accountId)
                if (categoryId) {
                    localStorage.setItem(`lento_last_category_${type}`, categoryId)
                }
            }

            onClose()
        } catch (err) {
            setError(err.message || 'Gagal menyimpan')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (confirm('Yakin ingin menghapus transaksi ini?')) {
            if (onDelete) {
                await onDelete()
                onClose()
            }
        }
    }

    const handleDuplicate = () => {
        if (onDuplicate) {
            onDuplicate()
            onClose()
        }
    }

    const handleSaveAsTemplate = () => {
        if (onSaveAsTemplate) {
            const name = prompt('Nama template:')
            if (name && name.trim()) {
                const templateData = {
                    name: name.trim(),
                    type,
                    amount,
                    category_id: categoryId,
                    account_id: accountId,
                    to_account_id: toAccountId,
                    payment_method: paymentMethod,
                    merchant,
                    note,
                    tags,
                }
                onSaveAsTemplate(templateData)
            }
        }
    }

    // Segmented options
    const typeOptions = [
        { value: 'expense', label: 'Keluar', icon: IconMinus },
        { value: 'income', label: 'Masuk', icon: IconPlus },
        { value: 'transfer', label: 'Transfer', icon: IconArrowsExchange },
    ]

    // Form content (shared between dialog and sheet)
    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type toggle */}
            <LentoSegmented
                value={type}
                onChange={setType}
                options={typeOptions}
            />

            {/* Template actions */}
            {mode === 'create' && onUseTemplate && (
                <button
                    type="button"
                    onClick={onUseTemplate}
                    className="w-full h-10 px-4 rounded-xl border border-[var(--lento-border)] bg-white hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                >
                    <IconTemplate size={18} />
                    <span>Gunakan Template</span>
                </button>
            )}

            {/* Amount */}
            <div>
                <label className="text-sm text-[var(--lento-muted)] mb-2 block">Jumlah</label>
                <MoneyInput value={amount} onChange={setAmount} autoFocus />
            </div>

            {/* Account (From) */}
            <div>
                <label className="text-sm text-[var(--lento-muted)] mb-2 block">
                    {type === 'transfer' ? 'Dari Dompet' : 'Dompet'}
                </label>
                <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[var(--lento-border)] bg-white lento-focus"
                    required
                >
                    <option value="">Pilih dompet...</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
            </div>

            {/* To Account (Transfer only) */}
            {type === 'transfer' && (
                <div>
                    <label className="text-sm text-[var(--lento-muted)] mb-2 block">Ke Dompet</label>
                    <select
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-[var(--lento-border)] bg-white lento-focus"
                        required
                    >
                        <option value="">Pilih dompet tujuan...</option>
                        {accounts.filter(a => a.id !== accountId).map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Category (not for transfer) */}
            {type !== 'transfer' && filteredCategories.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-[var(--lento-muted)]">Kategori</label>
                        {onManageCategories && (
                            <button
                                type="button"
                                onClick={onManageCategories}
                                className="text-xs text-primary hover:underline"
                            >
                                Kelola Kategori
                            </button>
                        )}
                    </div>
                    <ChipGroup
                        value={categoryId}
                        onChange={setCategoryId}
                        items={filteredCategories}
                        maxVisible={6}
                    />
                </div>
            )}

            {/* Advanced toggle */}
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-sm text-[var(--lento-muted)] hover:text-[var(--lento-text)]"
            >
                {showAdvanced ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                <span>{showAdvanced ? 'Sembunyikan detail' : 'Tambah detail'}</span>
            </button>

            {/* Advanced fields */}
            {showAdvanced && (
                <div className="space-y-4 p-4 rounded-xl bg-black/5">
                    {/* Date */}
                    <div>
                        <label className="text-sm text-[var(--lento-muted)] mb-2 block">Tanggal</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full h-12 px-4 rounded-xl border border-[var(--lento-border)] bg-white lento-focus"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[var(--lento-muted)] mb-2 block">Metode Pembayaran</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-[var(--lento-border)] bg-white lento-focus"
                        >
                            <option value="">-- Pilih --</option>
                            {PAYMENT_METHODS.map(pm => (
                                <option key={pm.id} value={pm.id}>{pm.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-[var(--lento-muted)] mb-2 block">Merchant</label>
                        <input
                            type="text"
                            placeholder="Contoh: Indomaret"
                            value={merchant}
                            onChange={(e) => setMerchant(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-[var(--lento-border)] bg-white lento-focus"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[var(--lento-muted)] mb-2 block">Catatan</label>
                        <input
                            type="text"
                            placeholder="Catatan..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-[var(--lento-border)] bg-white lento-focus"
                        />
                    </div>

                    <TagInput value={tags} onChange={setTags} />

                    <ImageUpload value={attachment} onChange={setAttachment} />
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-[var(--lento-danger)] flex items-center gap-1">
                    <IconX size={14} /> {error}
                </p>
            )}
        </form>
    )

    // Footer buttons
    const footer = (
        <div className="flex gap-2">
            <LentoButton
                className="flex-1"
                onClick={handleSubmit}
                disabled={saving}
            >
                {saving ? 'Menyimpan...' : mode === 'edit' ? 'Update' : 'Simpan'}
            </LentoButton>

            {mode === 'edit' && (
                <>
                    {onDuplicate && (
                        <LentoButton variant="secondary" onClick={handleDuplicate}>
                            Duplikat
                        </LentoButton>
                    )}
                    {onDelete && (
                        <LentoButton variant="danger" onClick={handleDelete}>
                            Hapus
                        </LentoButton>
                    )}
                </>
            )}

            {mode === 'create' && onSaveAsTemplate && amount > 0 && (
                <LentoButton variant="secondary" onClick={handleSaveAsTemplate}>
                    <IconTemplate size={18} />
                </LentoButton>
            )}
        </div>
    )

    const title = mode === 'edit' ? 'Edit Transaksi' : 'Tambah Transaksi'

    // Render based on viewport
    if (isMobile) {
        return (
            <LentoSheet open={open} onClose={onClose} title={title} footer={footer}>
                {formContent}
            </LentoSheet>
        )
    }

    return (
        <LentoDialog open={open} onClose={onClose} title={title} footer={footer}>
            {formContent}
        </LentoDialog>
    )
}

export default TxnSheet
