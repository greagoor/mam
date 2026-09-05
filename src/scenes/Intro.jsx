import { useEffect, useRef, useState } from 'react'
import { gsap, splitChars, prefersReducedMotion, isTouchDevice } from '../utils/animation'
import ParticleField from '../components/ParticleField'

const BOOT_LINES = [
  'initializing gratitude.protocol …',
  'locating favourite_teacher.sys …  found',
  'access level: former student (limited)',
  'loading three semesters of memory …',
  'cross-referencing strictness_coefficient with genuine_respect … 1:1 ratio. unusual.',
  'recipient status: no_physical_gifts_accepted [since: always]. noted.',
  'compiling a workaround …',
]

export default function Intro({ onEnter }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('boot') // boot -> title -> portal -> leaving
  const rootRef = useRef(null)
  const titleRef = useRef(null)
  const portalRef = useRef(null)
  const btnRef = useRef(null)
  const reduced = prefersReducedMotion()

  // step through boot lines
  useEffect(() => {
    if (phase !== 'boot') return
    if (lineIdx >= BOOT_LINES.length) {
      const t = setTimeout(() => setPhase('title'), reduced ? 100 : 550)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setLineIdx((i) => i + 1), reduced ? 60 : 320)
    return () => clearTimeout(t)
  }, [lineIdx, phase, reduced])

  // title assembly animation
  useEffect(() => {
    if (phase !== 'title') return
    const chars = splitChars(titleRef.current)
    const tl = gsap.timeline({
      onComplete: () => setTimeout(() => setPhase('portal'), reduced ? 50 : 500),
    })
    tl.set(chars, {
      x: () => gsap.utils.random(-260, 260),
      y: () => gsap.utils.random(-160, 160),
      rotation: () => gsap.utils.random(-140, 140),
      opacity: 0,
    })
    tl.to(chars, {
      x: 0, y: 0, rotation: 0, opacity: 1,
      duration: reduced ? 0.2 : 1.1,
      ease: 'expo.out',
      stagger: { each: reduced ? 0 : 0.035, from: 'center' },
    })
    tl.fromTo('.intro-sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
  }, [phase, reduced])

  // magnetic portal button (desktop only)
  useEffect(() => {
    if (phase !== 'portal' || isTouchDevice()) return
    const btn = btnRef.current
    if (!btn) return
    const onMove = (e) => {
      const r = btn.getBoundingClientRect()
      const relX = e.clientX - (r.left + r.width / 2)
      const relY = e.clientY - (r.top + r.height / 2)
      const dist = Math.hypot(relX, relY)
      const radius = 140
      if (dist < radius) {
        const pull = 1 - dist / radius
        gsap.to(btn, { x: relX * 0.35 * pull, y: relY * 0.35 * pull, duration: 0.4, ease: 'power3.out' })
      } else {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' })
      }
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [phase])

  function handleEnter() {
    if (phase === 'leaving') return
    setPhase('leaving')
    const tl = gsap.timeline({ onComplete: onEnter })
    // particle-burst-esque flash + scale-through-portal
    tl.to(portalRef.current, {
      scale: 40, duration: reduced ? 0.2 : 1.1, ease: 'power4.in',
    })
    tl.to(rootRef.current, { opacity: 0, duration: 0.25 }, '-=0.25')
  }

  return (
    <div ref={rootRef} id="scene-boot" className="scene intro-scene" role="region" aria-label="Opening sequence">
      <ParticleField density={0.8} />
      <div className="intro-grid" aria-hidden="true" />
      <div className="intro-content">
        {phase === 'boot' && (
          <div className="boot-console" aria-live="polite">
            {BOOT_LINES.slice(0, lineIdx).map((l, i) => (
              <p key={i} className="boot-line">
                <span className="boot-caret">›</span> {l}
              </p>
            ))}
          </div>
        )}

        {(phase === 'title' || phase === 'portal' || phase === 'leaving') && (
          <div className="intro-title-wrap">
            <h1 ref={titleRef} className="intro-title">FOR MA&rsquo;AM</h1>
            <p className="intro-sub">this is not a card. this is not normal.</p>
          </div>
        )}

        {(phase === 'portal' || phase === 'leaving') && (
          <div className="portal-wrap">
            <button
              ref={btnRef}
              className="portal-btn"
              data-cursor="open"
              onClick={handleEnter}
              aria-label="Enter the experience"
            >
              <span ref={portalRef} className="portal-disc" aria-hidden="true" />
              <span className="portal-text">enter ↴</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .intro-scene { background: radial-gradient(120% 90% at 50% 20%, #14161f 0%, var(--ink) 60%); overflow: hidden; }
        .intro-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(63,224,197,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(63,224,197,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(70% 60% at 50% 40%, black, transparent);
        }
        .intro-content { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap: var(--sp-4); padding: 0 var(--sp-3); text-align:center; }
        .boot-console { font-family: var(--font-mono); font-size: clamp(0.72rem, 2.4vw, 0.92rem); color: var(--mint); text-align:left; min-height: auto; }
        .boot-line { margin: 0.3em 0; opacity: 0.9; }
        .boot-caret { color: var(--signal-2); margin-right: 6px; }
        .intro-title-wrap { display:flex; flex-direction:column; gap: var(--sp-3); align-items:center; }
        .intro-title {
          font-size: clamp(2.6rem, 11vw, 7.5rem);
          color: var(--chalk);
          letter-spacing: -0.02em;
          line-height: 0.95;
        }
        .intro-sub { font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.04em; color: var(--chalk-dim); }
        .portal-wrap { margin-top: var(--sp-4); }
        .portal-btn {
          position: relative; width: 148px; height: 148px; border-radius: 50%;
          display:flex; align-items:center; justify-content:center;
          font-family: var(--font-ui); font-size: 0.95rem; letter-spacing: 0.03em; color: var(--ink);
          touch-action: manipulation;
        }
        .portal-disc {
          position:absolute; inset:0; border-radius:50%;
          background: radial-gradient(circle at 35% 30%, var(--mint), var(--mint-dim) 70%);
          box-shadow: 0 0 60px rgba(63,224,197,0.45), inset 0 0 30px rgba(0,0,0,0.15);
          z-index:0;
          transition: transform 0.18s var(--ease-out), box-shadow 0.18s;
        }
        .portal-btn:active .portal-disc {
          transform: scale(0.94);
          box-shadow: 0 0 30px rgba(63,224,197,0.25), inset 0 0 20px rgba(0,0,0,0.2);
        }
        .portal-text { position:relative; z-index:1; font-weight:600; }
        @media (max-width: 640px) {
          .portal-btn { width: 120px; height: 120px; }
        }
      `}</style>
    </div>
  )
}
