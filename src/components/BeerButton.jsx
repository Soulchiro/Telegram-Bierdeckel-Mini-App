import { useState } from 'react'

const GLYPHS = {
  Lager: '🍺',
  Ale: '🍻',
  Dark: '🍯', // stand-in glass tone below via CSS class; emoji kept simple/cross-platform
  IPA: '🌿'
}

export default function BeerButton({ type, count, onDrink, disabled }) {
  const [pulse, setPulse] = useState(false)

  function handleClick() {
    if (disabled) return
    onDrink(type)
    setPulse(false)
    // restart animation even on rapid re-clicks
    requestAnimationFrame(() => setPulse(true))
  }

  return (
    <button
      className={`beer-tile beer-tile--${type.toLowerCase()} ${pulse ? 'is-pulsing' : ''}`}
      onClick={handleClick}
      onAnimationEnd={() => setPulse(false)}
      disabled={disabled}
      aria-label={`Log one ${type}`}
    >
      <span className="beer-tile__glyph">{GLYPHS[type]}</span>
      <span className="beer-tile__label">{type}</span>
      <span className="beer-tile__count">{count}</span>
      {pulse && <span className="beer-tile__burst">+1 🎉</span>}
    </button>
  )
}
