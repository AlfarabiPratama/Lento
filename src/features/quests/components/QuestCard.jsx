/**
 * QuestCard - Single quest display component
 * 
 * Shows quest title, XP reward, and progress.
 * Visual feedback for completed vs in-progress quests.
 * Includes reroll button for eligible quests.
 */

import { IconCircle, IconCircleCheck, IconRefresh } from '@tabler/icons-react'

const CATEGORY_ICONS = {
    habits: '🌱',
    journal: '📝',
    focus: '⏱️',
    books: '📚',
}

export function QuestCard({ quest, canReroll = false, onReroll }) {
    const { title, xp, progress, completed, category, mandatory } = quest
    const pct = progress.target > 0
        ? Math.round((progress.current / progress.target) * 100)
        : 0

    // Reroll allowed only if: can reroll globally, not mandatory, not completed, no progress
    const allowReroll =
        canReroll &&
        !mandatory &&
        !completed &&
        (progress?.current ?? 0) === 0

    return (
        <div
            className={`
        p-4 rounded-xl border-2 transition-all duration-200
        ${completed
                    ? 'border-success/50 bg-success/5'
                    : 'border-line bg-paper hover:border-primary/30'
                }
      `}
        >
            <div className="flex items-start gap-3">
                {/* Status icon */}
                <div className={`mt-0.5 ${completed ? 'text-success' : 'text-ink-muted'}`}>
                    {completed ? (
                        <IconCircleCheck size={20} stroke={2} />
                    ) : (
                        <IconCircle size={20} stroke={1.5} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`text-body ${completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
                            <span className="mr-1.5">{CATEGORY_ICONS[category] || '✨'}</span>
                            {title}
                        </p>
                    </div>

                    {/* Progress bar (only show if not completed and has progress) */}
                    {!completed && progress.target > 1 && (
                        <div className="mt-2">
                            <div className="h-1.5 bg-line rounded-full overflow-hidden">
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

                {/* Reroll button */}
                {allowReroll && (
                    <button
                        type="button"
                        onClick={() => onReroll?.(quest)}
                        className="shrink-0 p-2 rounded-lg text-ink-muted hover:bg-paper-warm hover:text-ink transition-colors"
                        aria-label="Ganti quest (1x hari ini)"
                        title="Ganti quest"
                    >
                        <IconRefresh size={16} stroke={2} />
                    </button>
                )}

                {/* XP badge */}
                <div className={`
          shrink-0 px-2 py-1 rounded-lg text-tiny font-medium
          ${completed ? 'bg-success/10 text-success' : 'bg-paper-warm text-ink-muted'}
        `}>
                    +{xp} XP
                </div>
            </div>
        </div>
    )
}

export default QuestCard
