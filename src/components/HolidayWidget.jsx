import { useEffect, useState } from 'react'
import { getFunHoliday } from '../data/funHolidays'

const COUNTRY = import.meta.env.VITE_HOLIDAY_COUNTRY || 'IE'

// Words that make a Wikipedia "on this day" entry read like a genuine fun
// day worth celebrating.
const FUN_PATTERN = /international|national|world/i
// Words that make it read like a solemn religious/liturgical observance —
// technically accurate, but not exactly a reason to celebrate.
const SOLEMN_PATTERN = /feast|diocese|beatif|canoniz|martyr|liturg|commemorat|saint|bishop/i

// Nager.Date is a free, no-API-key public holiday API:
// https://date.nager.at  ·  docs: https://date.nager.at/swagger/index.html
async function fetchTodaysPublicHoliday() {
  const year = new Date().getFullYear()
  const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${COUNTRY}`)
  if (!res.ok) throw new Error('holiday api unavailable')
  const holidays = await res.json()
  const today = new Date().toISOString().slice(0, 10)
  return holidays.find((h) => h.date === today) || null
}

// Wikipedia's free, no-key REST API has a "holidays and observances" list for
// almost every day of the year. We fetch the whole list and filter it down
// to the ones that actually read as fun, rather than always taking whatever
// happens to be first (which tends to be a religious feast day).
// Docs: https://en.wikipedia.org/api/rest_v1/#/Feed/get_feed_onthisday_holidays_mm_dd
async function fetchWikipediaFunPool() {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/holidays/${mm}/${dd}`)
  if (!res.ok) throw new Error('wikipedia onthisday unavailable')
  const data = await res.json()
  const all = (data?.holidays || []).map((h) => h.text).filter(Boolean)

  const fun = all.filter((t) => FUN_PATTERN.test(t) && !SOLEMN_PATTERN.test(t))
  return fun.length > 0 ? fun : all // fall back to the unfiltered list rather than nothing
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export default function HolidayWidget() {
  const [label, setLabel] = useState('Checking the calendar…')
  const [pool, setPool] = useState(null) // Wikipedia candidates, if that's the active source

  useEffect(() => {
    let cancelled = false

    async function run() {
      // 1) A real, official public holiday wins outright.
      try {
        const official = await fetchTodaysPublicHoliday()
        if (cancelled) return
        if (official) {
          setLabel(`🎉 Today is ${official.localName} (${COUNTRY})`)
          return
        }
      } catch {
        // fall through
      }

      // 2) Our own curated "actually fun" day for this date, if we have one.
      const curated = getFunHoliday()
      if (curated) {
        setLabel(`🍻 ${curated}`)
        return
      }

      // 3) Wikipedia, filtered toward fun-sounding entries, picked at random.
      try {
        const candidates = await fetchWikipediaFunPool()
        if (cancelled) return
        if (candidates.length > 0) {
          setPool(candidates)
          setLabel(`📅 ${pickRandom(candidates)}`)
          return
        }
      } catch {
        // fall through
      }

      if (cancelled) return
      setLabel('No official holiday today — good, more reason to just enjoy the beer.')
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  function reroll() {
    if (pool && pool.length > 1) setLabel(`📅 ${pickRandom(pool)}`)
  }

  return (
    <p className="holiday-strip" title="Sources: date.nager.at (public holidays) & Wikipedia on-this-day">
      {label}
      {pool && pool.length > 1 && (
        <button className="holiday-reroll" onClick={reroll} title="Show another">
          🎲
        </button>
      )}
    </p>
  )
}
