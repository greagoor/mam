import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/animation'
import ParticleField from '../components/ParticleField'

const LOG_LINES = [
  'sampling classroom footage … done',
  'measuring silence after "excuse me?" … immeasurable',
  'strictness/respect correlation … 1:1 ratio. unusual.',
  'coolness sensor … reading beyond scale limit',
  'diagnosis: confirmed. recalibration not possible.',
]

// Tick marks around the arc for instrument-panel look
function ArcTicks({ cx, cy, r, count = 20, danger }) {
  const ticks = []
  for (let i = 0; i <= count; i++) {
    const angle = -180 + (i / count) * 180 // -180 to 0 degrees (semicircle)
    const rad = (angle * Math.PI) / 180
    const isMajor = i % 5 === 0
    const len = isMajor ? 8 : 4
    const x1 = cx + r * Math.cos(rad)
    const y1 = cy + r * Math.sin(rad)
    const x2 = cx + (r + len) * Math.cos(rad)
    const y2 = cy + (r + len) * Math.sin(rad)
    ticks.push(
      <line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={danger ? 'rgba(214,64,44,0.35)' : 'rgba(63,224,197,0.25)'}
        strokeWidth={isMajor ? 1.2 : 0.7}
      />
    )
  }
  return <>{ticks}</>
}

// Crack path SVG overlay
function CrackOverlay({ visible }) {
  const pathRef = useRef(null)
  useEffect(() => {
    if (!visible || !pathRef.current) return
    const len = pathRef.current.getTotalLength?.() ?? 300
    gsap.fromTo(pathRef.current,
      { strokeDashoffset: len, strokeDasharray: len, opacity: 1 },
      { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }
    )
  }, [visible])
  if (!visible) return null
  return (
    <g>
      <path
        ref={pathRef}
        d="M100,50 L88,74 L104,72 L78,110 M100,50 L115,68 L98,70 L122,95 M88,74 L72,88 M104,72 L118,82"
        fill="none"
        stroke="rgba(214,64,44,0.7)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Scorched darkening */}
      <ellipse cx="100" cy="80" rx="44" ry="38"
        fill="rgba(214,64,44,0.06)"
        stroke="none"
      />
    </g>
  )
}

// Individual instrument dial gauge
function InstrumentGauge({ label, value, danger, cracked, needleFlyRef, shardContainerRef, gaugeContainerRef }) {
  const MAX_DISPLAY = 140
  const pct = Math.min(value / MAX_DISPLAY, 1)
  // Map 0-1 → -90..90 degrees (semicircle)
  const angle = -90 + pct * 180
  const isOverflow = value > 100
  const isAtLimit = danger && value >= 118

  return (
    <div
      ref={gaugeContainerRef}
      className={`idial hud-frame${danger ? ' idial-danger' : ''}${cracked ? ' idial-cracked' : ''}`}
    >
      <div className="hud-corners" aria-hidden="true" />
      <div className="idial-head">
        <span className="idial-label live-num">{label}</span>
        {isAtLimit && (
          <span className="idial-limit-badge">HOLDING AT LIMIT</span>
        )}
        {cracked && (
          <span className="idial-cracked-badge">UNMEASURABLE</span>
        )}
      </div>

      <div className="idial-svg-wrap" style={{ position: 'relative' }}>
        <svg viewBox="0 0 200 130" width="100%" aria-hidden="true">
          {/* Arc background track */}
          <path d="M16,118 A84,84 0 0 1 184,118"
            fill="none"
            stroke={danger ? 'rgba(214,64,44,0.12)' : 'rgba(63,224,197,0.10)'}
            strokeWidth="12"
          />
          {/* Tick marks */}
          <ArcTicks cx={100} cy={118} r={95} count={20} danger={danger} />
          {/* Filled arc */}
          {!cracked && (
            <path d="M16,118 A84,84 0 0 1 184,118"
              fill="none"
              stroke={isOverflow || danger ? 'var(--signal)' : 'var(--mint)'}
              strokeWidth="12"
              strokeDasharray={`${pct * 263.9} 263.9`}
              strokeLinecap="butt"
              style={{ filter: isAtLimit ? 'drop-shadow(0 0 6px var(--signal))' : (isOverflow ? 'none' : 'drop-shadow(0 0 4px rgba(63,224,197,0.5))') }}
            />
          )}
          {/* Redline zone marker */}
          <path d="M160,118 A84,84 0 0 1 184,118"
            fill="none"
            stroke={danger ? 'rgba(214,64,44,0.5)' : 'rgba(63,224,197,0.25)'}
            strokeWidth="12"
            strokeDasharray="none"
          />
          {/* Center labels */}
          <text x="100" y="106" textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="7"
            fill="rgba(241,237,228,0.2)" letterSpacing="1">
            0%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;140%
          </text>

          {/* Needle */}
          {!cracked && (
            <g
              ref={needleFlyRef}
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: '100px 118px',
                transition: cracked ? 'none' : 'transform 1.6s cubic-bezier(.16,.9,.2,1)',
              }}
            >
              <line x1="100" y1="118" x2="100" y2="34"
                stroke={isOverflow || danger ? 'var(--signal-2)' : 'var(--mint)'}
                strokeWidth="2.2"
                strokeLinecap="round"
                style={{ filter: isAtLimit ? 'drop-shadow(0 0 5px var(--signal-2))' : 'none' }}
              />
              <polygon points="100,28 97,40 103,40"
                fill={isOverflow || danger ? 'var(--signal-2)' : 'var(--mint)'}
              />
            </g>
          )}
          {/* Center pip */}
          <circle cx="100" cy="118" r="5"
            fill={danger ? 'var(--signal)' : 'var(--mint)'}
            stroke={danger ? 'rgba(214,64,44,0.4)' : 'rgba(63,224,197,0.3)'}
            strokeWidth="4"
          />

          {/* Crack overlay */}
          <CrackOverlay visible={cracked} />
        </svg>

        {/* Shard particles — only rendered when cracked */}
        {cracked && (
          <div ref={shardContainerRef} className="idial-shards" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="idial-shard" />
            ))}
          </div>
        )}
      </div>

      <div className="idial-readout">
        {cracked ? (
          <span className="idial-value cracked-value">&#8734;</span>
        ) : (
          <span className={`idial-value live-num${isAtLimit ? ' alarm' : ''}`}>
            {String(value).padStart(3, '\u2007')}
            <span className="idial-unit">%</span>
          </span>
        )}
        {cracked && (
          <span className="idial-cracked-sub">dial did not survive</span>
        )}
      </div>
    </div>
  )
}

