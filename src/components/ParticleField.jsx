import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../utils/animation'

/**
 * Lightweight ambient dust/particle canvas. Not a hero effect — just
 * atmosphere so the site feels alive even when nobody is interacting.
 * Density scales down on small screens; disabled under reduced-motion.
 */
export default function ParticleField({ color = '63,224,197', density = 1, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    let w, h, raf
    const isSmall = window.innerWidth < 700
    const count = Math.round((isSmall ? 34 : 70) * density)
    let particles = []

    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio
      h = canvas.height = canvas.offsetHeight * devicePixelRatio
    }
    function make() {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
        vy: (Math.random() * -0.12 - 0.02) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.05 * devicePixelRatio,
        a: Math.random() * 0.5 + 0.15,
      }))
    }
    resize()
    make()
    const onResize = () => { resize(); make() }
    window.addEventListener('resize', onResize)

    function tick() {
      ctx.clearRect(0, 0, w, h)
      particles.forEach((p) => {
        p.y += p.vy
        p.x += p.vx
        if (p.y < -10) p.y = h + 10
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color},${p.a})`
        ctx.fill()
      })
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [color, density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
