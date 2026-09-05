import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from './utils/animation'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import CustomCursor from './components/CustomCursor'
import HUDChrome from './components/HUDChrome'
import ScrollCue from './components/ScrollCue'
import Intro from './scenes/Intro'
import PersonalityScene from './scenes/PersonalityScene'
import MemoryWorld from './scenes/MemoryWorld'
import GraduationJourney from './scenes/GraduationJourney'
import NoGiftsScene from './scenes/NoGiftsScene'
import FinaleScene from './scenes/FinaleScene'

gsap.registerPlugin(ScrollToPlugin)

export default function App() {
  const [entered, setEntered] = useState(false)
  const progressRef = useRef(null)
  const journeyRef = useRef(null)

  useEffect(() => {
    if (!entered) return
    document.body.classList.remove('no-scroll')

    // top HUD progress bar reflecting overall scroll through the journey
    const st = ScrollTrigger.create({
      trigger: journeyRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.set(progressRef.current, { scaleX: self.progress })
      },
    })

    const refreshLayout = () => {
      ScrollTrigger.refresh()
      if (typeof window !== 'undefined' && window.__ST_METRICS__) {
        console.log('[DEBUG ScrollTrigger Metrics]', window.__ST_METRICS__())
      }
    }

    // Expose debug metrics helper for verification
    window.__ST_METRICS__ = () => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      ratio: (document.documentElement.scrollHeight / window.innerHeight).toFixed(2),
      triggers: ScrollTrigger.getAll().map((t) => ({
        id: t.trigger?.id || (t.trigger?.className ? String(t.trigger.className).split(' ')[0] : 'trigger'),
        start: Math.round(t.start),
        end: Math.round(t.end),
        span: Math.round(t.end - t.start),
      })),
    })

    // 1. Initial measurement after DOM render
    const rafId = requestAnimationFrame(() => refreshLayout())
    const timerA = setTimeout(refreshLayout, 100)
    const timerB = setTimeout(refreshLayout, 400)

    // 2. Refresh when web fonts finish downloading and reflow layout
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => refreshLayout())
    }

    // 3. Debounced refresh on window resize & orientation change
    let resizeTimer
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => refreshLayout(), 150)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      st.kill()
      cancelAnimationFrame(rafId)
      clearTimeout(timerA)
      clearTimeout(timerB)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [entered])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', !entered)
  }, [entered])

  function handleReplay() {
    setEntered(false)
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }

  return (
    <>
      <a href="#journey" className="skip-link">Skip intro</a>
      <CustomCursor />
      <HUDChrome entered={entered} />
      <ScrollCue entered={entered} />

      {!entered && <Intro onEnter={() => setEntered(true)} />}

      {entered && (
        <main id="journey" ref={journeyRef}>
          <div ref={progressRef} className="hud-progress" aria-hidden="true" />
          <PersonalityScene />
          <MemoryWorld />
          <GraduationJourney />
          <NoGiftsScene />
          <FinaleScene onReplay={handleReplay} />
        </main>
      )}

      <style>{`
        .hud-progress {
          position: fixed; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--mint), var(--gold));
          transform-origin: left center; transform: scaleX(0);
          z-index: 9997;
          box-shadow: 0 0 8px rgba(63,224,197,0.4);
        }
      `}</style>
    </>
  )
}
