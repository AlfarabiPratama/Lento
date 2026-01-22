/**
 * Confetti - Celebration animation component
 * 
 * Displays confetti animation for celebrations.
 * Uses pure CSS animations for performance.
 */

import { useEffect, useState } from 'react'

const CONFETTI_COLORS = [
    '#5B9A8B', // primary
    '#22C55E', // success
    '#F59E0B', // warning
    '#EC4899', // pink
    '#8B5CF6', // purple
    '#3B82F6', // blue
]

const CONFETTI_COUNT = 50

function randomBetween(min, max) {
    return Math.random() * (max - min) + min
}

/**
 * Single confetti piece
 */
function ConfettiPiece({ index, color }) {
    const style = {
        '--delay': `${randomBetween(0, 0.5)}s`,
        '--duration': `${randomBetween(2, 4)}s`,
        '--x-start': `${randomBetween(-20, 120)}vw`,
        '--x-end': `${randomBetween(-20, 120)}vw`,
        '--rotation': `${randomBetween(0, 360)}deg`,
        '--size': `${randomBetween(8, 14)}px`,
        backgroundColor: color,
    }

    return (
        <div
            className="confetti-piece"
            style={style}
            aria-hidden="true"
        />
    )
}

/**
 * Confetti container - shows burst of confetti
 */
export function Confetti({
    show = false,
    duration = 3000,
    onComplete
}) {
    const [isVisible, setIsVisible] = useState(false)
    const [pieces, setPieces] = useState([])

    useEffect(() => {
        if (show) {
            // Generate confetti pieces
            const newPieces = Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
                id: i,
                color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]
            }))
            setPieces(newPieces)
            setIsVisible(true)

            // Auto-hide after duration
            const timer = setTimeout(() => {
                setIsVisible(false)
                onComplete?.()
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [show, duration, onComplete])

    if (!isVisible) return null

    return (
        <div className="confetti-container" aria-hidden="true">
            {pieces.map(piece => (
                <ConfettiPiece key={piece.id} index={piece.id} color={piece.color} />
            ))}
        </div>
    )
}

/**
 * Hook to trigger confetti
 */
export function useConfetti() {
    const [showConfetti, setShowConfetti] = useState(false)

    const celebrate = () => {
        setShowConfetti(true)
    }

    const reset = () => {
        setShowConfetti(false)
    }

    return { showConfetti, celebrate, reset }
}

export default Confetti
