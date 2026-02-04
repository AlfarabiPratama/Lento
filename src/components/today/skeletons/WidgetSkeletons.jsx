/**
 * Widget Skeleton Components
 * Loading states untuk Today page widgets
 */

import { Skeleton } from '../../ui/Skeleton'

/**
 * WeeklyReportSkeleton - Loading state for WeeklyReport widget
 */
export function WeeklyReportSkeleton() {
    return (
        <div className="widget-primary">
            <div className="flex items-center justify-between mb-4">
                <Skeleton variant="title" className="w-40" />
                <Skeleton className="w-20 h-8 rounded-full" />
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                    <Skeleton className="w-12 h-8 mx-auto mb-2" />
                    <Skeleton variant="text" className="w-20 mx-auto" />
                </div>
                <div className="text-center">
                    <Skeleton className="w-12 h-8 mx-auto mb-2" />
                    <Skeleton variant="text" className="w-20 mx-auto" />
                </div>
                <div className="text-center">
                    <Skeleton className="w-12 h-8 mx-auto mb-2" />
                    <Skeleton variant="text" className="w-20 mx-auto" />
                </div>
            </div>

            {/* Progress bar */}
            <Skeleton className="h-2 w-full rounded-full" />
        </div>
    )
}

/**
 * PendingHabitsWidgetSkeleton - Loading state for PendingHabitsWidget
 */
export function PendingHabitsWidgetSkeleton() {
    return (
        <div className="widget-primary">
            <div className="flex items-center justify-between mb-4">
                <Skeleton variant="title" className="w-48" />
                <Skeleton className="w-16 h-6 rounded-full" />
            </div>

            {/* Progress bar */}
            <Skeleton className="h-1.5 w-full rounded-full mb-4" />

            {/* Habit cards */}
            <div className="space-y-3">
                <HabitCardSkeleton />
                <HabitCardSkeleton />
                <HabitCardSkeleton />
            </div>
        </div>
    )
}

/**
 * HabitCardSkeleton - Loading state for individual habit card
 */
function HabitCardSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-line bg-base-100">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="title" className="w-2/3" />
                <Skeleton variant="text" className="w-1/2" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        </div>
    )
}

/**
 * CompactWidgetSkeleton - Loading state for compact widgets
 */
export function CompactWidgetSkeleton() {
    return (
        <div className="compact-widget">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton variant="text" className="w-20" />
                </div>
                <Skeleton className="w-12 h-5 rounded-full" />
            </div>

            {/* Progress bar */}
            <Skeleton className="h-1.5 w-full rounded-full mb-2" />

            {/* Content */}
            <div className="flex items-center justify-between">
                <Skeleton variant="text" className="w-24" />
                <Skeleton className="w-8 h-8 rounded-full" />
            </div>
        </div>
    )
}

/**
 * HabitCompactSkeleton - Specialized for HabitCompact
 */
export function HabitCompactSkeleton() {
    return (
        <div className="compact-widget">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton variant="text" className="w-20" />
                </div>
                <Skeleton className="w-10 h-5 rounded-full" />
            </div>

            <Skeleton className="h-1.5 w-full rounded-full mb-2" />

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton variant="text" className="w-24" />
                    <Skeleton variant="text" className="w-20" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full" />
            </div>
        </div>
    )
}

/**
 * FinanceCompactSkeleton - Specialized for FinanceCompact
 */
export function FinanceCompactSkeleton() {
    return (
        <div className="compact-widget">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton variant="text" className="w-20" />
                </div>
            </div>

            <div className="flex items-center justify-between mb-2">
                <Skeleton variant="title" className="w-28" />
                <Skeleton className="w-8 h-8 rounded-full" />
            </div>

            <Skeleton variant="text" className="w-32" />
        </div>
    )
}

/**
 * BookCompactSkeleton - Specialized for BookCompact
 */
export function BookCompactSkeleton() {
    return (
        <div className="compact-widget">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton variant="text" className="w-20" />
                </div>
                <Skeleton className="w-10 h-5 rounded-full" />
            </div>

            <Skeleton className="h-1.5 w-full rounded-full mb-2" />

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton variant="text" className="w-32" />
                    <Skeleton variant="text" className="w-24" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full" />
            </div>
        </div>
    )
}
