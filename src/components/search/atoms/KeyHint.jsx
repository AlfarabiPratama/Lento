/**
 * KeyHint - Keyboard shortcut hint
 */
export function KeyHint({ keys, className = '' }) {
    return (
        <span className={`inline-flex items-center gap-0.5 ${className}`}>
            {keys.map((key, i) => (
                <kbd
                    key={i}
                    className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5
                     rounded bg-paper-warm border border-line
                     text-tiny text-ink-muted font-mono"
                >
                    {key}
                </kbd>
            ))}
        </span>
    )
}

export default KeyHint
