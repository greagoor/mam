import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion, EASE } from '../utils/animation'
import ParticleField from '../components/ParticleField'

// Preserved copy lines, now paired with small instrument icons + index labels
const ENTRIES = [
  {
    id: 'notebook',
    index: '001',
    category: 'GRADE RECORD',
    line: 'graduated. her margin notes still make more sense than the textbook.',
    icon: (c) => (
      <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
        <rect x="8" y="5" width="24" height="30" rx="1" fill="none" stroke={c} strokeWidth="1.5" />
        <line x1="8" y1="11" x2="32" y2="11" stroke={c} strokeWidth="1.2" />
        {[16, 20, 24, 28].map(y => <line key={y} x1="12" y1={y} x2="28" y2={y} stroke={c} strokeWidth="0.8" opacity="0.5" />)}
      </svg>
    ),
  },
  {
    id: 'chalk',
    index: '002',
    category: 'CLASSROOM LOG',
    line: 'the board was the deck, the mouse was the marker.',
    icon: (c) => (
      <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
        <rect x="12" y="17" width="18" height="6" rx="2" fill="none" stroke={c} strokeWidth="1.5" transform="rotate(-15 21 20)" />
        <line x1="8" y1="30" x2="30" y2="30" stroke={c} strokeWidth="1" opacity="0.4" strokeDasharray="2 3" />
      </svg>
    ),
  },
  {
    id: 'idcard',
    index: '003',
    category: 'IDENTITY FILE',
    line: 'student status: expired. respect status: permanent.',
    icon: (c) => (
      <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
        <rect x="5" y="11" width="30" height="19" rx="2" fill="none" stroke={c} strokeWidth="1.5" />
        <circle cx="13" cy="18" r="4" fill="none" stroke={c} strokeWidth="1.2" />
        <line x1="19" y1="16" x2="30" y2="16" stroke={c} strokeWidth="1.2" />
        <line x1="19" y1="20" x2="27" y2="20" stroke={c} strokeWidth="0.9" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'certificate',
    index: '004',
    category: 'CERTIFIED EVENT',
    line: 'signed by her, weeks before everything changed.',
    icon: (c) => (
      <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
        <rect x="6" y="6" width="28" height="22" rx="1" fill="none" stroke={c} strokeWidth="1.5" />
        <line x1="10" y1="12" x2="30" y2="12" stroke={c} strokeWidth="1" opacity="0.6" />
        <line x1="10" y1="16" x2="24" y2="16" stroke={c} strokeWidth="0.8" opacity="0.4" />
        <circle cx="20" cy="23" r="5" fill="none" stroke={c} strokeWidth="1.2" />
        <path d="M15,27 L13,34 L20,30 L27,34 L25,27" fill="none" stroke={c} strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'calendar',
    index: '005',
    category: 'DATE STAMP',
    line: 'the day I packed for a different campus.',
    icon: (c) => (
      <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
        <rect x="6" y="9" width="28" height="24" rx="2" fill="none" stroke={c} strokeWidth="1.5" />
        <line x1="6" y1="16" x2="34" y2="16" stroke={c} strokeWidth="1.2" />
        <line x1="13" y1="5" x2="13" y2="11" stroke={c} strokeWidth="1.5" />
        <line x1="27" y1="5" x2="27" y2="11" stroke={c} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="3" fill={c} opacity="0.75" />
      </svg>
    ),
  },
  {
    id: 'cap',
    index: '006',
    category: 'CEREMONY LOG',
    line: 'she was there. of course she was.',
    icon: (c) => (
      <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
        <polygon points="20,9 37,17 20,24 3,17" fill="none" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10,19 v8 q10,5 20,0 v-8" fill="none" stroke={c} strokeWidth="1.4" />
        <line x1="20" y1="24" x2="20" y2="32" stroke={c} strokeWidth="1" opacity="0.6" />
        <circle cx="20" cy="33" r="1.5" fill={c} />
      </svg>
    ),
  },
]

// Characters used to scramble text during decrypt animation
const SCRAMBLE_CHARS = '█▓▒░!@#$%?><][}{/\\'

function scrambleLine(text, revealPct, reduced) {
  if (reduced || revealPct >= 1) return text
  const revealCount = Math.floor(text.length * revealPct)
  return text
    .split('')
    .map((ch, i) => {
      if (ch === ' ') return ' '
      if (i < revealCount) return ch
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
    })
    .join('')
}

function useDecrypt(targetText, active, reduced) {
  const [display, setDisplay] = useState('')
  const pctRef = useRef(0)
  const rafRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!active) {
      setDisplay('')
      pctRef.current = 0
      doneRef.current = false
      return
    }
    if (reduced) {
      setDisplay(targetText)
      return
    }
    pctRef.current = 0
    doneRef.current = false

    const duration = 0.55 // seconds
    const startTime = performance.now()

    function tick(now) {
      const elapsed = (now - startTime) / 1000
      const pct = Math.min(elapsed / duration, 1)
      pctRef.current = pct
      setDisplay(scrambleLine(targetText, pct, false))
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(targetText)
        doneRef.current = true
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, targetText, reduced])

  return display
}

