import { useEffect, useRef } from 'react'
import { gsap } from '../utils/animation'
import { isTouchDevice, prefersReducedMotion } from '../utils/animation'

/**
 * A quiet, sophisticated cursor: a small dot with a lagging glow ring.
 * Elements with [data-cursor="word"] cause the ring to expand and show a label.
 * Disabled entirely on touch devices.
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (isTouchDevice()) return
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring) return

    const reduced = prefersReducedMotion()
    let mx = window.innerWidth / 2, my = window.innerHeight / 2
    let rx = mx, ry = my

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 })

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      gsap.to(dot, { x: mx, y: my, duration: reduced ? 0 : 0.12, ease: 'power2.out' })
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let raf
    const tick = () => {
      rx += (mx - rx) * (reduced ? 1 : 0.14)
      ry += (my - ry) * (reduced ? 1 : 0.14)
      gsap.set(ring, { x: rx, y: ry })
      raf = requestAnimationFrame(tick)
    }
    tick()

    const enterables = () => document.querySelectorAll('[data-cursor]')
    const onOver = (e) => {
      const t = e.target.closest('[data-cursor]')
      if (!t) return
      const mode = t.getAttribute('data-cursor')
      gsap.to(ring, { scale: mode === 'drag' ? 2.6 : 1.9, duration: 0.4, ease: 'power3.out' })
      gsap.to(dot, { scale: 0, duration: 0.3 })
      if (label) {
        label.textContent = mode
        gsap.to(label, { opacity: 1, duration: 0.25 })
      }
    }
    const onOut = (e) => {
      const t = e.target.closest('[data-cursor]')
      if (!t) return
      gsap.to(ring, { scale: 1, duration: 0.4, ease: 'power3.out' })
      gsap.to(dot, { scale: 1, duration: 0.3 })
      if (label) gsap.to(label, { opacity: 0, duration: 0.2 })
    }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)

    // re-bind hover targets whenever DOM changes (scenes mount lazily)
    const mo = new MutationObserver(() => enterables())
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      cancelAnimationFrame(raf)
      mo.disconnect()
    }
  }, [])

  if (isTouchDevice()) return null

  return (
    <div aria-hidden="true" className="cursor-system">
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
      <style>{`
        .cursor-system { position: fixed; inset: 0; pointer-events: none; z-index: 9998; }
        .cursor-dot {
          position: fixed; top:0; left:0; width: 7px; height: 7px; border-radius: 50%;
          background: var(--mint); mix-blend-mode: difference;
        }
        .cursor-ring {
          position: fixed; top:0; left:0; width: 34px; height: 34px; border-radius: 50%;
          border: 1px solid rgba(63,224,197,0.55);
          transform: translate(-50%,-50%);
          display:flex; align-items:center; justify-content:center;
        }
        .cursor-label {
          opacity:0; font-family: var(--font-mono); font-size: 9px; letter-spacing: .12em;
          color: var(--mint); text-transform: lowercase; white-space:nowrap;
          transform: translateY(24px);
        }
        @media (hover:none), (pointer:coarse) { .cursor-system { display:none; } }
      `}</style>
    </div>
  )
}
