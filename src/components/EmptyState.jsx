/**
 * EmptyState - dengan CTA yang jelas
 * 
 * Nielsen Norman: Empty state harus jelaskan kenapa kosong + 1 aksi utama
 */
function EmptyState({
    icon = '🌿',
    title,
    description,
    primaryAction,
    primaryLabel,
    secondaryAction,
    secondaryLabel
}) {
    return (
        <div className="empty-state py-12">
            <span className="empty-state-icon">{icon}</span>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-desc">{description}</p>

            {/* Primary CTA - prominent center button */}
            {primaryAction && primaryLabel && (
                <button
                    onClick={primaryAction}
                    className="btn-primary btn-lg mt-6"
                >
                    {primaryLabel}
                </button>
            )}

            {/* Secondary action - subtle */}
            {secondaryAction && secondaryLabel && (
                <button
                    onClick={secondaryAction}
                    className="btn-ghost btn-sm mt-3 text-ink-muted"
                >
                    {secondaryLabel}
                </button>
            )}
        </div>
    )
}

export default EmptyState
