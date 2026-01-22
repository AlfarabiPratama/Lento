import { useState, useEffect } from 'react'
import { IconPlus, IconMinus, IconArrowsExchange, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAccounts, useTransactions, useFinanceCategories, formatCurrency, PAYMENT_METHODS } from '../hooks/useFinance'

/**
 * QuickAddTransaction - Fast entry for income/expense/transfer
 * 
 * Quick mode: Type, Amount, Account, Category → Save (5 detik beres)
 * Advanced: Payment method, Merchant, Note, Tags
 */
function QuickAddTransaction({ onClose, onSuccess, defaultType = 'expense' }) {
    const { accounts } = useAccounts()
    const { create } = useTransactions()
    const { byType } = useFinanceCategories()

    const [type, setType] = useState(defaultType)
    const [amount, setAmount] = useState('')
    const [accountId, setAccountId] = useState('')
    const [toAccountId, setToAccountId] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('')
    const [merchant, setMerchant] = useState('')
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // Get categories based on type
    const categories = type === 'transfer' ? [] : byType(type)

    // Set default account from localStorage
    useEffect(() => {
        if (accounts.length > 0 && !accountId) {
            const lastAccountId = localStorage.getItem('lento_last_account')
            const validAccount = accounts.find(a => a.id === lastAccountId)
            setAccountId(validAccount ? validAccount.id : accounts[0].id)
        }
    }, [accounts, accountId])

    // Set default category from localStorage
    useEffect(() => {
        if (categories.length > 0 && !categoryId && type !== 'transfer') {
            const lastCategoryId = localStorage.getItem(`lento_last_category_${type}`)
            const validCat = categories.find(c => c.id === lastCategoryId)
            setCategoryId(validCat ? validCat.id : categories[0].id)
        }
    }, [categories, categoryId, type])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!amount || parseFloat(amount) <= 0) {
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

            await create({
                type,
                amount: parseFloat(amount),
                account_id: accountId,
                to_account_id: type === 'transfer' ? toAccountId : null,
                category_id: type !== 'transfer' ? categoryId : null,
                payment_method: paymentMethod || null,
                merchant: merchant || null,
                note: note || null,
            })

            // Remember last selections
            localStorage.setItem('lento_last_account', accountId)
            if (categoryId) {
                localStorage.setItem(`lento_last_category_${type}`, categoryId)
            }

            // Reset form
            setAmount('')
            setMerchant('')
            setNote('')

            if (onSuccess) onSuccess()
            if (onClose) onClose()

        } catch (err) {
            setError(err.message || 'Gagal menyimpan')
        } finally {
            setSaving(false)
        }
    }

    const typeButtons = [
        { key: 'expense', label: 'Keluar', icon: IconMinus, color: 'danger' },
        { key: 'income', label: 'Masuk', icon: IconPlus, color: 'success' },
        { key: 'transfer', label: 'Transfer', icon: IconArrowsExchange, color: 'primary' },
    ]

    return (
        <div className="card p-4 animate-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-h2 text-ink">Catat Transaksi</h3>
                {onClose && (
                    <button onClick={onClose} className="btn-icon" aria-label="Tutup">
                        <IconX size={18} stroke={1.5} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type toggle */}
                <div className="flex gap-2">
                    {typeButtons.map(({ key, label, icon: Icon, color }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => { setType(key); setCategoryId(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all border-2 ${type === key
                                    ? `bg-${color}/10 text-${color} border-${color}`
                                    : 'bg-paper-warm text-ink-muted border-transparent hover:bg-paper-cream'
                                }`}
                            style={{
                                backgroundColor: type === key
                                    ? key === 'expense' ? 'rgb(239 68 68 / 0.1)'
                                        : key === 'income' ? 'rgb(34 197 94 / 0.1)'
                                            : 'rgb(91 154 139 / 0.1)'
                                    : undefined,
                                color: type === key
                                    ? key === 'expense' ? 'rgb(239 68 68)'
                                        : key === 'income' ? 'rgb(34 197 94)'
                                            : 'rgb(91 154 139)'
                                    : undefined,
                                borderColor: type === key
                                    ? key === 'expense' ? 'rgb(239 68 68)'
                                        : key === 'income' ? 'rgb(34 197 94)'
                                            : 'rgb(91 154 139)'
                                    : 'transparent',
                            }}
                        >
                            <Icon size={18} stroke={2} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Amount */}
                <div>
                    <label className="text-small text-ink-muted mb-1 block">Jumlah</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-medium">Rp</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input pl-10 text-h2 font-semibold"
                            required
                            min="0"
                            step="100"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Account (From) */}
                <div>
                    <label className="text-small text-ink-muted mb-1 block">
                        {type === 'transfer' ? 'Dari Dompet' : 'Dompet'}
                    </label>
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="input"
                        required
                    >
                        <option value="">Pilih dompet...</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.name} ({formatCurrency(acc.balance_cached)})
                            </option>
                        ))}
                    </select>
                </div>

                {/* To Account (Transfer only) */}
                {type === 'transfer' && (
                    <div>
                        <label className="text-small text-ink-muted mb-1 block">Ke Dompet</label>
                        <select
                            value={toAccountId}
                            onChange={(e) => setToAccountId(e.target.value)}
                            className="input"
                            required
                        >
                            <option value="">Pilih dompet tujuan...</option>
                            {accounts.filter(a => a.id !== accountId).map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} ({formatCurrency(acc.balance_cached)})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Category (not for transfer) */}
                {type !== 'transfer' && categories.length > 0 && (
                    <div>
                        <label className="text-small text-ink-muted mb-2 block">Kategori</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoryId(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-small transition-all flex items-center gap-1.5 border ${categoryId === cat.id
                                            ? type === 'expense'
                                                ? 'bg-red-500 text-white border-red-500'
                                                : 'bg-green-500 text-white border-green-500'
                                            : 'bg-paper-warm text-ink border-line hover:border-ink-muted'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Advanced toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1 text-small text-ink-muted hover:text-ink"
                >
                    {showAdvanced ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    <span>{showAdvanced ? 'Sembunyikan detail' : 'Tambah detail'}</span>
                </button>

                {/* Advanced fields */}
                {showAdvanced && (
                    <div className="space-y-3 p-3 rounded-lg bg-paper-warm animate-in">
                        {/* Payment method */}
                        <div>
                            <label className="text-small text-ink-muted mb-1 block">Metode Pembayaran</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="input"
                            >
                                <option value="">-- Pilih --</option>
                                {PAYMENT_METHODS.map(pm => (
                                    <option key={pm.id} value={pm.id}>{pm.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Merchant */}
                        <div>
                            <label className="text-small text-ink-muted mb-1 block">Merchant / Tempat</label>
                            <input
                                type="text"
                                placeholder="Contoh: Indomaret, Kantin FBS"
                                value={merchant}
                                onChange={(e) => setMerchant(e.target.value)}
                                className="input"
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className="text-small text-ink-muted mb-1 block">Catatan</label>
                            <input
                                type="text"
                                placeholder="Catatan tambahan..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <p className="text-small text-red-500 flex items-center gap-1">
                        <IconX size={14} /> {error}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-medium transition-all text-white ${type === 'expense' ? 'bg-red-500 hover:bg-red-600'
                            : type === 'income' ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-primary hover:bg-primary-dark'
                        }`}
                    disabled={saving}
                >
                    {saving ? 'Menyimpan...' : type === 'transfer' ? 'Transfer' : 'Simpan'}
                </button>
            </form>
        </div>
    )
}

export default QuickAddTransaction
