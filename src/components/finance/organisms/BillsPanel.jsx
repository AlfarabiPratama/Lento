import { useState } from 'react'
import { 
    IconReceipt, 
    IconClock, 
    IconCheck, 
    IconAlertTriangle,
    IconCalendar,
    IconTrash,
    IconEdit,
    IconChartBar
} from '@tabler/icons-react'
import { format, isAfter, differenceInDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useBills } from '../../../hooks/useBills'
import { useAuth } from '../../../hooks/useAuth'
import { StatusBadge } from '../../ui/StatusBadge'

/**
 * BillsPanel - Bills management with list, stats, and actions
 * 
 * Features:
 * - List of pending/paid bills
 * - Mark as paid functionality
 * - Overdue warnings
 * - Statistics widget
 * - Quick add bill (opens AddBillForm modal)
 */
export default function BillsPanel() {
    const { user } = useAuth()
    const { bills, stats, loading, payBill, removeBill } = useBills()
    const [filter, setFilter] = useState('pending') // 'pending' | 'paid' | 'all'

    if (!user) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <IconReceipt size={48} className="mx-auto mb-4 text-ink-muted opacity-50" />
                    <p className="text-body text-ink-muted mb-4">Login untuk mengelola tagihan</p>
                </div>
            </div>
        )
    }

    const filteredBills = bills.filter(bill => {
        if (filter === 'pending') return bill.status === 'pending'
        if (filter === 'paid') return bill.status === 'paid'
        return true
    })

    const getDaysUntilDue = (dueDate) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(dueDate)
        due.setHours(0, 0, 0, 0)
        return differenceInDays(due, today)
    }

    const getBillStatus = (bill) => {
        if (bill.status === 'paid') return { 
            label: 'Lunas', 
            color: 'text-green-600', 
            bg: 'bg-green-50',
            badgeStatus: 'paid'
        }
        
        const daysUntil = getDaysUntilDue(bill.dueDate)
        
        if (daysUntil < 0) return { 
            label: 'Lewat jatuh tempo', 
            color: 'text-red-600', 
            bg: 'bg-red-50',
            badgeStatus: 'overdue'
        }
        if (daysUntil === 0) return { 
            label: 'Jatuh tempo hari ini', 
            color: 'text-orange-600', 
            bg: 'bg-orange-50',
            badgeStatus: 'warning'
        }
        if (daysUntil === 1) return { 
            label: 'Jatuh tempo besok', 
            color: 'text-orange-600', 
            bg: 'bg-orange-50',
            badgeStatus: 'warning'
        }
        if (daysUntil <= 3) return { 
            label: `${daysUntil} hari lagi`, 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-50',
            badgeStatus: 'warning'
        }
        
        return { 
            label: `${daysUntil} hari lagi`, 
            color: 'text-ink-muted', 
            bg: 'bg-surface',
            badgeStatus: 'neutral'
        }
    }

    const handleMarkAsPaid = async (billId) => {
        try {
            await payBill(billId)
        } catch (error) {
            console.error('Failed to mark bill as paid:', error)
        }
    }

    const handleDeleteBill = async (billId) => {
        if (!confirm('Hapus tagihan ini?')) return
        
        try {
            await removeBill(billId)
        } catch (error) {
            console.error('Failed to delete bill:', error)
        }
    }

    if (loading) {
        return (
            <div className="card">
                <p className="text-center text-ink-muted py-8">Memuat tagihan...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Statistics Widget */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <IconChartBar size={20} />
                    <h3 className="text-h3 text-ink">Statistik Tagihan</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-surface">
                        <p className="text-small text-ink-muted mb-1">Total Bulan Ini</p>
                        <p className="text-h2 text-ink">
                            Rp {(stats.totalDueThisMonth || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-surface">
                        <p className="text-small text-ink-muted mb-1">Sudah Dibayar</p>
                        <p className="text-h2 text-green-600">
                            Rp {(stats.totalPaid || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-surface">
                        <p className="text-small text-ink-muted mb-1">Belum Dibayar</p>
                        <p className="text-h2 text-orange-600">
                            Rp {(stats.totalPending || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-red-50">
                        <p className="text-small text-red-800 mb-1 flex items-center gap-1">
                            <IconAlertTriangle size={14} />
                            Terlambat
                        </p>
                        <p className="text-h2 text-red-600">
                            {stats.overdueCount || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="card">
                <div className="flex gap-2 mb-4 border-b border-line pb-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-small font-medium transition-colors ${
                            filter === 'pending' 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-ink-muted hover:bg-surface'
                        }`}
                    >
                        Belum Bayar
                    </button>
                    <button
                        onClick={() => setFilter('paid')}
                        className={`px-3 py-1.5 rounded-lg text-small font-medium transition-colors ${
                            filter === 'paid' 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-ink-muted hover:bg-surface'
                        }`}
                    >
                        Sudah Bayar
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-small font-medium transition-colors ${
                            filter === 'all' 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-ink-muted hover:bg-surface'
                        }`}
                    >
                        Semua
                    </button>
                </div>

                {/* Bills List */}
                {filteredBills.length === 0 ? (
                    <div className="text-center py-8">
                        <IconReceipt size={48} className="mx-auto mb-4 text-ink-muted opacity-50" />
                        <p className="text-body text-ink-muted">
                            {filter === 'pending' && 'Tidak ada tagihan yang belum dibayar'}
                            {filter === 'paid' && 'Belum ada tagihan yang dibayar'}
                            {filter === 'all' && 'Belum ada tagihan'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredBills.map(bill => {
                            const status = getBillStatus(bill)
                            const daysUntil = getDaysUntilDue(bill.dueDate)
                            const isOverdue = daysUntil < 0 && bill.status === 'pending'

                            return (
                                <div 
                                    key={bill.id}
                                    className={`p-4 rounded-lg border transition-all ${
                                        isOverdue 
                                            ? 'border-red-300 bg-red-50' 
                                            : 'border-line bg-surface hover:bg-paper-warm'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconReceipt size={18} className="text-ink-muted shrink-0" />
                                                <h4 className="text-body font-medium text-ink truncate">
                                                    {bill.name}
                                                </h4>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-small text-ink-muted">
                                                <span className="flex items-center gap-1">
                                                    <IconCalendar size={14} />
                                                    {format(new Date(bill.dueDate), 'd MMM yyyy', { locale: idLocale })}
                                                </span>
                                                <StatusBadge 
                                                    status={status.badgeStatus} 
                                                    label={status.label} 
                                                    size="sm"
                                                />
                                            </div>
                                            
                                            {bill.category && (
                                                <p className="text-small text-ink-muted mt-1">
                                                    {bill.category}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-h3 text-ink font-semibold mb-2">
                                                Rp {bill.amount.toLocaleString('id-ID')}
                                            </p>
                                            
                                            <div className="flex gap-1">
                                                {bill.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(bill.id)}
                                                        className="btn-sm btn-primary"
                                                        title="Tandai sudah bayar"
                                                    >
                                                        <IconCheck size={16} />
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleDeleteBill(bill.id)}
                                                    className="btn-sm btn-secondary text-red-600 hover:bg-red-50"
                                                    title="Hapus"
                                                >
                                                    <IconTrash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {isOverdue && (
                                        <div className="mt-3 flex items-center gap-2 text-small text-red-700">
                                            <IconAlertTriangle size={16} />
                                            <span>Tagihan ini sudah lewat {Math.abs(daysUntil)} hari</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
