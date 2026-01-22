/**
 * ActivityHeatmap - GitHub-style activity heatmap
 * 
 * Mobile: Shows 26 weeks (6 months) to fit viewport
 * Desktop: Shows full 52 weeks
 */

import { useState, useEffect } from 'react'

const DAYS = 7

function getIntensity(count) {
    if (!count || count <= 0) return 'heatmap-cell--empty'
    if (count < 2) return 'heatmap-cell--low'
    if (count < 4) return 'heatmap-cell--mid'
    if (count < 6) return 'heatmap-cell--high'
    return 'heatmap-cell--max'
}

function getDateKey(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function formatDate(dateKey) {
    const [y, m, d] = dateKey.split('-')
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function ActivityHeatmap({ yearlyActivity = {} }) {
    // Detect mobile and show fewer weeks
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Mobile: 26 weeks (6 months), Desktop: 52 weeks
    const WEEKS = isMobile ? 26 : 52
    const totalDays = WEEKS * DAYS

    // Generate cells
    const cells = []
    const today = new Date()

    for (let i = totalDays - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const key = getDateKey(date)
        const count = yearlyActivity[key] || 0

        cells.push({
            id: i,
            dateKey: key,
            count,
        })
    }

    // Calculate grid columns for CSS - larger cells for better visibility
    const cellSize = isMobile ? 10 : 11
    const cellGap = isMobile ? 2 : 2

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${WEEKS}, ${cellSize}px)`,
        gridTemplateRows: `repeat(7, ${cellSize}px)`,
        gap: `${cellGap}px`,
        width: 'fit-content'
    }

    return (
        <div className="rounded-xl border border-line bg-surface p-3 w-full">
            {/* Heatmap grid */}
            <div style={gridStyle}>
                {cells.map(cell => (
                    <div
                        key={cell.id}
                        className={`heatmap-cell ${getIntensity(cell.count)}`}
                        title={`${cell.count} aktivitas - ${formatDate(cell.dateKey)}`}
                    />
                ))}
            </div>

            {/* Legend + period indicator */}
            <div className="flex items-center justify-between mt-3">
                <span className="text-tiny text-ink-muted">
                    {isMobile ? '6 bulan terakhir' : '52 minggu terakhir'}
                </span>
                <div className="flex items-center gap-1">
                    <span className="text-tiny text-ink-muted">Less</span>
                    <div className="heatmap-cell heatmap-cell--empty" style={{ width: 8, height: 8 }} />
                    <div className="heatmap-cell heatmap-cell--low" style={{ width: 8, height: 8 }} />
                    <div className="heatmap-cell heatmap-cell--mid" style={{ width: 8, height: 8 }} />
                    <div className="heatmap-cell heatmap-cell--high" style={{ width: 8, height: 8 }} />
                    <div className="heatmap-cell heatmap-cell--max" style={{ width: 8, height: 8 }} />
                    <span className="text-tiny text-ink-muted">More</span>
                </div>
            </div>
        </div>
    )
}
