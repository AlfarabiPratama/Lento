/**
 * ProgressBar - Visual progress indicator for budget
 */
export function ProgressBar({
    progress = 0,
    status = 'ok',
    showLabel = false,
    className = ''
}) {
    // Clamp progress between 0 and 100 for display
    const displayProgress = Math.min(Math.max(progress * 100, 0), 100)

    // Status colors
    const statusColors = {
        ok: 'bg-primary',
        near: 'bg-warning',
        over: 'bg-danger',
    }

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-tiny text-ink-muted mb-1">
                    <span>{Math.round(progress * 100)}%</span>
                </div>
            )}
            <div className="h-2 bg-line rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${statusColors[status]}`}
                    style={{ width: `${displayProgress}%` }}
                />
            </div>
        </div>
    )
}

export default ProgressBar
