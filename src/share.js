// Text + link sharing only. An earlier version tried to bundle a generated
// PNG together with caption text and a link in one message — that combo
// isn't reliably deliverable as a single message across share targets
// (including Telegram's own share dialog), so this sticks to plain text,
// which Telegram (and most share sheets) handle natively and well.

const BOT_SHARE_URL = import.meta.env.VITE_BOT_SHARE_URL || ''

// A few casual openers, picked at random, so sharing doesn't always read
// like the exact same stat line. Falls back to name-less phrasing if the
// Telegram user has no first name to work with.
const OPENERS_NAMED = [
  (t) => `🍻 Hey, it's ${t.name} — I've had ${t.total} beers this year!`,
  (t) => `${t.name} here: ${t.total} pints down in ${t.year} and counting...`,
  (t) => `${t.name} just hit ${t.total} beers in ${t.year} 🍻`,
  (t) => `${t.name}'s ${t.year} beer count: ${t.total} 🍺 (no regrets)`,
  (t) => `${t.name} is ${t.total} beers deep this year. Send help. Or a beer. 🍻`
]

const OPENERS_ANON = [
  (t) => `🍻 Hey, I've had ${t.total} beers this year!`,
  (t) => `🍺 ${t.total} pints down in ${t.year} and counting...`,
  (t) => `Just hit ${t.total} beers in ${t.year} 🍻`,
  (t) => `My ${t.year} beer count: ${t.total} 🍺 (no regrets)`,
  (t) => `${t.total} beers deep this year. Send help. Or a beer. 🍻`
]

function buildMessage({ name, year, total, counts }, { includeLinkInline }) {
  const breakdown = Object.entries(counts)
    .map(([type, count]) => `${type}: ${count}`)
    .join(' · ')
  const openers = name && name !== 'Guest' && name !== 'Friend' ? OPENERS_NAMED : OPENERS_ANON
  const opener = openers[Math.floor(Math.random() * openers.length)]({ name, total, year })

  let message = opener

  if (BOT_SHARE_URL) {
    message += `\n\n🎯 Start counting yours too:`
    if (includeLinkInline) message += ` ${BOT_SHARE_URL}`
  }

  return message
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false // clipboard access can be blocked in some webviews — fail quietly
  }
}

export async function shareStats(stats) {
  const linkConfigured = Boolean(BOT_SHARE_URL)
  const tg = window.Telegram?.WebApp
  const insideTelegram = Boolean(tg?.initData)

  // 1) Inside real Telegram: Telegram's own share dialog appends `url` to
  //    the end of `text` automatically to form one outgoing message, so we
  //    leave the link out of the text itself here to avoid it appearing
  //    twice — the CTA phrase leads straight into the link Telegram adds.
  if (insideTelegram && tg?.openTelegramLink && linkConfigured) {
    const text = buildMessage(stats, { includeLinkInline: false })
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(BOT_SHARE_URL)}&text=${encodeURIComponent(text)}`
    tg.openTelegramLink(shareUrl)
    return { method: 'telegram-share', linkConfigured }
  }

  // 2) Outside Telegram: native share sheet. No separate `url` field here —
  //    not every target attaches it to the message, so the link goes
  //    straight into the text to guarantee it's actually in the message.
  const text = buildMessage(stats, { includeLinkInline: true })
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Bierdeckel', text })
      return { method: 'shared', linkConfigured }
    } catch (err) {
      if (err?.name === 'AbortError') return { method: 'cancelled', linkConfigured }
      // fall through to clipboard on any other failure
    }
  }

  // 3) Last resort: copy the whole message, link included inline.
  const copied = await copyToClipboard(text)
  return { method: copied ? 'copied' : 'failed', linkConfigured }
}
