import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import { initTelegram, getTelegramUser, hapticSuccess, hapticTap, confirmAction } from './telegram'
import BeerButton from './components/BeerButton'
import CheersToast from './components/CheersToast'
import { randomToast } from './components/CheersToast'
import HolidayWidget from './components/HolidayWidget'
import PubTag from './components/PubTag'
import AnimatedNumber from './components/AnimatedNumber'
import { shareStats } from './share'
import { getCurrentPub, setCurrentPub as persistCurrentPub } from './pubs'
import { getBeerGrade } from './data/beerGrades'
import { getPubMilestone } from './data/pubMilestones'

const BEER_TYPES = ['Lager', 'Ale', 'Dark', 'IPA']

// Off by default — this feature went through a few redesigns and still
// wasn't landing well, so it ships disabled. Flip VITE_ENABLE_PUBS=true in
// .env if you want to bring it back or try a different take on it later.
const PUBS_ENABLED = import.meta.env.VITE_ENABLE_PUBS === 'true'

function startOfYearISO() {
  const d = new Date()
  return new Date(d.getFullYear(), 0, 1).toISOString()
}

export default function App() {
  const [user] = useState(() => getTelegramUser())
  const [counts, setCounts] = useState({ Lager: 0, Ale: 0, Dark: 0, IPA: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', visible: false })
  const [errorMsg, setErrorMsg] = useState('')
  const [pubsThisYear, setPubsThisYear] = useState(new Set())
  const [currentPub, setCurrentPubState] = useState(() => (PUBS_ENABLED ? getCurrentPub() : null))

  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts])
  const year = new Date().getFullYear()
  const grade = getBeerGrade(total)
  const pubMilestone = PUBS_ENABLED ? getPubMilestone(pubsThisYear.size) : null

  useEffect(() => {
    initTelegram()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadCounts() {
      setLoading(true)
      setErrorMsg('')
      const { data, error } = await supabase
        .from('beer_log')
        .select('beer_type, pub_name')
        .eq('user_id', user.id)
        .gte('created_at', startOfYearISO())

      if (cancelled) return
      if (error) {
        console.error('[bierdeckel] failed to load beer_log', error)
        setErrorMsg('Couldn\u2019t load your tally right now \u2014 try again in a bit.')
        setLoading(false)
        return
      }
      const next = { Lager: 0, Ale: 0, Dark: 0, IPA: 0 }
      const pubs = new Set()
      for (const row of data) {
        if (next[row.beer_type] !== undefined) next[row.beer_type] += 1
        if (row.pub_name) pubs.add(row.pub_name)
      }
      setCounts(next)
      setPubsThisYear(pubs)
      setLoading(false)
    }
    loadCounts()
    return () => {
      cancelled = true
    }
  }, [user.id])

  async function handleDrink(type) {
    hapticTap()

    const prevTotal = total
    const nextTotal = prevTotal + 1
    const prevGrade = getBeerGrade(prevTotal)
    const nextGrade = getBeerGrade(nextTotal)
    const gradeLeveledUp = nextGrade && nextGrade !== prevGrade

    const isNewPub = PUBS_ENABLED && currentPub && !pubsThisYear.has(currentPub)
    const prevPubMilestone = PUBS_ENABLED ? getPubMilestone(pubsThisYear.size) : null
    const nextPubMilestone = PUBS_ENABLED && isNewPub ? getPubMilestone(pubsThisYear.size + 1) : prevPubMilestone
    const pubLeveledUp = isNewPub && nextPubMilestone && nextPubMilestone !== prevPubMilestone

    // optimistic update — the pub doesn't wait for the network
    setCounts((c) => ({ ...c, [type]: c[type] + 1 }))

    let message = randomToast()
    if (gradeLeveledUp) message = `🏅 New rank: ${nextGrade.label}!`
    else if (pubLeveledUp) message = `🗺️ ${nextPubMilestone.label} unlocked!`

    setToast({ message, visible: true })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), gradeLeveledUp || pubLeveledUp ? 2600 : 1800)
    setSaving(true)

    const row = { user_id: user.id, beer_type: type }
    if (PUBS_ENABLED && currentPub) row.pub_name = currentPub

    const { error } = await supabase.from('beer_log').insert(row)

    setSaving(false)
    if (error) {
      // roll back on failure
      setCounts((c) => ({ ...c, [type]: Math.max(0, c[type] - 1) }))
      setErrorMsg('That round didn\u2019t save \u2014 try tapping it again?')
    } else {
      hapticSuccess()
      if (isNewPub) setPubsThisYear((s) => new Set(s).add(currentPub))
    }
  }

  function handleSelectPub(name) {
    persistCurrentPub(name)
    setCurrentPubState(name)
  }

  function handleClearPub() {
    persistCurrentPub(null)
    setCurrentPubState(null)
  }

  async function handleReset() {
    const ok = await confirmAction(
      `Reset all ${total} beer${total === 1 ? '' : 's'} logged in ${year}? This can't be undone.`
    )
    if (!ok) return

    setSaving(true)
    setErrorMsg('')
    const { data, error } = await supabase
      .from('beer_log')
      .delete()
      .eq('user_id', user.id)
      .gte('created_at', startOfYearISO())
      .select()
    setSaving(false)

    if (error) {
      console.error('[bierdeckel] failed to delete beer_log rows', error)
      setErrorMsg('That reset didn\u2019t go through \u2014 try again?')
    } else if (!data || data.length === 0) {
      // Supabase returns no error even when Row Level Security silently
      // blocks the delete (0 rows affected isn't treated as a failure), so
      // without this check it would have looked like a successful reset
      // while nothing was actually removed server-side. Logged, not shown
      // to the person tapping the button \u2014 this is a one-time setup thing
      // to check in Supabase (missing delete policy \u2014 see README), not
      // something they need to see mid-round.
      console.warn(
        '[bierdeckel] reset deleted 0 rows \u2014 check the delete policy on beer_log in Supabase (see README)'
      )
      setErrorMsg('That reset didn\u2019t go through \u2014 try again?')
    } else {
      setCounts({ Lager: 0, Ale: 0, Dark: 0, IPA: 0 })
      setPubsThisYear(new Set())
      hapticSuccess()
    }
  }

  async function handleShare() {
    hapticTap()
    try {
      const result = await shareStats({ name: user.name, year, total, counts })
      if (result.method === 'cancelled') return
      if (!result.linkConfigured) {
        setToast({ message: 'Set VITE_BOT_SHARE_URL to include your app link when sharing', visible: true })
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200)
      } else if (result.method === 'copied') {
        setToast({ message: '🔗 Copied \u2014 paste it into a chat!', visible: true })
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200)
      } else if (result.method === 'failed') {
        setErrorMsg('Could not share or copy \u2014 try again.')
      }
    } catch {
      setErrorMsg('Couldn\u2019t prepare your stats to share \u2014 try again.')
    }
  }

  return (
    <div className="pub-app">
      <header className="pub-header">
        <h1 className="pub-sign">🍀 Bierdeckel 🍀</h1>
        <p className="pub-sub">Hey {user.name}, what are we having?</p>
        {grade && <p className="grade-badge">🏅 {grade.label}</p>}
      </header>

      <section className="total-board" aria-label={`Total beers in ${year}`}>
        <span className="total-board__year">{year}</span>
        <span className="total-board__count">
          {loading ? <span className="loading-pulse">pouring…</span> : <AnimatedNumber value={total} />}
        </span>
        <span className="total-board__label">pints logged this year</span>
      </section>

      <section className="beer-section">
        {PUBS_ENABLED && pubMilestone && (
          <div className="beer-section__eyebrow">
            <span>🍺 rounds</span>
            <span className="pub-count-badge" title={`${pubsThisYear.size} unique pub(s) this year`}>
              🗺️ {pubMilestone.label}
            </span>
          </div>
        )}

        <div className="beer-grid">
          {BEER_TYPES.map((type) => (
            <BeerButton
              key={type}
              type={type}
              count={counts[type]}
              onDrink={handleDrink}
              disabled={loading || saving}
            />
          ))}
        </div>

        {PUBS_ENABLED && (
          <PubTag currentPub={currentPub} onSelect={handleSelectPub} onClear={handleClearPub} />
        )}
      </section>

      {errorMsg && <p className="error-strip">{errorMsg}</p>}

      <HolidayWidget />

      <CheersToast message={toast.message} visible={toast.visible} />

      <footer className="pub-footer">
        <button className="share-link" onClick={handleShare} disabled={loading || total === 0} title="Share your stats">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
            <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
          </svg>
        </button>
        <button
          className="reset-link"
          onClick={handleReset}
          disabled={loading || saving || total === 0}
          title={`Reset ${year}`}
          aria-label={`Reset ${year}'s tally`}
        >
          ↺
        </button>
        {/* Direct bank donation link (T-Bank) */}
        <a className="coffee-link" href="https://tbank.ru/cf/6WKVqFgxZsi" target="_blank" rel="noopener noreferrer">
          🍺 buy me a beer
        </a>
      </footer>
    </div>
  )
}
