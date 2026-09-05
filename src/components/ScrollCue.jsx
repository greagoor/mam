import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../utils/animation'

/**
 * Animated scroll indicator that appears immediately after the user enters
 * the journey and disappears once they've scrolled > 80px.
 */
export default function ScrollCue({ entered }) {
  const [visible, setVisible] = useState(true)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    if (!entered) return
    setVisible(true)
    const onScroll = () => {
      if (window.scrollY > 80) setVisible(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [entered])

  if (!entered || !visible) return null

  return (
    <div className="scroll-cue" aria-hidden="true">
      <span className="scroll-cue-text">SCROLL TO CONTINUE</span>
      <span className="scroll-cue-chevron" />
      <style>{`
        .scroll-cue {
          position: fixed;
          bottom: 52px; left: 50%;
          transform: translateX(-50%);
          z-index: 9988;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          pointer-events: none;
        }
        .scroll-cue-text {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          color: var(--chalk-dim);
          opacity: 0.55;
          ${reduced ? '' : 'animation: cuePulse 2.2s ease-in-out infinite;'}
        }
        .scroll-cue-chevron {
          display: block;
          width: 10px; height: 10px;
          border-right: 1.5px solid var(--mint);
          border-bottom: 1.5px solid var(--mint);
          transform: rotate(45deg);
          opacity: 0.55;
          ${reduced ? '' : 'animation: cueBounce 2.2s ease-in-out infinite;'}
        }
        @keyframes cuePulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.7; }
        }
        @keyframes cueBounce {
          0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.35; }
          50%       { transform: rotate(45deg) translateY(4px); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
