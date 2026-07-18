import { useState } from 'react'

// Deliberately just a text field, not a remembered chip list — nothing to
// manage or delete. Type a pub name once, it sticks (tags every beer you
// log) until you clear it or type a new one.
export default function PubTag({ currentPub, onSelect, onClear }) {
  const [draft, setDraft] = useState(currentPub || '')

  function commit() {
    const name = draft.trim()
    if (name) onSelect(name)
    else if (currentPub) onClear()
  }

  return (
    <div className="pub-tag">
      <span className="pub-tag__icon">📍</span>
      <input
        className="pub-tag__input"
        value={draft}
        placeholder="tag a pub (optional)"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      {currentPub && (
        <button
          className="pub-tag__clear"
          onClick={() => {
            setDraft('')
            onClear()
          }}
          title="Stop tagging beers with a pub"
        >
          ✕
        </button>
      )}
    </div>
  )
}
