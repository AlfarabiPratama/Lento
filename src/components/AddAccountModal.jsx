import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { useAccounts, ACCOUNT_TYPES, EWALLET_PROVIDERS } from '../hooks/useFinance'

/**
 * AddAccountModal - Form to create new account (dompet)
 */
function AddAccountModal({ onClose, onSuccess }) {
    const { create } = useAccounts()

    const [name, setName] = useState('')
    const [type, setType] = useState('cash')
    const [provider, setProvider] = useState('')
    const [openingBalance, setOpeningBalance] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!name.trim()) {
            setError('Masukkan nama dompet')
            return
        }

        try {
            setSaving(true)
            await create({
                name: name.trim(),
                type,
                provider: provider || '',
                opening_balance: parseFloat(openingBalance) || 0,
            })

            if (onSuccess) onSuccess()
            if (onClose) onClose()
        } catch (err) {
            setError(err.message || 'Gagal menyimpan')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="card p-6 w-full max-w-md animate-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-h2 text-ink">Tambah Dompet</h3>
                    <button onClick={onClose} className="btn-icon" aria-label="Tutup">
                        <IconX size={18} stroke={1.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type */}
                    <div>
                        <label className="text-small text-ink-muted mb-2 block">Jenis</label>
                        <div className="flex gap-2">
                            {Object.entries(ACCOUNT_TYPES).map(([key, { label, icon }]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => { setType(key); setProvider(''); }}
                                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition-all ${type === key
                                            ? 'bg-primary-50 border-primary text-primary'
                                            : 'bg-paper-warm border-transparent text-ink-muted hover:bg-paper-cream'
                                        }`}
                                >
                                    <span className="text-xl">{icon}</span>
                                    <span className="text-small font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-small text-ink-muted mb-1 block">Nama Dompet</label>
                        <input
                            type="text"
                            placeholder={type === 'cash' ? 'Dompet Cash' : type === 'bank' ? 'BCA Utama' : 'DANA Utama'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Provider (for ewallet) */}
                    {type === 'ewallet' && (
                        <div>
                            <label className="text-small text-ink-muted mb-2 block">Provider</label>
                            <div className="flex flex-wrap gap-2">
                                {EWALLET_PROVIDERS.map(ew => (
                                    <button
                                        key={ew.id}
                                        type="button"
                                        onClick={() => setProvider(ew.name)}
                                        className={`px-3 py-2 rounded-lg text-small flex items-center gap-1.5 border transition-all ${provider === ew.name
                                                ? 'bg-primary-50 border-primary text-primary'
                                                : 'bg-paper-warm border-line text-ink-muted hover:border-ink-muted'
                                            }`}
                                    >
                                        <span>{ew.icon}</span>
                                        <span>{ew.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Provider (for bank - free text) */}
                    {type === 'bank' && (
                        <div>
                            <label className="text-small text-ink-muted mb-1 block">Nama Bank</label>
                            <input
                                type="text"
                                placeholder="BCA, Mandiri, BRI, dll"
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                className="input"
                            />
                        </div>
                    )}

                    {/* Opening Balance */}
                    <div>
                        <label className="text-small text-ink-muted mb-1 block">Saldo Awal</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">Rp</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={openingBalance}
                                onChange={(e) => setOpeningBalance(e.target.value)}
                                className="input pl-10"
                                min="0"
                                step="1000"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-small text-red-500">{error}</p>
                    )}

                    {/* Submit */}
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary flex-1" disabled={saving}>
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddAccountModal
