/**
 * LentoButton - Branded button with variants
 * 
 * Rules:
 * - Height: 40-44px (control size)
 * - danger variant ONLY for destructive actions
 */

const base = `
  inline-flex items-center justify-center gap-2 rounded-xl font-medium
  transition-all duration-[var(--dur-1)]
  lento-focus disabled:opacity-50 disabled:pointer-events-none
`

const sizes = {
    sm: 'h-10 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
}

const variants = {
    primary: 'bg-[var(--lento-primary)] text-white hover:bg-[var(--lento-primary-dark)]',
    secondary: 'bg-black/5 text-[var(--lento-text)] hover:bg-black/10 border border-[var(--lento-border)]',
    ghost: 'bg-transparent text-[var(--lento-text)] hover:bg-black/5',
    danger: 'bg-[var(--lento-danger)] text-white hover:opacity-90',
}

export function LentoButton({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}) {
    return (
        <button
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export default LentoButton
