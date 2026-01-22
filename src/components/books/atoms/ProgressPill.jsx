import { formatProgress, getProgressPercentage, getUnitConfig } from '../../../features/books/constants.js'

/**
 * ProgressPill - Display reading progress with optional bar
 */
export function ProgressPill({ book, showBar = false, className = '' }) {
    const { current, total, unit } = book.progress
    const percentage = getProgressPercentage(current, total)
    const config = getUnitConfig(unit)

    return (
        <div className={`space-y-1 ${className}`}>
            <div className="flex items-center gap-2">
                <span className="text-small text-ink-muted">
                    {formatProgress(current, total, unit)}
                </span>
                {percentage !== null && (
                    <span className="text-tiny text-primary font-medium">
                        {percentage}%
                    </span>
                )}
            </div>

            {showBar && total && (
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </div>
    )
}

export default ProgressPill
