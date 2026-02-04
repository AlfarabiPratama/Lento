import { useState, useMemo } from 'react'
import { IconDownload, IconX, IconFileTypeCsv, IconCalendar } from '@tabler/icons-react'
import { exportToCSV, generateExportFilename } from '../../../utils/exportCSV'

/**
 * ExportModal - Modal for exporting transactions to CSV
 * 
 * @param {Object[]} transactions - All transactions
 * @param {Object[]} accounts - All accounts
 * @param {function} onClose - Callback to close modal
 */
export function ExportModal({ transactions, accounts, onClose }) {
    const [selectedAccount, setSelectedAccount] = useState('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [exporting, setExporting] = useState(false)

    // Filter transactions based on selections
    const filteredTransactions = useMemo(() => {
        let filtered = transactions

        // Filter by account
        if (selectedAccount !== 'all') {
            filtered = filtered.filter(tx => 
                tx.account_id === selectedAccount || tx.to_account_id === selectedAccount
            )
        }

        // Filter by date range
        if (startDate) {
            filtered = filtered.filter(tx => new Date(tx.date) >= new Date(startDate))
        }
        if (endDate) {
            const endDateTime = new Date(endDate)
            endDateTime.setHours(23, 59, 59, 999)
            filtered = filtered.filter(tx => new Date(tx.date) <= endDateTime)
        }

        return filtered
    }, [transactions, selectedAccount, startDate, endDate])

    const handleExport = async () => {
        if (filteredTransactions.length === 0) {
            alert('Tidak ada transaksi untuk diekspor')
            return
        }

        try {
            setExporting(true)
            
            // Generate filename
            const filename = startDate && endDate 
                ? generateExportFilename(startDate, endDate)
                : `lento-transaksi-${new Date().toISOString().split('T')[0]}`

            // Export to CSV
            exportToCSV(filteredTransactions, accounts, filename)
            
            // Close modal after short delay
            setTimeout(() => {
                onClose()
            }, 500)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Gagal mengekspor data: ' + error.message)
        } finally {
            setExporting(false)
        }
    }

    // Quick date range presets
    const setQuickRange = (range) => {
        const today = new Date()
        const end = new Date(today)
        end.setHours(0, 0, 0, 0)
        
        let start = new Date(today)
        start.setHours(0, 0, 0, 0)

        switch (range) {
            case 'today':
                break
            case 'week':
                start.setDate(today.getDate() - 7)
                break
            case 'month':
                start.setMonth(today.getMonth() - 1)
                break
            case 'year':
                start.setFullYear(today.getFullYear() - 1)
                break
            default:
                break
        }

        setStartDate(start.toISOString().split('T')[0])
        setEndDate(end.toISOString().split('T')[0])
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-line">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconFileTypeCsv size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-h3 font-semibold text-ink">Export Transaksi</h2>
                            <p className="text-xs text-ink-muted">Download ke file CSV</p>
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

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Account filter */}
                    <div>
                        <label className="text-sm text-ink-muted mb-2 block">Filter Dompet</label>
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-line bg-white lento-focus"
                        >
                            <option value="all">Semua Dompet</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quick date range buttons */}
                    <div>
                        <label className="text-sm text-ink-muted mb-2 block">Rentang Cepat</label>
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                type="button"
                                onClick={() => setQuickRange('today')}
                                className="h-10 rounded-lg border border-line hover:border-primary hover:bg-primary/5 transition-colors text-xs"
                            >
                                Hari ini
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickRange('week')}
                                className="h-10 rounded-lg border border-line hover:border-primary hover:bg-primary/5 transition-colors text-xs"
                            >
                                7 hari
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickRange('month')}
                                className="h-10 rounded-lg border border-line hover:border-primary hover:bg-primary/5 transition-colors text-xs"
                            >
                                30 hari
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickRange('year')}
                                className="h-10 rounded-lg border border-line hover:border-primary hover:bg-primary/5 transition-colors text-xs"
                            >
                                1 tahun
                            </button>
                        </div>
                    </div>

                    {/* Custom date range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-ink-muted mb-2 block">Dari Tanggal</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-line bg-white lento-focus"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-ink-muted mb-2 block">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-line bg-white lento-focus"
                            />
                        </div>
                    </div>

                    {/* Preview info */}
                    <div className="p-3 rounded-xl bg-paper border border-line">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-ink-muted">Total transaksi:</span>
                            <span className="font-semibold text-ink">{filteredTransactions.length}</span>
                        </div>
                        {filteredTransactions.length === 0 && (
                            <p className="text-xs text-red-600 mt-2">
                                Tidak ada transaksi yang cocok dengan filter
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-line flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl border border-line hover:bg-paper-warm transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting || filteredTransactions.length === 0}
                        className="flex-1 h-12 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Mengekspor...</span>
                            </>
                        ) : (
                            <>
                                <IconDownload size={20} />
                                <span>Download CSV</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
