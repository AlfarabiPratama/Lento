/**
 * AddBillForm Component
 * 
 * Form untuk menambah bill dengan contextual notification permission request
 */

import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { useAuth } from '../hooks/useAuth'
import { useBills } from '../hooks/useBills'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField } from '../../ui/FormField'
import { billSchema } from '../../../lib/validationSchemas'

export function AddBillForm({ onSuccess, onCancel }) {
    const { user } = useAuth()
    const { permission, requestPermission } = useNotifications(user?.uid)
    const { createBill } = useBills()
    
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)

    // Form validation
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        isSubmitting,
    } = useFormValidation({
        initialValues: {
            name: '',
            amount: '',
            dueDate: '',
            category: 'utilities',
            recurring: false,
            recurringInterval: 'monthly',
            notes: ''
        },
        validationSchema: billSchema,
        onSubmit: async (formValues) => {
            try {
                // Convert amount to number
                const billData = {
                    ...formValues,
                    amount: parseFloat(formValues.amount)
                }

                await createBill(billData)

                // CONTEXTUAL permission request (after value shown)
                if (permission !== 'granted') {
                    setShowPermissionPrompt(true)
                } else {
                    if (onSuccess) onSuccess()
                }

                resetForm()
            } catch (error) {
                console.error('Error adding bill:', error)
                throw error
            }
        }
    })

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
                <FormField
                    label="Nama Tagihan"
                    hint="Contoh: Listrik PLN, Cicilan Motor"
                    error={errors.name}
                    touched={touched.name}
                    required
                    fieldId="bill-name"
                >
                    <input
                        type="text"
                        name="name"
                        id="bill-name"
                        placeholder="e.g., Listrik PLN, Cicilan Motor"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="input"
                    />
                </FormField>

                {/* Amount */}
                <FormField
                    label="Jumlah (Rp)"
                    hint="Masukkan jumlah tagihan dalam rupiah"
                    error={errors.amount}
                    touched={touched.amount}
                    required
                    fieldId="bill-amount"
                >
                    <input
                        type="number"
                        name="amount"
                        id="bill-amount"
                        placeholder="500000"
                        value={values.amount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min="0"
                        step="1000"
                        className="input"
                    />
                </FormField>

                {/* Due Date */}
                <FormField
                    label="Tanggal Jatuh Tempo"
                    error={errors.dueDate}
                    touched={touched.dueDate}
                    required
                    fieldId="bill-dueDate"
                >
                    <input
                        type="date"
                        name="dueDate"
                        id="bill-dueDate"
                        value={values.dueDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min={new Date().toISOString().split('T')[0]}
                        className="input"
                    />
                </FormField>

                {/* Category */}
                <FormField
                    label="Kategori"
                    error={errors.category}
                    touched={touched.category}
                    required
                    fieldId="bill-category"
                >
                    <select
                        name="category"
                        id="bill-category"
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="input"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                {/* Recurring */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="recurring"
                        id="recurring"
                        checked={values.recurring}
                        onChange={handleChange}
                        className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor="recurring" className="text-body text-ink">
                        🔁 Tagihan berulang bulanan
                    </label>
                </div>

                {/* Notes */}
                <FormField
                    label="Catatan"
                    error={errors.notes}
                    touched={touched.notes}
                    fieldId="bill-notes"
                >
                    <textarea
                        name="notes"
                        id="bill-notes"
                        placeholder="e.g., Bayar via virtual account BCA"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={2}
                        className="input"
                    />
                </FormField>

                {/* Actions */}
                <div className="flex space-x-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 btn-primary"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Tambah Tagihan'}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="btn-secondary"
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
