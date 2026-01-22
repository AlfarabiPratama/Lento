import { IconRosette, IconRosetteDiscountCheckFilled } from '@tabler/icons-react'

/**
 * GoalProgressBar - Visual progress with milestone markers
 */
export function GoalProgressBar({
    progress = 0,
    milestones = {},
    showMilestones = true,
    className = ''
}) {
    const displayProgress = Math.min(Math.max(progress * 100, 0), 100)

    // Milestone positions
    const milestonePositions = [
        { key: 'quarter', position: 25, reached: milestones.quarter },
        { key: 'half', position: 50, reached: milestones.half },
        { key: 'threeQuarter', position: 75, reached: milestones.threeQuarter },
    ]

    return (
        <div className={`relative ${className}`}>
            {/* Progress bar */}
            <div className="h-3 bg-line rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary-dark"
                    style={{ width: `${displayProgress}%` }}
                />
            </div>

            {/* Milestones */}
            {showMilestones && (
                <div className="relative h-0">
                    {milestonePositions.map(({ key, position, reached }) => (
                        <div
                            key={key}
                            className="absolute -top-3"
                            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        >
                            {reached ? (
                                <IconRosetteDiscountCheckFilled
                                    size={18}
                                    className="text-primary drop-shadow-sm"
                                />
                            ) : (
                                <IconRosette
                                    size={18}
                                    stroke={1.5}
                                    className="text-line"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Complete badge */}
            {milestones.complete && (
                <div className="absolute -right-1 -top-3">
                    <IconRosetteDiscountCheckFilled
                        size={22}
                        className="text-yellow-500 drop-shadow-md"
                    />
                </div>
            )}
        </div>
    )
}

export default GoalProgressBar
