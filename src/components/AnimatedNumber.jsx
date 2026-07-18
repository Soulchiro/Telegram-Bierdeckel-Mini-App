import { useEffect, useRef, useState } from 'react'

// Eases the displayed number toward `value`. Tracks the actual on-screen
// value in a ref every frame (not just at completion) so rapid successive
// changes — fast tapping — smoothly redirect from wherever the animation
// currently is, instead of restarting from a stale point and lagging
// further behind with every tap.
export default function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value)
  const displayRef = useRef(value)

  useEffect(() => {
    const from = displayRef.current
    const to = value
    if (from === to) return

    const delta = Math.abs(to - from)
    // Short and capped — this should never be slower than just tapping.
    const duration = Math.min(350, Math.max(90, 70 + delta * 6))
    const start = performance.now()
    let raf

    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      const next = Math.round(from + (to - from) * eased)
      displayRef.current = next
      setDisplay(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return display
}
