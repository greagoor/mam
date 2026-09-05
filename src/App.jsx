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
    const t = setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => { st.kill(); clearTimeout(t) }
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
