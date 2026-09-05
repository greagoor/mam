# for ma'am

A small, strange, sincere Teachers' Day website. Built as a single scrolling
interactive experience rather than a page of sections — it's meant to be
*felt* more than read.

## What's inside

- **Intro** (`src/scenes/Intro.jsx`) — fake system boot, kinetic title
  assembly ("FOR MA'AM"), magnetic portal entry.
- **PersonalityScene** — a fake diagnostic system measuring "strictness"
  and "coolness," both of which break the scale.
- **MemoryWorld** — floating objects (notebook, chalk, ID card, certificate,
  calendar, graduation cap) you tap to reveal short lines of story.
- **GraduationJourney** — a scroll-scrubbed transformation: classroom →
  portal of light → a different campus. A single point of light survives
  the whole transition, on purpose.
- **NoGiftsScene** — the joke. An actual interactive gift gets rejected by
  a "no gifts" protocol, then dissolves into the punchline.
- **FinaleScene** — everything slows down, the message lands, and a
  handwritten signature closes the piece. Has a tiny hidden easter egg
  (tap the signature a few times).

## Design system

Tokens live in `src/styles/global.css` (`:root` custom properties) —
palette, type, spacing, and motion durations/eases are all centralized
there so every scene shares the same visual DNA even though the "worlds"
differ. Shared GSAP/ScrollTrigger helpers and text-splitting utilities are
in `src/utils/animation.js`.

## Principles honored

- No audio, anywhere.
- `prefers-reduced-motion` is respected globally and per-component.
- Custom cursor and pointer-driven parallax are disabled on touch devices;
  every interaction has a touch-appropriate equivalent (tap instead of
  hover, etc).
- Nothing essential is gated behind a non-obvious interaction — the scroll
  itself always moves the story forward.

## Running locally

```bash
npm install
npm run dev
```

## Deploying

This is a static Vite + React app — no server code, no environment
variables required.

1. Push this folder to a GitHub repository.
2. Import the repo in Vercel.
3. Framework preset: **Vite**. Build command `npm run build`, output
   directory `dist` (Vercel detects both automatically).
4. Deploy.

No further configuration is needed.