function MemoryEntry({ entry, active, reduced, cardRef }) {
  const decrypted = useDecrypt(entry.line, active, reduced)

  return (
    <div ref={cardRef} className="mem-entry hud-frame" aria-live={active ? 'polite' : undefined}>
      <div className="hud-corners" aria-hidden="true" />
      <div className="mem-entry-head">
        <span className="mem-icon-wrap" aria-hidden="true">
          {entry.icon('var(--gold)')}
        </span>
        <div className="mem-entry-meta">
          <span className="mem-index gold-label">ENTRY {entry.index}</span>
          <span className="mem-category hud-label">{entry.category}</span>
        </div>
      </div>
      <div className="mem-rule" aria-hidden="true" />
      <p className="mem-line">{active ? decrypted : <span aria-hidden="true">{'█'.repeat(Math.min(entry.line.length, 48))}</span>}</p>
    </div>
  )
}

export default function MemoryWorld() {
  const sectionRef = useRef(null)
  const cardRef = useRef(null)
  const [current, setCurrent] = useState(-1)   // -1 = not started
  const [started, setStarted] = useState(false)
  const reduced = prefersReducedMotion()

  const totalEntries = ENTRIES.length
  const revealed = current + 1  // how many have been seen

  // Animate card in when current changes
  useEffect(() => {
    if (current < 0 || !cardRef.current) return
    if (reduced) return
    gsap.fromTo(cardRef.current,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: EASE.out }
    )
  }, [current, reduced])

  // Auto-start first entry on scroll-enter
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        setStarted(true)
        setCurrent(0)
      },
    })
    return () => trigger.kill()
  }, [])

  const advance = useCallback(() => {
    setCurrent(c => Math.min(c + 1, totalEntries - 1))
  }, [totalEntries])

  const isComplete = current >= totalEntries - 1

  return (
    <section
      ref={sectionRef}
      id="scene-memory"
      className="scene memory-scene"
      aria-label="Memory archive scan"
    >
      <ParticleField density={0.4} color="201,162,76" />

      <div className="mem-panel">
        {/* Header */}
        <div className="mem-header">
          <span className="hud-label">MEMORY // archive_scan.log</span>
          <span className="mem-counter gold-label" aria-live="polite" aria-atomic="true">
            {String(Math.max(revealed, 0)).padStart(2, '0')}&nbsp;/&nbsp;{String(totalEntries).padStart(2, '0')}&nbsp;ENTRIES RECOVERED
          </span>
        </div>

        <div className="mem-rule-top" aria-hidden="true" />

        {/* Entry display */}
        <div className="mem-entry-area">
          {!started ? (
            <div className="mem-standby" aria-live="polite">
              <span className="hud-label">AWAITING SCAN INITIATION…</span>
            </div>
          ) : (
            <MemoryEntry
              key={current}
              entry={ENTRIES[current]}
              active={true}
              reduced={reduced}
              cardRef={cardRef}
            />
          )}
        </div>

        {/* Advance button */}
        {started && (
          <button
            className={`mem-advance-btn${isComplete ? ' is-complete' : ''}`}
            onClick={advance}
            disabled={isComplete}
            aria-label={isComplete ? 'Archive scan complete' : `Scan next entry (${revealed + 1} of ${totalEntries})`}
          >
            <span className="mem-btn-glyph" aria-hidden="true">{isComplete ? '✓' : '▶'}</span>
            <span className="mem-btn-text">
              {isComplete ? 'ARCHIVE COMPLETE' : 'SCAN NEXT ENTRY'}
            </span>
          </button>
        )}

        {/* Progress bar */}
        <div className="mem-progress" role="progressbar" aria-valuenow={revealed} aria-valuemin={0} aria-valuemax={totalEntries}>
          {ENTRIES.map((e, i) => (
            <span
              key={e.id}
              className={`mem-seg${i < revealed ? ' is-filled' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Completion bonus */}
        {isComplete && (
          <p className="mem-complete-line" role="status">
            all entries recovered. she&rsquo;d be proud &mdash; and mildly suspicious.
          </p>
        )}
      </div>

      <style>{`
        .memory-scene {
          background: radial-gradient(140% 100% at 50% 0%, #1a1410 0%, var(--ink) 55%);
          flex-direction: column;
          padding: var(--sp-5) var(--sp-3);
          min-height: 100svh;
        }

        .mem-panel {
          position: relative; z-index: 2;
          width: 100%; max-width: 640px;
          margin: 0 auto;
          display: flex; flex-direction: column; gap: var(--sp-3);
        }

        .mem-header {
          display: flex; flex-direction: column; gap: var(--sp-1);
        }
        .mem-counter {
          font-variant-numeric: tabular-nums;
          font-size: 0.62rem;
        }

        .mem-rule-top {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, var(--gold-dim), transparent);
          opacity: 0.35;
        }

        /* Entry card */
        .mem-entry {
          background: rgba(18,20,12,0.7);
          border: 1px solid rgba(201,162,76,0.18);
          border-radius: 2px;
          padding: var(--sp-3);
          display: flex; flex-direction: column; gap: var(--sp-2);
          min-height: 140px;
          --bracket-size: 12px;
          --bracket-weight: 1.5px;
          --hud-border-color: rgba(201,162,76,0.3);
        }

        .mem-entry-head {
          display: flex; align-items: flex-start; gap: var(--sp-2);
        }
        .mem-icon-wrap {
          flex-shrink: 0;
          opacity: 0.85;
        }
        .mem-entry-meta {
          display: flex; flex-direction: column; gap: 2px;
          padding-top: 2px;
        }
        .mem-index {
          font-size: 0.68rem; letter-spacing: 0.14em;
        }
        .mem-category {
          font-size: 0.58rem; opacity: 0.6;
        }

        .mem-rule {
          width: 100%; height: 1px;
          background: rgba(201,162,76,0.18);
        }

        .mem-line {
          font-family: var(--font-mono);
          font-size: clamp(0.82rem, 2.6vw, 0.95rem);
          color: var(--chalk);
          line-height: 1.6;
          letter-spacing: 0.01em;
          min-height: 3.2em;
        }

        .mem-standby {
          display: flex; align-items: center; justify-content: center;
          min-height: 140px;
          border: 1px solid rgba(201,162,76,0.1);
          border-radius: 2px;
        }

        /* Advance button — full-width, 56px+, easy thumb target */
        .mem-advance-btn {
          width: 100%;
          min-height: 56px;
          display: flex; align-items: center; justify-content: center;
          gap: var(--sp-2);
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          color: var(--chalk);
          background: rgba(201,162,76,0.06);
          border: 1px solid rgba(201,162,76,0.25);
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
          touch-action: manipulation;
        }
        .mem-advance-btn:not(:disabled):hover,
        .mem-advance-btn:not(:disabled):focus-visible {
          background: rgba(201,162,76,0.12);
          border-color: var(--gold);
          color: var(--gold);
          outline: none;
          box-shadow: var(--gold-glow);
        }
        .mem-advance-btn:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }
        .mem-advance-btn.is-complete {
          color: var(--gold);
          border-color: rgba(201,162,76,0.4);
          background: rgba(201,162,76,0.08);
          cursor: default;
        }
        .mem-btn-glyph { font-size: 0.9rem; }

        /* 6-segment progress bar */
        .mem-progress {
          display: flex; gap: 4px; align-items: center;
          width: 100%;
        }
        .mem-seg {
          flex: 1;
          height: 3px;
          background: rgba(201,162,76,0.15);
          border-radius: 1px;
          transition: background 0.35s, box-shadow 0.35s;
        }
        .mem-seg.is-filled {
          background: var(--gold);
          box-shadow: 0 0 6px rgba(201,162,76,0.5);
        }

        .mem-complete-line {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--gold);
          opacity: 0.85;
          text-align: center;
          animation: mclIn 0.6s var(--ease-out);
        }
        @keyframes mclIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 0.85; transform: translateY(0); }
        }

        /* Desktop: give entry card a bit more breathing room */
        @media (min-width: 641px) {
          .mem-entry { min-height: 160px; }
          .mem-advance-btn { font-size: 0.82rem; }
        }
      `}</style>
    </section>
  )
}
