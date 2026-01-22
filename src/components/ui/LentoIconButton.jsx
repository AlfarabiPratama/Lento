/**
 * LentoIconButton - Icon-only button with 48x48 tap target
 * 
 * Rules:
 * - Minimum 48x48dp tap target
 * - Consistent for X, search, filter, etc.
 */

export function LentoIconButton({
    children,
    className = '',
    size = 'md',
    ...props
}) {
    const sizes = {
        sm: 'w-10 h-10',
        md: 'w-12 h-12', // 48px - tap target
        lg: 'w-14 h-14',
    }

    return (
        <button
            className={`
        ${sizes[size]}
        inline-flex items-center justify-center rounded-full
        hover:bg-black/5 active:bg-black/10
        transition-colors duration-[var(--dur-1)]
        lento-focus
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    )
}

export default LentoIconButton
