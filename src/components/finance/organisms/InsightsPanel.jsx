import { useState, useMemo, useEffect } from 'react'
import { IconChartBar, IconChartPie, IconTrendingUp, IconAlertTriangle, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import { ChartCard } from '../atoms/ChartCard'
import { SimpleBarChart } from '../atoms/SimpleBarChart'
import { TrendSparkline } from '../atoms/TrendSparkline'
import { CategoryBreakdownList } from '../molecules/CategoryBreakdownList'
import { Money } from '../atoms/Money'
import { ShareButton } from '../../ui/ShareButton'

import { computeMonthSummary, computeCategoryBreakdown, getTopCategories } from '../../../features/finance/insight'
import { buildInsightsShareText } from '../../../lib/share'

/**
 * InsightsPanel - Finance insights dashboard
 */
export function InsightsPanel({
    transactions = [],
    accounts = [],
    className = ''
}) {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return { year: now.getFullYear(), month: now.getMonth() }
    })

    // Compute summaries for current and past months
    const currentSummary = useMemo(() =>
        computeMonthSummary(transactions, selectedMonth.year, selectedMonth.month),
        [transactions, selectedMonth]
    )

    const expenseBreakdown = useMemo(() =>
        computeCategoryBreakdown(transactions, selectedMonth.year, selectedMonth.month, 'expense'),
        [transactions, selectedMonth]
    )

    const incomeBreakdown = useMemo(() =>
        computeCategoryBreakdown(transactions, selectedMonth.year, selectedMonth.month, 'income'),
        [transactions, selectedMonth]
    )

    // 3-month trend data
    const trendData = useMemo(() => {
        const months = []
        for (let i = 2; i >= 0; i--) {
            let m = selectedMonth.month - i
            let y = selectedMonth.year
            if (m < 0) {
                m += 12
                y -= 1
            }
            const summary = computeMonthSummary(transactions, y, m)
            const monthName = new Date(y, m).toLocaleDateString('id-ID', { month: 'short' })
            months.push({
                month: monthName,
                value: summary.balance,
            })
        }
        return months
    }, [transactions, selectedMonth])

    // Top boros category
    const topExpenseCategories = useMemo(() =>
        getTopCategories(
            transactions.filter(t => {
                const d = new Date(t.date)
                return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month
            }),
            'expense',
            3
        ),
        [transactions, selectedMonth]
    )

    const formatMonth = (year, month) => {
        return new Date(year, month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    }

    const monthLabel = formatMonth(selectedMonth.year, selectedMonth.month)

    // Build share text
    const shareText = buildInsightsShareText({
        monthLabel,
        income: currentSummary.income,
        expense: currentSummary.expense,
        balance: currentSummary.balance
    })

    const goToPrevMonth = () => {
        setSelectedMonth(prev => {
            let m = prev.month - 1
            let y = prev.year
            if (m < 0) {
                m = 11
                y -= 1
            }
            return { year: y, month: m }
        })
    }

    const goToNextMonth = () => {
        const now = new Date()
        setSelectedMonth(prev => {
            let m = prev.month + 1
            let y = prev.year
            if (m > 11) {
                m = 0
                y += 1
            }
            // Don't go past current month
            if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth())) {
                return prev
            }
            return { year: y, month: m }
        })
    }

    const isCurrentMonth = () => {
        const now = new Date()
        return selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth()
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Month picker */}
            <div className="flex items-center justify-between">
                <button
                    onClick={goToPrevMonth}
                    className="btn-icon"
                    aria-label="Bulan sebelumnya"
                >
                    <IconChevronLeft size={20} stroke={2} />
                </button>
                <div className="flex items-center gap-2">
                    <h2 className="text-h2 text-ink font-medium">
                        {monthLabel}
                    </h2>
                    <ShareButton
                        title={`Keuangan ${monthLabel} — Lento`}
                        text={shareText}
                        size="sm"
                    />
                </div>
                <button
                    onClick={goToNextMonth}
                    className="btn-icon"
                    disabled={isCurrentMonth()}
                    aria-label="Bulan berikutnya"
                >
                    <IconChevronRight size={20} stroke={2} className={isCurrentMonth() ? 'opacity-30' : ''} />
                </button>
            </div>

            {/* Income vs Expense */}
            <ChartCard
                title="Pemasukan vs Pengeluaran"
                icon={IconChartBar}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
            >
                <SimpleBarChart
                    income={currentSummary.income}
                    expense={currentSummary.expense}
                />
            </ChartCard>

            {/* 3-month trend */}
            <ChartCard
                title="Tren 3 Bulan"
                subtitle="Selisih pemasukan - pengeluaran"
                icon={IconTrendingUp}
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
            >
                <TrendSparkline
                    data={trendData}
                    color="text-purple-500"
                    height={60}
                />
            </ChartCard>

            {/* Category breakdown */}
            <ChartCard
                title="Pengeluaran per Kategori"
                icon={IconChartPie}
                iconColor="text-red-500"
                iconBg="bg-red-100"
            >
                <CategoryBreakdownList
                    categories={expenseBreakdown}
                    type="expense"
                    showMax={5}
                />
            </ChartCard>

            {/* Top boros warning */}
            {topExpenseCategories.length > 0 && (
                <div className="card p-4 bg-amber-50 border-amber-200">
                    <div className="flex items-start gap-3">
                        <div className="min-w-11 min-h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <IconAlertTriangle size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-h3 text-amber-800 font-medium mb-1">
                                Kategori Terbesar
                            </h3>
                            <p className="text-small text-amber-700">
                                Pengeluaran terbesar bulan ini adalah <strong>{topExpenseCategories[0]?.name}</strong>.
                                {topExpenseCategories[0]?.amount > currentSummary.income * 0.3 && (
                                    <span> Ini menghabiskan lebih dari 30% pemasukanmu. Pertimbangkan untuk memangkas sedikit.</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Income breakdown (if has income) */}
            {incomeBreakdown.length > 0 && (
                <ChartCard
                    title="Pemasukan per Kategori"
                    icon={IconChartPie}
                    iconColor="text-green-500"
                    iconBg="bg-green-100"
                >
                    <CategoryBreakdownList
                        categories={incomeBreakdown}
                        type="income"
                        showMax={5}
                    />
                </ChartCard>
            )}
        </div>
    )
}

export default InsightsPanel
