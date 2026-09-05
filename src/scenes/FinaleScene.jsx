import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/animation'
import ParticleField from '../components/ParticleField'

export default function FinaleScene({ onReplay }) {
  const sectionRef = useRef(null)
  const sigRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const reduced = prefersReducedMotion()
  const [taps, setTaps] = useState(0)

  useEffect(() => {
    const sig = sigRef.current
    gsap.set(sig, { clipPath: 'inset(0 100% 0 0)' })

    // Stagger entrance for the two main lines
    if (line1Ref.current && line2Ref.current) {
      gsap.set([line1Ref.current, line2Ref.current], { opacity: 0, y: 16 })
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        // Lines stagger in
        gsap.to([line1Ref.current, line2Ref.current], {
          opacity: 1, y: 0,
          duration: reduced ? 0.2 : 0.85,
          ease: 'expo.out',
          stagger: reduced ? 0 : 0.28,
        })
        // Signature wipes in after lines
        gsap.to(sig, {
          clipPath: 'inset(0 0% 0 0)',
          duration: reduced ? 0.3 : 1.8,
          ease: 'power2.inOut',
          delay: reduced ? 0 : 0.9,
        })
      },
    })
    return () => st.kill()
  }, [reduced])

  return (
    <section ref={sectionRef} id="scene-signoff" className="scene finale-scene" aria-label="Closing message">
      <ParticleField density={0.3} color="241,237,228" />
      <div className="finale-content hud-frame">
        <div className="hud-corners" aria-hidden="true" />
        <p ref={line1Ref} className="finale-line finale-line-1">Happy Teacher&rsquo;s Day, Archana Ma&rsquo;am.</p>
        <p ref={line2Ref} className="finale-line finale-line-2">Different campus. Same standard you set.</p>

        <div className="signature-wrap">
          <span
            ref={sigRef}
            className="signature"
            onClick={() => setTaps((t) => t + 1)}
            data-cursor="?"
          >greagoor</span>
        </div>
        {taps >= 3 && (
          <p className="egg-line" role="status">(don&rsquo;t tell her who this is.)</p>
        )}

        <button
          className="replay-btn"
          onClick={onReplay}
          data-cursor="replay"
          aria-label="Experience again"
          style={{ touchAction: 'manipulation' }}
        >
          experience again ↻
        </button>
      </div>

      <style>{`
        .finale-scene { background: radial-gradient(90% 70% at 50% 60%, #1a1712 0%, var(--ink) 70%); flex-direction:column; }
        .finale-content {
          position:relative; z-index:2;
          display:flex; flex-direction:column; align-items:center;
          gap: var(--sp-5); text-align:center;
          padding: var(--sp-5) var(--sp-4);
          max-width: 700px; width: 100%;
        }
        .finale-line { font-family: var(--font-display); font-weight: 420; color: var(--chalk); font-size: clamp(1.5rem, 5vw, 2.6rem); }
        .finale-line-2 { color: var(--chalk-dim); font-size: clamp(1.1rem, 3.6vw, 1.6rem); }
        .signature-wrap { margin-top: var(--sp-3); }
        .signature {
          display:inline-block;
          font-family: var(--font-hand);
          font-size: clamp(3rem, 11vw, 5.5rem);
          color: var(--mint);
          text-shadow: 0 0 30px rgba(63,224,197,0.35);
          cursor: pointer;
          animation: sigPulse 4s ease-in-out infinite;
        }
        @keyframes sigPulse {
          0%,100% { text-shadow: 0 0 30px rgba(63,224,197,0.35); }
          50%      { text-shadow: 0 0 55px rgba(63,224,197,0.55); }
        }
        .egg-line { font-family: var(--font-mono); font-size: 0.7rem; color: var(--chalk-dim); opacity: 0.7; animation: eggIn .5s var(--ease-out); }
        @keyframes eggIn { from { opacity:0; transform: translateY(-4px);} to { opacity:0.7; transform:translateY(0);} }
        .replay-btn {
          margin-top: var(--sp-3);
          font-family: var(--font-mono); font-size: 0.75rem;
          letter-spacing: 0.1em; color: var(--chalk-dim);
          border: 1px solid rgba(241,237,228,0.2);
          border-radius: 2px;
          padding: 12px 24px;
          min-height: 44px;
          transition: color .3s, border-color .3s, box-shadow .3s;
        }
        .replay-btn:hover, .replay-btn:focus-visible {
          color: var(--mint);
          border-color: var(--mint);
          box-shadow: 0 0 12px rgba(63,224,197,0.2);
        }
        @media (max-width: 400px) {
          .finale-content { padding: var(--sp-4) var(--sp-3); gap: var(--sp-4); }
          .finale-line { font-size: clamp(1.3rem, 6vw, 2rem); }
        }
      `}</style>
    </section>
  )
}

