/**
 * LentoLettermarkAnimated - Animated lettermark (icon) logo
 * 
 * Animation sequence:
 * 1. L stroke draws/fades in
 * 2. Wave draws left-to-right
 * 3. Dot pulse
 * 4. Idle: subtle breathing on wave/ring
 */
function LentoLettermarkAnimated({ className = '', size = 'default' }) {
    // Size variants
    const sizeClasses = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        default: 'w-10 h-10',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20',
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            role="img"
            aria-label="Lento"
            className={`lento-lettermark ${sizeClasses[size] || sizeClasses.default} ${className}`}
        >
            {/* Background rounded square */}
            <rect
                className="lento-bg-animate"
                x="48"
                y="48"
                width="416"
                height="416"
                rx="96"
                fill="var(--lento-surface)"
                stroke="var(--lento-border)"
                strokeWidth="10"
            />

            {/* L stroke - draw animation */}
            <path
                className="lento-l-stroke-animate"
                d="M 178 150
           L 178 342
           C 178 360, 190 372, 208 372
           L 350 372"
                fill="none"
                stroke="currentColor"
                strokeWidth="44"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Wave - draw animation */}
            <path
                className="lento-wave-animate"
                d="M 154 272
           C 198 272, 214 240, 256 240
           C 300 240, 314 272, 360 272"
                fill="none"
                stroke="#5B9A8B"
                strokeWidth="18"
                strokeLinecap="round"
            />

            {/* Dot - pulse animation */}
            <circle
                className="lento-dot-animate"
                cx="360"
                cy="272"
                r="10"
                fill="#E8B86D"
            />
        </svg>
    )
}

export default LentoLettermarkAnimated
