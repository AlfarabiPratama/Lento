/**
 * LentoSegmented - Segmented control with enforced height
 * 
 * Rules:
 * - Height: 40px (control-md)
 * - Prevents "kebesaran" segmented controls
 */

export function LentoSegmented({
    value,
    onChange,
    options = [],
    className = '',
}) {
    return (
        <div className={`grid gap-2 ${className}`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
            {options.map((opt) => {
                const active = opt.value === value
                const Icon = opt.icon

                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange?.(opt.value)}
                        className={`
              h-10 rounded-xl border text-sm font-medium
              transition-all duration-[var(--dur-1)]
              lento-focus
              inline-flex items-center justify-center gap-1.5
              ${active
                                ? 'bg-[color-mix(in_srgb,var(--lento-primary)_12%,white)] text-[var(--lento-text)] border-[var(--lento-primary)]'
                                : 'bg-white text-[var(--lento-muted)] border-[var(--lento-border)] hover:bg-black/5'
                            }
            `}
                    >
                        {Icon && <Icon size={16} stroke={2} />}
                        <span>{opt.label}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default LentoSegmented
