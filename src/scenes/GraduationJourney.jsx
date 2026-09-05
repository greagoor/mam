import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/animation'

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const rangeMap = (v, a, b) => clamp01((v - a) / (b - a))

export default function GraduationJourney() {
  const wrapRef = useRef(null)
  const classroomRef = useRef(null)
  const roadRef = useRef(null)
  const campusRef = useRef(null)
  const orbRef = useRef(null)
  const capA = useRef(null)
  const capB = useRef(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const wrap = wrapRef.current
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: reduced ? true : 0.4,
      onUpdate: (self) => applyProgress(self.progress),
    })

    function applyProgress(p) {
      const classroomOp = 1 - rangeMap(p, 0, 0.32)
      const classroomScale = 1 + rangeMap(p, 0, 0.35) * 0.5
      gsap.set(classroomRef.current, { opacity: classroomOp, scale: classroomScale, filter: `blur(${rangeMap(p, 0, 0.35) * 8}px)` })

      const roadOp = rangeMap(p, 0.12, 0.4) * (1 - rangeMap(p, 0.55, 0.78))
      gsap.set(roadRef.current, { opacity: roadOp, transform: `translateZ(0) scale(${1 + p * 1.4})` })

      const campusOp = rangeMap(p, 0.68, 0.95)
      gsap.set(campusRef.current, { opacity: campusOp, y: (1 - campusOp) * 40 })

      // the orb: small near chalkboard -> fills the screen (portal) -> shrinks to a
      // persistent point of light that survives into the new campus.
      let orbScale, orbOp
      if (p < 0.5) {
        orbScale = 0.4 + rangeMap(p, 0, 0.5) * 22
        orbOp = 1
      } else {
        orbScale = 22 - rangeMap(p, 0.5, 0.82) * 20.6
        orbOp = 1
      }
      gsap.set(orbRef.current, { scale: Math.max(orbScale, 0.4), opacity: orbOp })

      gsap.set(capA.current, { opacity: 1 - rangeMap(p, 0.05, 0.28), clipPath: `inset(0 ${rangeMap(p, 0, 0.08) < 1 ? (1 - rangeMap(p, 0, 0.08)) * 100 : 0}% 0 0)` })
      gsap.set(capB.current, { opacity: rangeMap(p, 0.78, 1), clipPath: `inset(0 ${(1 - rangeMap(p, 0.78, 0.92)) * 100}% 0 0)` })
    }

    applyProgress(0)
    return () => st.kill()
  }, [reduced])

  return (
    <div ref={wrapRef} id="scene-transit" className="grad-wrap" aria-label="From graduation to a new campus">
      <div className="grad-sticky scene">
        <div ref={classroomRef} className="layer classroom-layer" aria-hidden="true">
          <div className="board" />
          <div className="desks">
            {Array.from({ length: 9 }).map((_, i) => <span key={i} className="desk" />)}
          </div>
        </div>

        <div ref={roadRef} className="layer road-layer" aria-hidden="true">
          <div className="road-lines">
            {Array.from({ length: 14 }).map((_, i) => <span key={i} className="road-line" style={{ '--i': i }} />)}
          </div>
        </div>

        <div ref={campusRef} className="layer campus-layer" aria-hidden="true">
          <div className="campus-skyline">
            {Array.from({ length: 5 }).map((_, i) => <span key={i} className="building" style={{ '--i': i }} />)}
          </div>
        </div>

        <div ref={orbRef} className="orb" aria-hidden="true" />

        <div className="grad-caption">
          <p ref={capA} className="cap cap-a">three years. one room. her handwriting on forty different boards.</p>
          <p ref={capB} className="cap cap-b">then, a different building altogether.</p>
        </div>
      </div>

      <style>{`
        .grad-wrap { position: relative; height: 320vh; }
        .grad-sticky { position: sticky; top: 0; height: 100svh; overflow:hidden; background: var(--ink); }
        .layer { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
        .classroom-layer { flex-direction:column; gap: var(--sp-4); }
        .board { width: min(60vw, 420px); height: 130px; border: 2px solid rgba(63,224,197,0.25); border-radius: 3px; background: #0d1810;
          background-image: repeating-linear-gradient(transparent, transparent 23px, rgba(63,224,197,0.06) 23px, rgba(63,224,197,0.06) 24px);
          box-shadow: inset 0 0 40px rgba(0,0,0,0.5), 0 0 20px rgba(63,224,197,0.07); }
        .desks { display:grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .desk { width: 46px; height: 30px; border: 2px solid var(--chalk-dim); border-radius: 4px; opacity: 0.7; }
        .road-layer { perspective: 500px; background: radial-gradient(circle at 50% 100%, rgba(201,162,76,0.15), transparent 60%); }
        .road-lines { position:relative; width: 100%; height: 100%; }
        .road-line {
          position:absolute; bottom: -10%; left: 50%; width: 2px; height: 140%;
          background: linear-gradient(to top, var(--gold), transparent);
          transform-origin: bottom center;
          transform: rotate(calc(var(--i) * 12deg - 78deg)) scaleY(1.2);
          opacity: 0.55;
        }
        .campus-layer { align-items:flex-end; padding-bottom: 8vh; }
        .campus-skyline { display:flex; align-items:flex-end; gap: 14px; }
        .building { display:block; width: 34px; background: linear-gradient(180deg, var(--ink-3), var(--ink-2)); border-top: 2px solid var(--mint); height: calc(60px + var(--i) * 22px); box-shadow: 0 0 24px rgba(63,224,197,0.15); }
        .orb {
          position:absolute; width: 18px; height: 18px; border-radius:50%;
          background: radial-gradient(circle, #fff 0%, var(--gold) 45%, transparent 75%);
          box-shadow: 0 0 40px 10px rgba(201,162,76,0.6);
          will-change: transform;
        }
        .grad-caption { position:absolute; bottom: 8%; left:0; right:0; text-align:center; z-index:5; padding: 0 var(--sp-3); }
        .cap { position:absolute; left:0; right:0; font-family: var(--font-display); font-size: clamp(0.95rem, 3.4vw, 1.6rem); color: var(--chalk); }
        @media (max-width: 640px) {
          .board { width: 78vw; height: 100px; }
          .building { width: 22px; }
          .cap { font-size: clamp(0.95rem, 4.5vw, 1.4rem); }
        }
      `}</style>
    </div>
  )
}
