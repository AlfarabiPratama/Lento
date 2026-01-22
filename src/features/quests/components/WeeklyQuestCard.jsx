/**
 * WeeklyQuestCard - Weekly quest display component
 * 
 * Similar to QuestCard but styled differently for weekly quests.
 * Shows bigger XP reward and week progress.
 */

import { IconCircle, IconCircleCheck, IconCalendarWeek } from '@tabler/icons-react'

export function WeeklyQuestCard({ quest }) {
    const { badge, title, xp, progress, completed } = quest
    const pct = progress.target > 0
        ? Math.round((progress.current / progress.target) * 100)
        : 0

    return (
        <div
            className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${completed
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-line bg-paper hover:border-primary/30'
                }
            `}
        >
            <div className="flex items-start gap-3">
                {/* Badge icon */}
                <div className="shrink-0 text-2xl mt-0.5">
                    {badge}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <IconCalendarWeek size={14} className="text-primary" />
                        <span className="text-tiny font-medium text-primary uppercase">Mingguan</span>
                    </div>

                    <p className={`text-body ${completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
                        {title}
                    </p>

                    {/* Progress bar */}
                    {!completed && (
                        <div className="mt-2">
                            <div className="h-2 bg-line rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                            </div>
                            <p className="text-tiny text-ink-muted mt-1">
                                {progress.current}/{progress.target}
                            </p>
                        </div>
                    )}
                </div>

                {/* XP badge (bigger for weekly) */}
                <div className={`
                    shrink-0 px-3 py-1.5 rounded-lg text-small font-semibold
                    ${completed ? 'bg-primary/10 text-primary' : 'bg-paper-warm text-ink-muted'}
                `}>
                    +{xp} XP
                </div>
            </div>
        </div>
    )
}

export default WeeklyQuestCard
