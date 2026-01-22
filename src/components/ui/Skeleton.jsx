/**
 * Skeleton - Loading placeholder component
 */
export function Skeleton({ className = '', variant = 'default' }) {
    const baseClass = 'animate-pulse bg-paper-warm rounded'

    const variantClasses = {
        default: 'h-4',
        text: 'h-4',
        title: 'h-6',
        button: 'h-10',
        card: 'h-24',
        avatar: 'h-12 w-12 rounded-full',
        cover: 'h-40'
    }

    return (
        <div className={`${baseClass} ${variantClasses[variant]} ${className}`} />
    )
}

/**
 * BookRowSkeleton - Loading state for book list
 */
export function BookRowSkeleton() {
    return (
        <div className="flex gap-3 p-3 rounded-lg border border-line bg-surface">
            <Skeleton variant="cover" className="w-12 h-16 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="title" className="w-3/4" />
                <Skeleton variant="text" className="w-1/2" />
                <div className="flex gap-2">
                    <Skeleton variant="default" className="w-16 h-6" />
                    <Skeleton variant="default" className="w-20 h-6" />
                </div>
            </div>
        </div>
    )
}

/**
 * HabitRowSkeleton - Loading state for habit list
 */
export function HabitRowSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-line bg-surface">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-1">
                <Skeleton variant="title" className="w-2/3" />
                <Skeleton variant="text" className="w-1/3" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
        </div>
    )
}

/**
 * StatSkeleton - Loading state for stat cards
 */
export function StatSkeleton() {
    return (
        <div className="card text-center py-4">
            <Skeleton className="w-12 h-8 mx-auto mb-2" />
            <Skeleton variant="text" className="w-16 mx-auto" />
        </div>
    )
}

/**
 * WidgetSkeleton - Loading state for widget-primary
 */
export function WidgetSkeleton() {
    return (
        <div className="widget-primary">
            <div className="flex items-center justify-between mb-4">
                <Skeleton variant="title" className="w-32" />
                <Skeleton className="w-6 h-6 rounded" />
            </div>
            <Skeleton className="h-12 w-full mb-3" />
            <div className="space-y-2">
                <Skeleton variant="text" className="w-full" />
                <Skeleton variant="text" className="w-3/4" />
            </div>
        </div>
    )
}

/**
 * TodaySkeleton - Loading state for Today page
 */
export function TodaySkeleton() {
    return (
        <div className="space-y-6 animate-in">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton variant="title" className="w-48 mb-2" />
                    <Skeleton variant="text" className="w-32" />
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
            </div>

            {/* Widget skeleton */}
            <WidgetSkeleton />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
            </div>

            {/* Habits section */}
            <div>
                <Skeleton variant="title" className="w-24 mb-3" />
                <div className="space-y-2">
                    <HabitRowSkeleton />
                    <HabitRowSkeleton />
                    <HabitRowSkeleton />
                </div>
            </div>
        </div>
    )
}

/**
 * ListSkeleton - Multiple skeleton rows
 */
export function ListSkeleton({ count = 3, RowComponent = BookRowSkeleton }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <RowComponent key={i} />
            ))}
        </div>
    )
}

export default Skeleton

