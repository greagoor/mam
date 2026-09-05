import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// A single shared vocabulary of motion so every scene feels choreographed
// by the same hand, rather than a pile of unrelated animation values.
export const EASE = {
  out: 'expo.out',
  inOut: 'power3.inOut',
  spring: 'back.out(1.6)',
  soft: 'sine.inOut',
}

export const DUR = {
  fast: 0.35,
  med: 0.8,
  slow: 1.6,
  glacial: 2.6,
}

export { gsap, ScrollTrigger }

// Splits a text node into individual <span class="char"> elements
// (a lightweight stand-in for GSAP's paid SplitText plugin) so we can
// animate letters independently — used by kinetic-typography moments.
export function splitChars(el) {
  if (!el || el.__split) return el?.querySelectorAll?.('.char') ?? []
  const text = el.textContent
  el.textContent = ''
  el.__split = true
  const frag = document.createDocumentFragment()
  ;[...text].forEach((ch) => {
    const span = document.createElement('span')
    span.className = 'char'
    span.style.display = 'inline-block'
    span.style.willChange = 'transform, opacity'
    span.textContent = ch === ' ' ? '\u00A0' : ch
    frag.appendChild(span)
  })
  el.appendChild(frag)
  return el.querySelectorAll('.char')
}

export function splitWords(el) {
  if (!el || el.__splitW) return el?.querySelectorAll?.('.word') ?? []
  const text = el.textContent
  el.textContent = ''
  el.__splitW = true
  const words = text.split(' ')
  words.forEach((w, i) => {
    const span = document.createElement('span')
    span.className = 'word'
    span.style.display = 'inline-block'
    span.style.willChange = 'transform, opacity'
    span.textContent = w
    el.appendChild(span)
    if (i < words.length - 1) el.appendChild(document.createTextNode('\u00A0'))
  })
  return el.querySelectorAll('.word')
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function isTouchDevice() {
  return typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
}
