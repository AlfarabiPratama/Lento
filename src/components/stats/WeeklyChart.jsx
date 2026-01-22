/**
 * WeeklyChart - CSS-only bar chart for last 7 days
 */

export default function WeeklyChart({ weeklyActivity = [] }) {
    const maxTotal = Math.max(...weeklyActivity.map(d => d.total), 1)

    return (
        <div className="card">
            <div className="weekly-chart-bars">
                {weeklyActivity.map((day, i) => {
                    const heightPercent = (day.total / maxTotal) * 100

                    return (
                        <div key={i} className="weekly-chart-bar-wrapper">
                            <div className="weekly-chart-bar-container">
                                <div
                                    className="weekly-chart-bar"
                                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                    title={`${day.total} aktivitas`}
                                />
                            </div>
                            <div className="weekly-chart-value">{day.total}</div>
                            <div className="weekly-chart-label">{day.day}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
