/**
 * QuestCard - dengan icon dari Tabler sesuai tipe quest
 * Icon: 24px untuk visual emphasis
 */
function QuestCard({ quest, onAction }) {
    const Icon = quest.icon

    return (
        <div className="card flex items-center gap-4 group">
            {/* Icon container - 24px icon */}
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                {Icon ? (
                    <Icon size={24} stroke={1.5} className="text-primary" />
                ) : (
                    <span className="text-xl">🌿</span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="text-h3 text-ink truncate">{quest.title}</h3>
                <p className="text-small text-ink-muted mt-0.5 line-clamp-2">{quest.description}</p>
            </div>

            {/* Action button */}
            <button
                onClick={onAction}
                className="btn-primary btn-sm shrink-0 opacity-90 group-hover:opacity-100"
                aria-label={`Mulai: ${quest.title}`}
            >
                Mulai
            </button>
        </div>
    )
}

export default QuestCard
