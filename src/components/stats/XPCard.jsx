/**
 * XPCard - XP summary dan level progress
 */

import { IconSparkles, IconTrendingUp } from '@tabler/icons-react'

export default function XPCard({ lifetimeXP, currentLevel, levelProgress }) {
    return (
        <div className="widget-primary">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <IconSparkles size={20} className="text-warning" />
                    <span className="text-overline">XP Kamu</span>
                </div>
                <div className="flex items-center gap-1 text-tiny text-ink-muted">
                    <IconTrendingUp size={14} />
                    <span>Level {currentLevel}</span>
                </div>
            </div>

            {/* Main XP Display */}
            <div className="text-center mb-4">
                <div className="text-3xl font-bold text-ink mb-1">
                    {lifetimeXP.toLocaleString()}
                </div>
                <div className="text-small text-ink-muted">Total XP</div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="h-3 bg-paper-warm rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                        style={{ width: `${levelProgress}%` }}
                    />
                </div>
                <div className="flex justify-between text-tiny text-ink-muted">
                    <span>Level {currentLevel}</span>
                    <span>{levelProgress}%</span>
                    <span>Level {currentLevel + 1}</span>
                </div>
            </div>
        </div>
    )
}
