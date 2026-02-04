/**
 * Confetti - Lightweight celebration animation
 * 
 * Canvas-based particle system for habit completion celebrations
 * Optimized for mobile performance
 */

import { useEffect, useRef, useState } from 'react'

// Confetti particle class
class ConfettiParticle {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
    this.color = colors[Math.floor(Math.random() * colors.length)]
    
    this.x = Math.random() * this.canvas.width
    this.y = -10
    this.size = Math.random() * 8 + 4
    this.speedY = Math.random() * 3 + 2
    this.speedX = (Math.random() - 0.5) * 4
    this.rotation = Math.random() * 360
    this.rotationSpeed = (Math.random() - 0.5) * 10
    this.gravity = 0.1
    this.opacity = 1
    this.fadeSpeed = 0.008
  }

  update() {
    this.y += this.speedY
    this.x += this.speedX
    this.speedY += this.gravity
    this.rotation += this.rotationSpeed
    this.opacity -= this.fadeSpeed

    // Reset if particle goes off screen or fully faded
    if (this.y > this.canvas.height || this.opacity <= 0) {
      return false // Particle dead
    }
    return true // Particle alive
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation * Math.PI / 180)
    
    // Draw confetti piece (rectangle)
    ctx.fillStyle = this.color
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
    
    ctx.restore()
  }
}

/**
 * ConfettiCanvas Component
 * 
 * @param {boolean} trigger - Trigger animation when true
 * @param {number} duration - Animation duration in ms (default: 3000)
 * @param {number} particleCount - Number of particles (default: 50)
 * @param {function} onComplete - Callback when animation completes
 */
export function ConfettiCanvas({ 
  trigger = false,
  duration = 3000,
  particleCount = 50,
  onComplete 
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (!trigger) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let isCleanedUp = false
    
    // Set canvas size to window size
    const resizeCanvas = () => {
      if (isCleanedUp || !canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create particles
    particlesRef.current = Array.from(
      { length: particleCount },
      () => new ConfettiParticle(canvas)
    )
    
    startTimeRef.current = Date.now()

    // Animation loop
    const animate = () => {
      if (isCleanedUp) return
      
      const elapsed = Date.now() - startTimeRef.current
      
      // Clear canvas
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        const alive = particle.update()
        if (alive) {
          particle.draw(ctx)
        }
        return alive
      })

      // Continue animation if particles exist and within duration
      if (!isCleanedUp && particlesRef.current.length > 0 && elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
        onComplete?.()
        window.removeEventListener('resize', resizeCanvas)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      isCleanedUp = true
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      window.removeEventListener('resize', resizeCanvas)
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      particlesRef.current = []
    }
  }, [trigger, duration, particleCount, onComplete])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ 
        display: trigger ? 'block' : 'none',
        touchAction: 'none'
      }}
    />
  )
}

/**
 * useConfetti Hook - Easy confetti trigger
 * 
 * @returns {object} { triggerConfetti, isPlaying }
 */
export function useConfetti() {
  const [isPlaying, setIsPlaying] = useState(false)
  
  const triggerConfetti = () => {
    setIsPlaying(true)
  }

  const handleComplete = () => {
    setIsPlaying(false)
  }

  return {
    triggerConfetti,
    isPlaying,
    ConfettiComponent: () => (
      <ConfettiCanvas 
        trigger={isPlaying}
        onComplete={handleComplete}
      />
    )
  }
}

export default ConfettiCanvas
