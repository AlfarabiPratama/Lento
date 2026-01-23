/**
 * AddBillForm Component
 * 
 * Form untuk menambah bill dengan contextual notification permission request
 */

import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { useAuth } from '../hooks/useAuth'
import { useBills } from '../hooks/useBills'

export function AddBillForm({ onSuccess, onCancel }) {
    const { user } = useAuth()
    const { permission, requestPermission } = useNotifications(user?.uid)
    const { createBill } = useBills()
    
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
    const [loading, setLoading] = useState(false)
    
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: '',
        category: 'utilities',
        recurring: false,
        recurringInterval: 'monthly',
        notes: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Add bill to Firestore
            await createBill(formData)

            // CONTEXTUAL permission request (after value shown)
            if (permission !== 'granted') {
                setShowPermissionPrompt(true)
            } else {
                // Success feedback
                if (onSuccess) onSuccess()
            }

            // Reset form
            setFormData({
                name: '',
                amount: '',
                dueDate: '',
                category: 'utilities',
                recurring: false,
                recurringInterval: 'monthly',
                notes: ''
            })

        } catch (error) {
            console.error('Error adding bill:', error)
            alert('Gagal menambah tagihan: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const categories = [
        { value: 'utilities', label: '⚡ Utilitas (Listrik, Air, Gas)' },
        { value: 'internet', label: '📡 Internet & Telepon' },
        { value: 'insurance', label: '🛡️ Asuransi' },
        { value: 'subscription', label: '📺 Subscription (Netflix, Spotify)' },
        { value: 'loan', label: '🏦 Cicilan (KPR, Mobil)' },
        { value: 'rent', label: '🏠 Sewa (Rumah, Kost)' },
        { value: 'education', label: '🎓 Pendidikan' },
        { value: 'other', label: '📦 Lainnya' }
    ]

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Bill Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Tagihan *
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Listrik PLN, Cicilan Motor"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah (Rp) *
                    </label>
                    <input
                        type="number"
                        placeholder="500000"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Due Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Jatuh Tempo *
                    </label>
                    <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Recurring */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="recurring"
                        checked={formData.recurring}
                        onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="recurring" className="text-sm text-gray-700">
                        🔁 Tagihan berulang bulanan
                    </label>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan (Opsional)
                    </label>
                    <textarea
                        placeholder="e.g., Bayar via virtual account BCA"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? '⏳ Menyimpan...' : '✅ Tambah Tagihan'}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>

            {/* Contextual Permission Modal */}
            {showPermissionPrompt && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={onCancel}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-3">🔔</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Get Reminders for Your Bills
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Kami akan mengirim reminder <strong>3 hari</strong> dan <strong>1 hari</strong> sebelum due date,
                                sehingga kamu tidak kena denda keterlambatan! 💰
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                            <div className="flex items-start space-x-2">
                                <span className="text-blue-600">💡</span>
                                <p className="text-blue-900">
                                    Notifikasi hanya untuk tagihan yang kamu tambahkan. Kamu bisa disable kapan saja di Settings.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={async () => {
                                    await requestPermission()
                                    setShowPermissionPrompt(false)
                                    if (onSuccess) onSuccess()
                                }}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                            >
                                🔔 Enable Notifications
                            </button>
                            <button
                                onClick={() => {
                                    setShowPermissionPrompt(false)
                                    if (onSuccess) onSuccess()
                                }}
                                className="w-full border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
