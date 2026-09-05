import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../utils/animation'

export default function NoGiftsScene() {
  const [phase, setPhase] = useState('idle') // idle -> shaking -> denied -> dissolve -> resolved
  const boxRef = useRef(null)
  const shardsRef = useRef(null)
  const mountedRef = useRef(true)
  const reduced = prefersReducedMotion()

  useEffect(() => () => { mountedRef.current = false }, [])

  function attemptOpen() {
    if (phase !== 'idle') return
    setPhase('shaking')
    gsap.fromTo(boxRef.current,
      { x: 0 },
      {
        x: 6, duration: 0.06, repeat: 9, yoyo: true, ease: 'power1.inOut',
        onComplete: () => setPhase('denied')
      })

    setTimeout(() => {
      if (!mountedRef.current) return
      setPhase('dissolve')
      const shards = shardsRef.current?.querySelectorAll('.shard')
      if (shards) {
        gsap.to(shards, {
          x: () => gsap.utils.random(-180, 180),
          y: () => gsap.utils.random(-160, 40),
          rotation: () => gsap.utils.random(-180, 180),
          opacity: 0,
          duration: reduced ? 0.2 : 1,
          ease: 'power2.out',
          stagger: 0.02,
        })
      }
      gsap.to(boxRef.current, { opacity: 0, scale: 0.6, duration: reduced ? 0.1 : 0.6 })
      setTimeout(() => { if (mountedRef.current) setPhase('resolved') }, reduced ? 150 : 750)
    }, reduced ? 200 : 1500)
  }

  return (
    <section id="scene-protocol" className="scene gift-scene" aria-label="An attempted gift">
      <div className="gift-stage hud-frame">
        <div className="hud-corners" aria-hidden="true" />
        <span className="hud-label">PROTOCOL // gift_delivery.sys</span>

        {phase !== 'resolved' && (
          <button
            ref={boxRef}
            className={`gift-box ${phase}`}
            onClick={attemptOpen}
            data-cursor={phase === 'idle' ? 'open' : undefined}
            aria-label="A wrapped gift. Tap to try opening it."
            disabled={phase !== 'idle'}
            style={{ touchAction: 'manipulation' }}
          >
            <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
              <rect x="14" y="46" width="92" height="60" rx="4" fill="none" stroke="var(--gold)" strokeWidth="3" />
              <rect x="14" y="46" width="92" height="18" fill="none" stroke="var(--gold)" strokeWidth="3" />
              <line x1="60" y1="46" x2="60" y2="106" stroke="var(--gold)" strokeWidth="3" />
              <line x1="14" y1="64" x2="106" y2="64" stroke="var(--gold)" strokeWidth="2" opacity="0.6" />
              <path d="M40,46 C30,20 50,10 60,30 C70,10 90,20 80,46" fill="none" stroke="var(--gold)" strokeWidth="3" />
            </svg>

            <div ref={shardsRef} className="shards" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => <span key={i} className="shard" />)}
            </div>

            {phase === 'denied' && (
              <div className="denied-overlay" role="status">
                <span className="lock">⌁</span>
                <p className="denied-text glitch" data-text="ACCESS DENIED">ACCESS DENIED</p>
                <p className="denied-sub">gift_policy.rule &rarr; no_physical_gifts_accepted [since: always]</p>
              </div>
            )}
          </button>
        )}

        {phase === 'idle' && <p className="gift-hint">tap the gift</p>}

        {phase === 'resolved' && (
          <div className="punchline">
            <p className="punchline-text">I heard about the no git policy somehwere .... fine. Let's go with this instead instead.</p>
          </div>
        )}
      </div>

      <style>{`
        .gift-scene { background: linear-gradient(180deg, #150d10 0%, var(--ink) 100%); flex-direction:column; gap: var(--sp-4); padding: var(--sp-6) var(--sp-3); }
        .gift-stage { display:flex; flex-direction:column; align-items:center; gap: var(--sp-4); z-index:2; padding: var(--sp-2) var(--sp-3); width: 100%; max-width: 480px; }
        .gift-box { position:relative; width: 220px; height: 220px; touch-action: manipulation; }
        .gift-hint { font-family: var(--font-mono); font-size: 0.75rem; color: var(--chalk-dim); letter-spacing: 0.08em; animation: mechBlink 1.6s steps(4) infinite; }
        @keyframes mechBlink { 0%,74% { opacity: 1; } 75%,100% { opacity: 0.2; } }
        .shards { position:absolute; inset:0; pointer-events:none; }
        .shard { position:absolute; top:50%; left:50%; width: 8px; height: 8px; background: var(--gold); opacity:0; }
        .gift-box.dissolve .shard { opacity: 0.85; }
        .denied-overlay {
          position:absolute; inset:-10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 6px;
          background: rgba(10,11,16,0.85); border: 1px solid var(--signal); border-radius: 2px;
          animation: flashIn .18s var(--ease-out);
        }
        @keyframes flashIn { from { background: rgba(214,64,44,0.5); clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0% 0); } }
        .lock { font-size: 1.6rem; color: var(--signal-2); }
        .denied-text { font-family: var(--font-mono); font-weight:700; color: var(--signal-2); letter-spacing: 0.08em; font-size: 0.95rem; }
        .denied-sub { font-family: var(--font-mono); font-size: 0.62rem; color: var(--chalk-dim); text-align: center; }
        .glitch { position: relative; }
        .glitch::before, .glitch::after {
          content: attr(data-text); position:absolute; left:0; top:0; width:100%;
          clip-path: inset(0 0 0 0);
        }
        .glitch::before { color: var(--mint); transform: translate(-2px,0); animation: glitchTop 1.6s infinite linear; }
        .glitch::after { color: var(--signal); transform: translate(2px,0); animation: glitchBot 1.6s infinite linear; }
        @keyframes glitchTop { 0%,90%,100% { clip-path: inset(0 0 90% 0);} 92% { clip-path: inset(10% 0 60% 0);} 94% { clip-path: inset(60% 0 10% 0);} }
        @keyframes glitchBot { 0%,90%,100% { clip-path: inset(90% 0 0 0);} 91% { clip-path: inset(40% 0 40% 0);} 95% { clip-path: inset(15% 0 70% 0);} }
        .punchline { animation: fadeUp .7s var(--ease-out); }
        @keyframes fadeUp { from { opacity:0; transform: translateY(14px);} to { opacity:1; transform:translateY(0);} }
        .punchline-text { font-family: var(--font-display); font-size: clamp(1.4rem, 5vw, 2.6rem); color: var(--chalk); text-align:center; }
        @media (max-width: 400px) {
          .gift-box { width: 180px; height: 180px; }
        }
      `}</style>
    </section>
  )
}
