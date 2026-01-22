import { useState, useEffect } from 'react'
import { IconPlus, IconMinus, IconArrowsExchange, IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react'

// Lento UI Guard Components
import { LentoDialog } from '../../ui/LentoDialog'
import { LentoSheet } from '../../ui/LentoSheet'
import { LentoButton } from '../../ui/LentoButton'
import { LentoSegmented } from '../../ui/LentoSegmented'
import { ChipGroup } from '../../ui/ChipGroup'

// Local components
import MoneyInput from '../molecules/MoneyInput'
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
}) {
    const [type, setType] = useState(defaultType)
    const [amount, setAmount] = useState(initialData.amount || 0)
    const [accountId, setAccountId] = useState(initialData.account_id || '')
    const [toAccountId, setToAccountId] = useState(initialData.to_account_id || '')
    const [categoryId, setCategoryId] = useState(initialData.category_id || '')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState(initialData.payment_method || '')
    const [merchant, setMerchant] = useState(initialData.merchant || '')
    const [note, setNote] = useState(initialData.note || '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < BREAKPOINTS.mobile : false)

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
                payment_method: paymentMethod || null,
                merchant: merchant || null,
                note: note || null,
            })

            localStorage.setItem('lento_last_account', accountId)
            if (categoryId) {
                localStorage.setItem(`lento_last_category_${type}`, categoryId)
            }

            onClose()
        } catch (err) {
            setError(err.message || 'Gagal menyimpan')
        } finally {
            setSaving(false)
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
                    <label className="text-sm text-[var(--lento-muted)] mb-2 block">Kategori</label>
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
                {saving ? 'Menyimpan...' : 'Simpan'}
            </LentoButton>

            {mode === 'edit' && onDelete && (
                <LentoButton variant="danger" onClick={onDelete}>
                    Hapus
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