export default function PersonalityScene() {
  const sectionRef   = useRef(null)
  const strictNeedleRef = useRef(null)
  const coolNeedleRef   = useRef(null)
  const coolShardRef    = useRef(null)
  const coolGaugeRef    = useRef(null)

  const [running,  setRunning]  = useState(false)
  const [strict,   setStrict]   = useState(0)
  const [cool,     setCool]     = useState(0)
  const [logIdx,   setLogIdx]   = useState(0)
  const [cracked,  setCracked]  = useState(false)
  const reduced = prefersReducedMotion()

  const runDiagnostic = useCallback(() => {
    if (running) return
    setRunning(true)
    setCracked(false)
    setLogIdx(0)
    setStrict(0)
    setCool(0)

    // Reset any inline GSAP transforms from previous explosion
    if (coolNeedleRef.current) {
      gsap.set(coolNeedleRef.current, { clearProps: 'all' })
    }
    if (coolGaugeRef.current) {
      gsap.set(coolGaugeRef.current, { clearProps: 'all' })
    }

    const obj = { s: 0, c: 0 }

    gsap.to(obj, {
      s: 118,
      c: 132,
      duration: reduced ? 0.3 : 3.0,
      ease: 'power3.inOut',
      onUpdate() {
        setStrict(Math.round(obj.s))
        setCool(Math.round(obj.c))
        // Trigger explosion just once when coolness crosses 118
        if (obj.c >= 118 && !explosionFired.current) {
          triggerExplosion()
        }
      },
      onComplete() {
        setRunning(false)
      },
    })

    LOG_LINES.forEach((_, i) => {
      setTimeout(() => setLogIdx(i + 1), (reduced ? 60 : 520) * (i + 1))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, reduced])

  // Coolness explosion sequence
  const explosionFired = useRef(false)
  function triggerExplosion() {
    if (explosionFired.current) return
    explosionFired.current = true
    setCracked(true)

    if (reduced) return  // reduced-motion: just crack + text swap

    // 1. Needle stutters (already at max CSS angle — animate further)
    const needle = coolNeedleRef.current
    if (needle) {
      gsap.to(needle, {
        rotate: 110, duration: 0.08, ease: 'power4.out',
        transformOrigin: '100px 118px',
        onComplete() {
          gsap.to(needle, {
            x: 400, y: -200, rotate: 720,
            duration: 0.5, ease: 'power3.in',
          })
        }
      })
    }

    // 2. Container shake
    const gauge = coolGaugeRef.current
    if (gauge) {
      gsap.timeline()
        .to(gauge, { x: -7, duration: 0.05 })
        .to(gauge, { x: 8, duration: 0.05 })
        .to(gauge, { x: -5, duration: 0.04 })
        .to(gauge, { x: 6, duration: 0.04 })
        .to(gauge, { x: -3, duration: 0.04 })
        .to(gauge, { x: 0, duration: 0.04 })
    }

    // 3. Shard burst — triggered after state updates and shards mount
    setTimeout(() => {
      const shards = coolShardRef.current?.querySelectorAll('.idial-shard')
      if (shards && shards.length) {
        gsap.fromTo(shards,
          { x: 0, y: 0, opacity: 0.9, scale: 1, rotation: 0 },
          {
            x: () => gsap.utils.random(-140, 140),
            y: () => gsap.utils.random(-160, 60),
            rotation: () => gsap.utils.random(-360, 360),
            scale: () => gsap.utils.random(0.4, 1.6),
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.025,
          }
        )
      }
    }, 80)

    // 4. Red strobe flash on the section
    const section = sectionRef.current
    if (section) {
      gsap.timeline()
        .to(section, { backgroundColor: 'rgba(214,64,44,0.12)', duration: 0.07 })
        .to(section, { backgroundColor: 'transparent', duration: 0.15 })
        .to(section, { backgroundColor: 'rgba(214,64,44,0.06)', duration: 0.07 })
        .to(section, { backgroundColor: 'transparent', duration: 0.25 })
    }
  }

  useEffect(() => {
    explosionFired.current = false
  }, [running])

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 65%',
      once: true,
      onEnter: () => runDiagnostic(),
    })
    return () => trigger.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      ref={sectionRef}
      id="scene-diagnostic"
      className="scene personality-scene"
      aria-label="Teacher diagnostic panel"
    >
      <ParticleField density={0.5} color="214,64,44" />
      <div className="pers-panel">
        <div className="pers-head">
          <span className="hud-label">SYSTEM // teacher_diagnostic.exe</span>
          <button
            className="rerun-btn"
            onClick={() => {
              explosionFired.current = false
              runDiagnostic()
            }}
            data-cursor="run"
            aria-label="Run diagnostic again"
            disabled={running}
          >
            {running ? 'running\u2026' : 'run again \u27f3'}
          </button>
        </div>

        <div className="pers-title-wrap hud-frame">
          <div className="hud-corners" aria-hidden="true" />
          <h2 className="pers-title">subject: unknown. results: undeniable.</h2>
          <span className="pers-subtitle hud-label">READING CONFIRMED: SCALE IS THE PROBLEM, NOT THE SUBJECT</span>
        </div>

        <div className="gauges-row">
          <InstrumentGauge
            label="STRICTNESS"
            value={strict}
            danger
            cracked={false}
            needleFlyRef={strictNeedleRef}
            shardContainerRef={null}
            gaugeContainerRef={null}
          />
          <InstrumentGauge
            label="COOLNESS"
            value={cracked ? 999 : cool}
            danger={false}
            cracked={cracked}
            needleFlyRef={coolNeedleRef}
            shardContainerRef={coolShardRef}
            gaugeContainerRef={coolGaugeRef}
          />
        </div>

        <div className="log-console" aria-live="polite">
          {LOG_LINES.slice(0, logIdx).map((l, i) => (
            <p key={i} className="log-line">
              <span className="log-caret">&rsaquo;</span> {l}
            </p>
          ))}
        </div>
      </div>

      <style>{`
        .personality-scene {
          background: linear-gradient(180deg, var(--ink) 0%, #150d10 100%);
          padding: var(--sp-6) var(--sp-3);
          flex-direction: column;
        }
        .pers-panel {
          position: relative; z-index: 2;
          max-width: 800px; width: 100%;
          margin: 0 auto;
          display: flex; flex-direction: column; gap: var(--sp-4);
        }
        .pers-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: var(--sp-3); flex-wrap: wrap;
        }
        .rerun-btn {
          font-family: var(--font-mono); font-size: 0.68rem;
          letter-spacing: 0.08em; color: var(--chalk);
          border: var(--hud-border);
          padding: 7px 14px;
          min-height: 44px;
          border-radius: 2px;
          transition: border-color .3s, background .3s, color .3s;
          touch-action: manipulation;
        }
        .rerun-btn:not(:disabled):hover {
          border-color: var(--mint);
          background: rgba(63,224,197,0.07);
          color: var(--mint);
        }
        .rerun-btn:disabled { opacity: 0.45; cursor: default; }

        .pers-title-wrap {
          padding: var(--sp-2) var(--sp-3);
          border: var(--hud-border);
          border-radius: 2px;
          display: flex; flex-direction: column; gap: var(--sp-1);
          --bracket-size: 10px;
        }
        .pers-title {
          font-size: clamp(1.3rem, 3.8vw, 2rem);
          font-weight: 420; color: var(--chalk);
        }
        .pers-subtitle { opacity: 0.6; }

        .gauges-row {
          display: flex; gap: var(--sp-4);
          flex-wrap: wrap; justify-content: center;
          align-items: flex-start;
        }

        /* Instrument dial */
        .idial {
          width: 220px;
          display: flex; flex-direction: column; gap: 0;
          padding: var(--sp-2);
          border: var(--hud-border);
          border-radius: 2px;
          --bracket-size: 10px;
          background: rgba(18,20,28,0.6);
          position: relative;
        }
        .idial-danger { border-color: rgba(214,64,44,0.22); }
        .idial-cracked {
          border-color: rgba(214,64,44,0.4);
          background: rgba(30,10,10,0.7);
          box-shadow: var(--signal-glow);
        }
        .idial-head {
          display: flex; flex-direction: column; gap: 2px;
          margin-bottom: var(--sp-1);
        }
        .idial-label {
          font-size: 0.6rem; letter-spacing: 0.14em;
          color: var(--mint); opacity: 0.8;
        }
        .idial-danger .idial-label { color: var(--signal-2); }
        .idial-limit-badge {
          font-family: var(--font-mono);
          font-size: 0.52rem; letter-spacing: 0.12em;
          color: var(--signal-2);
          animation: blink 1.2s steps(2) infinite;
        }
        .idial-cracked-badge {
          font-family: var(--font-mono);
          font-size: 0.52rem; letter-spacing: 0.12em;
          color: var(--signal-2);
        }
        @keyframes blink { 50% { opacity: 0.2; } }

        .idial-svg-wrap { position: relative; width: 100%; }

        .idial-shards {
          position: absolute; inset: 0; pointer-events: none;
          display: flex; align-items: center; justify-content: center;
        }
        .idial-shard {
          position: absolute;
          top: 50%; left: 50%;
          width: 6px; height: 6px;
          background: var(--signal-2);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          opacity: 0.9;
        }

        .idial-readout {
          display: flex; flex-direction: column; align-items: center;
          margin-top: -8px; gap: 2px;
        }
        .idial-value {
          font-family: var(--font-mono);
          font-size: 1.5rem; font-weight: 600;
          color: var(--mint);
          font-variant-numeric: tabular-nums;
        }
        .idial-danger .idial-value { color: var(--signal-2); }
        .idial-value.alarm {
          color: var(--signal-2);
          text-shadow: var(--signal-glow);
          animation: alarmFlicker 1.8s ease-in-out infinite;
        }
        @keyframes alarmFlicker {
          0%,100% { opacity: 1; }
          48%     { opacity: 1; }
          50%     { opacity: 0.6; }
          52%     { opacity: 1; }
        }
        .cracked-value {
          font-size: 1.8rem;
          color: var(--signal-2);
          text-shadow: var(--signal-glow);
        }
        .idial-unit { font-size: 0.75rem; opacity: 0.65; }
        .idial-cracked-sub {
          font-family: var(--font-mono);
          font-size: 0.55rem; letter-spacing: 0.1em;
          color: var(--signal); opacity: 0.75;
          text-align: center;
        }

        .log-console {
          font-family: var(--font-mono);
          font-size: 0.74rem; color: var(--mint); opacity: 0.8;
          min-height: 6em;
          border-left: 1px solid rgba(63,224,197,0.15);
          padding-left: var(--sp-2);
        }
        .log-line { margin: 0.28em 0; }
        .log-caret { color: var(--signal-2); margin-right: 5px; }

        @media (max-width: 640px) {
          .gauges-row { gap: var(--sp-3); }
          .idial { width: 155px; }
        }
        @media (max-width: 400px) {
          .gauges-row { gap: var(--sp-2); }
          .idial { width: 140px; }
          .pers-title { font-size: 1.1rem; }
          .rerun-btn { font-size: 0.62rem; }
        }
      `}</style>
    </section>
  )
}
