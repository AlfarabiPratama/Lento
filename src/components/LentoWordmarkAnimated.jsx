/**
 * LentoWordmarkAnimated - Animated wordmark logo
 * 
 * Animation sequence:
 * 1. Text "Lento" fade-in + rise
 * 2. Teal wave drawn left-to-right
 * 3. Amber wave follows 100ms later
 * 4. Ring on "o" draws circular
 * 5. Amber dot pulses gently (idle)
 */
function LentoWordmarkAnimated({ className = '', size = 'default' }) {
    // Size variants
    const sizeClasses = {
        sm: 'h-8',
        default: 'h-10',
        lg: 'h-14',
        xl: 'h-20',
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 820 220"
            role="img"
            aria-label="Lento"
            className={`lento-wordmark ${sizeClasses[size] || sizeClasses.default} w-auto ${className}`}
        >
            <defs>
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');
          .lento-word { 
            font-family: Inter, ui-sans-serif, system-ui, sans-serif; 
          }
        `}</style>
            </defs>

            <g transform="translate(36,54)">
                {/* Text "Lento" - fade up animation */}
                <text
                    className="lento-word lento-text-animate"
                    x="0"
                    y="92"
                    fontSize="112"
                    fontWeight="700"
                    fill="currentColor"
                    letterSpacing="-2"
                >
                    Lento
                </text>

                {/* Ring + Dot on "o" */}
                <g transform="translate(522,18)">
                    {/* Ring - draw animation */}
                    <circle
                        className="lento-ring-animate"
                        cx="68"
                        cy="56"
                        r="34"
                        fill="none"
                        stroke="#5B9A8B"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    {/* Dot - pulse animation */}
                    <circle
                        className="lento-dot-animate"
                        cx="92"
                        cy="40"
                        r="6.5"
                        fill="#E8B86D"
                    />
                </g>

                {/* Wave 1 - Teal (primary) */}
                <path
                    className="lento-wave-teal-animate"
                    d="M 8 132
             C 64 132, 80 112, 132 112
             C 186 112, 204 132, 258 132
             C 318 132, 332 118, 394 118
             C 452 118, 472 132, 536 132
             C 608 132, 620 120, 702 120"
                    fill="none"
                    stroke="#5B9A8B"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

                {/* Wave 2 - Amber (secondary) */}
                <path
                    className="lento-wave-amber-animate"
                    d="M 10 150
             C 76 150, 92 140, 150 140
             C 212 140, 232 150, 290 150
             C 352 150, 374 140, 436 140
             C 504 140, 520 150, 596 150
             C 650 150, 676 144, 718 144"
                    fill="none"
                    stroke="#E8B86D"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    )
}

export default LentoWordmarkAnimated
