const TOASTS = [
  'Sláinte! 🍀',
  "May the road rise up to meet you (and the tab stay low).",
  "Here's to a long life and a merry one!",
  'One more for the road? The road says yes.',
  "May your glass be ever full, your roof ever tight.",
  'Cheers, big ears! 🍺'
]

export function randomToast() {
  return TOASTS[Math.floor(Math.random() * TOASTS.length)]
}

export default function CheersToast({ message, visible }) {
  return (
    <div className={`cheers-toast ${visible ? 'is-visible' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
