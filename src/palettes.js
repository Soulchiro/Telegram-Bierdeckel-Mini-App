// A handful of named pub color schemes, applied by overriding the CSS
// custom properties defined in style.css. One is picked at random each time
// the app loads — "every time you walk in, it's a different pub."
// Add more by copying an entry and tweaking the values; every key here maps
// directly to a CSS variable of the same name in style.css.

export const PALETTES = [
  {
    name: 'stout', // the original, classic dark-brown Irish stout house
    vars: {
      stout: '#1b120c',
      wood: '#3e2723',
      'wood-light': '#5d4037',
      foam: '#f5e6c8',
      'foam-dim': '#e8d6ac',
      amber: '#d4a017',
      kelly: '#0b6e4f',
      copper: '#b5651d',
      'hop-green': '#7c9a3b'
    }
  },
  {
    name: 'emerald', // deep green wood paneling + brass, like an old-money Irish snug
    vars: {
      stout: '#071f18',
      wood: '#0e3a2a',
      'wood-light': '#155843',
      foam: '#f3e8c9',
      'foam-dim': '#e4d6a8',
      amber: '#c9a227',
      kelly: '#1f8a5f',
      copper: '#8a5a2b',
      'hop-green': '#6b8f3f'
    }
  },
  {
    name: 'mahogany', // English pub — burgundy and dark wood, brass fittings
    vars: {
      stout: '#1a0f0f',
      wood: '#3a1f1f',
      'wood-light': '#5c2f2f',
      foam: '#f0e2c8',
      'foam-dim': '#ddc9a0',
      amber: '#b5842a',
      kelly: '#7a2331',
      copper: '#8a4a2b',
      'hop-green': '#7a8f3f'
    }
  },
  {
    name: 'tavern', // candlelit medieval tavern — warm amber and dark timber
    vars: {
      stout: '#120c08',
      wood: '#2e2013',
      'wood-light': '#4a331d',
      foam: '#f2e6c9',
      'foam-dim': '#e0cd9e',
      amber: '#e0a83a',
      kelly: '#6b4423',
      copper: '#a0632c',
      'hop-green': '#8a7a3f'
    }
  }
]

export function applyRandomPalette() {
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)]
  const root = document.documentElement
  for (const [key, value] of Object.entries(palette.vars)) {
    root.style.setProperty(`--${key}`, value)
  }
  return palette.name
}
