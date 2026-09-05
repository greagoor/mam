import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/animation'

// Scene map: label -> anchor id that must exist in the DOM
const SCENES = [
  { label: 'SYS.BOOT',   id: 'scene-boot',        short: '01' },
  { label: 'DIAGNOSTIC', id: 'scene-diagnostic',   short: '02' },
  { label: 'MEMORY',     id: 'scene-memory',       short: '03' },
  { label: 'TRANSIT',    id: 'scene-transit',      short: '04' },
  { label: 'PROTOCOL',   id: 'scene-protocol',     short: '05' },
  { label: 'SIGN-OFF',   id: 'scene-signoff',      short: '06' },
]

function driftCoord(base, drift) {
  return (base + (Math.random() - 0.5) * drift).toFixed(4)
}

export default function HUDChrome({ entered }) {
  const coordRef   = useRef(null)
  const statusRef  = useRef(null)
  const [activeScene, setActiveScene] = useState(0)
  const [navOpen,     setNavOpen]     = useState(false)
  const [isMobile,    setIsMobile]    = useState(false)
  const reduced = prefersReducedMotion()

  // coordinate readout
  useEffect(() => {
    if (!entered || reduced) return
    let lat = 12.9714, lon = 77.5946
    const iv = setInterval(() => {
      lat = parseFloat(driftCoord(lat, 0.0008))
      lon = parseFloat(driftCoord(lon, 0.0008))
      if (coordRef.current) {
        coordRef.current.textContent =
          `LAT ${lat.toFixed(4)}\u00b0 / LON ${lon.toFixed(4)}\u00b0`
      }
    }, 900)
    return () => clearInterval(iv)
  }, [entered, reduced])

  // system-status counters
  useEffect(() => {
    if (!entered) return
    let sig = 98, mem = 64, syn = 100
    const iv = setInterval(() => {
      sig = Math.max(94, Math.min(100, sig + Math.round((Math.random() - 0.5) * 2)))
      mem = Math.max(60, Math.min(72,  mem + Math.round((Math.random() - 0.5) * 2)))
      syn = Math.max(98, Math.min(100, syn + Math.round((Math.random() - 0.5) * 2)))
      if (statusRef.current) {
        statusRef.current.querySelector('[data-stat="sig"]').textContent = sig
        statusRef.current.querySelector('[data-stat="mem"]').textContent = mem
        statusRef.current.querySelector('[data-stat="syn"]').textContent = syn
      }
    }, 1800)
    return () => clearInterval(iv)
  }, [entered])

  // viewport resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // nav rail active scene
  useEffect(() => {
    if (!entered) return
    const triggers = []
    const t = setTimeout(() => {
      SCENES.forEach(({ id }, idx) => {
        const el = document.getElementById(id)
        if (!el) return
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onEnter:     () => setActiveScene(idx),
            onEnterBack: () => setActiveScene(idx),
          })
        )
      })
    }, 300)
    return () => { clearTimeout(t); triggers.forEach(st => st.kill()) }
  }, [entered])

  const scrollTo = useCallback((id, e) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    if (reduced) {
      el.scrollIntoView()
    } else {
      gsap.to(window, {
        scrollTo: { y: el, offsetY: 0 },
        duration: 1.1,
        ease: 'power3.inOut',
      })
    }
    setNavOpen(false)
  }, [reduced])

  if (!entered) return null

  return (
    <>
      {/* Viewport corner brackets */}
      <div className="hud-viewport-brackets" aria-hidden="true">
        <span className="vp-bracket vp-tl" />
        <span className="vp-bracket vp-tr" />
        <span className="vp-bracket vp-bl" />
        <span className="vp-bracket vp-br" />
      </div>

      {/* Scanline sweep */}
      {!reduced && <div className="hud-scanline" aria-hidden="true" />}

      {/* Coordinate readout */}
      <div className="hud-coord" aria-hidden="true">
        <span ref={coordRef} className="live-num">
          LAT 12.9714&deg; / LON 77.5946&deg;
        </span>
      </div>

      {/* System-status strip */}
      <div ref={statusRef} className="hud-status-strip" aria-hidden="true">
        <span className="stat-item">SIGNAL&nbsp;<span className="live-num stat-val" data-stat="sig">98</span></span>
        <span className="stat-dot">&#9670;</span>
        <span className="stat-item">MEMORY&nbsp;<span className="live-num stat-val" data-stat="mem">64</span></span>
        <span className="stat-dot">&#9670;</span>
        <span className="stat-item">SYNC&nbsp;<span className="live-num stat-val" data-stat="syn">100</span></span>
      </div>

      {/* Desktop nav rail */}
      <nav className="hud-rail" aria-label="Scene navigation">
        <ul className="hud-rail-list" role="list">
          {SCENES.map(({ label, id, short }, i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`hud-rail-link${activeScene === i ? ' is-active' : ''}`}
                onClick={(e) => scrollTo(id, e)}
              >
                <span className="rail-num">{short}</span>
                <span className="rail-label">{label}</span>
                <span className="rail-pip" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile nav tab */}
      {isMobile && (
        <div className={`hud-mobile-nav${navOpen ? ' is-open' : ''}`}>
          <button
            className="hud-mobile-toggle"
            onClick={() => setNavOpen(o => !o)}
            aria-expanded={navOpen}
            aria-controls="hud-mobile-menu"
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          >
            <span className="toggle-glyph">{navOpen ? '\u2715' : '\u25b2'}</span>
            <span className="toggle-label">NAV</span>
          </button>
          {navOpen && (
            <ul id="hud-mobile-menu" className="hud-mobile-list" role="list">
              {SCENES.map(({ label, id }, i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`hud-mobile-link${activeScene === i ? ' is-active' : ''}`}
                    onClick={(e) => scrollTo(id, e)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <style>{`
        .hud-viewport-brackets {
          position: fixed; inset: 0;
          pointer-events: none; z-index: 9990;
        }
        .vp-bracket {
          position: absolute;
          width: 22px; height: 22px;
          border-color: rgba(63,224,197,0.32);
          border-style: solid;
        }
        .vp-tl { top: 14px; left: 14px; border-width: 1.5px 0 0 1.5px; }
        .vp-tr { top: 14px; right: 14px; border-width: 1.5px 1.5px 0 0; }
        .vp-bl { bottom: 14px; left: 14px; border-width: 0 0 1.5px 1.5px; }
        .vp-br { bottom: 14px; right: 14px; border-width: 0 1.5px 1.5px 0; }

        .hud-scanline {
          position: fixed; top: -4px; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(63,224,197,0.05) 30%,
            rgba(63,224,197,0.09) 50%,
            rgba(63,224,197,0.05) 70%,
            transparent 100%
          );
          pointer-events: none; z-index: 9989;
          animation: scanSweep var(--scanline-dur) linear infinite;
          will-change: top;
        }
        @keyframes scanSweep {
          0%   { top: -4px; opacity: 0; }
          3%   { opacity: 1; }
          94%  { opacity: 0.8; }
          100% { top: 100svh; opacity: 0; }
        }

        .hud-coord {
          position: fixed; bottom: 18px; left: 20px;
          font-family: var(--font-mono);
          font-size: var(--font-size-hud);
          color: var(--mint);
          opacity: 0.45;
          pointer-events: none; z-index: 9991;
          letter-spacing: 0.08em;
        }

        .hud-status-strip {
          position: fixed;
          font-family: var(--font-mono);
          font-size: var(--font-size-hud);
          color: var(--mint);
          opacity: 0.5;
          letter-spacing: 0.1em;
          pointer-events: none;
          z-index: 9991;
          display: flex; align-items: center; gap: 8px;
          left: 26px; top: 50%;
          transform: translateY(-50%) rotate(-90deg) translateX(-50%);
          transform-origin: left center;
          white-space: nowrap;
        }
        .stat-item { display: inline-flex; align-items: center; gap: 3px; }
        .stat-val { color: var(--chalk); }
        .stat-dot { opacity: 0.35; font-size: 0.45rem; }

        @media (max-width: 899px) {
          .hud-status-strip {
            left: 50%; top: auto; bottom: 44px;
            transform: translateX(-50%);
            font-size: 0.52rem;
          }
          .hud-coord { display: none; }
        }

        .hud-rail {
          position: fixed; right: 0; top: 50%;
          transform: translateY(-50%);
          width: 56px;
          z-index: 9992;
          padding: 0;
        }
        .hud-rail-list {
          list-style: none; margin: 0; padding: 0;
          display: flex; flex-direction: column; gap: 1px;
        }
        .hud-rail-link {
          display: flex; flex-direction: column; align-items: flex-end;
          padding: 9px 10px 9px 4px;
          text-decoration: none;
          position: relative;
          border-right: 1px solid rgba(63,224,197,0.07);
          transition: border-color 0.3s;
        }
        .hud-rail-link:focus-visible {
          outline: 2px solid var(--mint);
          outline-offset: 0;
        }
        .rail-num {
          font-family: var(--font-mono);
          font-size: 0.52rem;
          color: var(--mint);
          opacity: 0.3;
          letter-spacing: 0.1em;
          transition: opacity 0.25s;
        }
        .rail-label {
          font-family: var(--font-mono);
          font-size: 0.48rem;
          color: var(--chalk-dim);
          opacity: 0;
          letter-spacing: 0.12em;
          text-align: right;
          transform: translateX(4px);
          transition: opacity 0.25s, transform 0.25s;
          white-space: nowrap;
        }
        .rail-pip {
          position: absolute; right: -1px; top: 50%;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--mint);
          opacity: 0;
          transform: translateY(-50%);
          transition: opacity 0.25s;
          box-shadow: 0 0 5px var(--mint);
        }
        .hud-rail-link.is-active { border-color: rgba(63,224,197,0.42); }
        .hud-rail-link.is-active .rail-num  { opacity: 1; }
        .hud-rail-link.is-active .rail-label { opacity: 0.72; transform: translateX(0); }
        .hud-rail-link.is-active .rail-pip  { opacity: 1; }
        .hud-rail-link:hover .rail-label { opacity: 0.6; transform: translateX(0); }
        .hud-rail-link:hover .rail-num   { opacity: 0.65; }

        @media (max-width: 899px) { .hud-rail { display: none; } }

        .hud-mobile-nav {
          position: fixed; bottom: 10px; right: 10px;
          z-index: 9992;
          display: none;
          flex-direction: column-reverse;
          align-items: flex-end;
          gap: 4px;
        }
        @media (max-width: 899px) { .hud-mobile-nav { display: flex; } }

        .hud-mobile-toggle {
          display: flex; align-items: center; gap: 4px;
          font-family: var(--font-mono);
          font-size: 0.6rem; letter-spacing: 0.1em;
          color: var(--mint);
          border: 1px solid rgba(63,224,197,0.3);
          padding: 10px 14px; border-radius: 2px;
          min-height: 44px;
          background: rgba(10,11,16,0.88);
          backdrop-filter: blur(6px);
          cursor: pointer;
          touch-action: manipulation;
        }
        .hud-mobile-toggle:focus-visible { outline: 2px solid var(--mint); outline-offset: 2px; }
        .toggle-glyph { font-size: 0.65rem; }

        .hud-mobile-list {
          list-style: none; margin: 0; padding: 0;
          border: 1px solid rgba(63,224,197,0.18);
          background: rgba(10,11,16,0.92);
          backdrop-filter: blur(10px);
          border-radius: 2px;
          overflow: hidden;
          min-width: 130px;
        }
        .hud-mobile-link {
          display: flex; align-items: center;
          font-family: var(--font-mono);
          font-size: 0.6rem; letter-spacing: 0.1em;
          color: var(--chalk-dim);
          padding: 10px 14px;
          min-height: 44px;
          text-decoration: none;
          border-bottom: 1px solid rgba(63,224,197,0.07);
          transition: color 0.2s, background 0.2s;
          touch-action: manipulation;
        }
        .hud-mobile-link:last-child { border-bottom: none; }
        .hud-mobile-link:hover { color: var(--mint); background: rgba(63,224,197,0.05); }
        .hud-mobile-link.is-active { color: var(--mint); }
        .hud-mobile-link:focus-visible { outline: 2px solid var(--mint); outline-offset: -2px; }
      `}</style>
    </>
  )
}
