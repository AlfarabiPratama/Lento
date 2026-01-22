/**
 * TrendSparkline - Simple sparkline for 3-month trend
 */
export function TrendSparkline({
    data = [], // Array of { month: string, value: number }
    height = 40,
    color = 'text-primary',
    className = ''
}) {
    if (data.length === 0) return null

    const values = data.map(d => d.value)
    const max = Math.max(...values, 1)
    const min = Math.min(...values, 0)
    const range = max - min || 1

    // SVG path calculation
    const width = 100
    const padding = 4
    const usableWidth = width - padding * 2
    const usableHeight = height - padding * 2

    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * usableWidth
        const y = padding + usableHeight - ((d.value - min) / range) * usableHeight
        return `${x},${y}`
    }).join(' ')

    // Trend indicator
    const lastValue = values[values.length - 1] || 0
    const prevValue = values[values.length - 2] || 0
    const trend = lastValue - prevValue
    const trendPercent = prevValue > 0 ? ((trend / prevValue) * 100).toFixed(0) : 0

    return (
        <div className={`${className}`}>
            <div className="flex items-end gap-3">
                {/* Sparkline */}
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="flex-1"
                    style={{ maxHeight: height }}
                >
                    <polyline
                        points={points}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={color}
                    />
                    {/* Dots at each point */}
                    {data.map((d, i) => {
                        const x = padding + (i / (data.length - 1 || 1)) * usableWidth
                        const y = padding + usableHeight - ((d.value - min) / range) * usableHeight
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="currentColor"
                                className={color}
                            />
                        )
                    })}
                </svg>

                {/* Trend indicator */}
                <div className="text-right shrink-0">
                    <p className={`text-h3 font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {trend >= 0 ? '+' : ''}{trendPercent}%
                    </p>
                    <p className="text-tiny text-ink-muted">vs bulan lalu</p>
                </div>
            </div>

            {/* Month labels */}
            <div className="flex justify-between mt-1">
                {data.map((d, i) => (
                    <span key={i} className="text-tiny text-ink-muted">{d.month}</span>
                ))}
            </div>
        </div>
    )
}

export default TrendSparkline
