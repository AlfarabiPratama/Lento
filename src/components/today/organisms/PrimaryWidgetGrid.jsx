/**
 * PrimaryWidgetGrid - Grid layout for primary (most important) widgets
 * 
 * RESPONSIVE: 1 column on mobile, 2 columns on sm+ screens.
 * 
 * WHY: Each widget needs ~247px minimum width due to internal content.
 * On 375px mobile: 2 widgets + gap + padding = 538px = OVERFLOW!
 * Solution: Stack on mobile, side-by-side on larger screens.
 */

export function PrimaryWidgetGrid({ children, className = '' }) {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full ${className}`}>
            {children}
        </div>
    )
}

export default PrimaryWidgetGrid
