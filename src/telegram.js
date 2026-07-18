// Thin wrapper around window.Telegram.WebApp so the rest of the app
// doesn't need to worry about "am I actually running inside Telegram?"

function getTG() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : null
}

export function initTelegram() {
  const tg = getTG()
  if (!tg) return
  tg.ready()
  tg.expand()
  // Match Telegram's own header/background chrome to whichever palette got
  // picked for this session, rather than a hardcoded color.
  try {
    const stoutColor = getComputedStyle(document.documentElement).getPropertyValue('--stout').trim()
    tg.setHeaderColor?.(stoutColor || '#1b120c')
    tg.setBackgroundColor?.(stoutColor || '#1b120c')
  } catch {
    // older Telegram clients may not support these — safe to ignore
  }
}

export function getTelegramUser() {
  const tg = getTG()
  const user = tg?.initDataUnsafe?.user
  if (user) {
    return {
      id: String(user.id),
      name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Friend'
    }
  }
  // Fallback for testing in a normal browser outside Telegram
  return { id: 'local-dev-user', name: 'Guest' }
}

// Uses Telegram's native confirm popup when available, falls back to
// window.confirm when testing outside Telegram. We can't just check
// `tg?.showConfirm` — the Telegram script defines that method even in a
// plain browser, but outside the real Telegram app there's no native host
// to answer it, so its callback never fires and this would hang forever.
// `initData` is only populated by a genuine Telegram session, so we use
// that as the real "am I actually inside Telegram" signal.
export function confirmAction(message) {
  const tg = getTG()
  const insideTelegram = Boolean(tg?.initData)
  return new Promise((resolve) => {
    if (insideTelegram && tg?.showConfirm) {
      tg.showConfirm(message, (confirmed) => resolve(confirmed))
    } else {
      resolve(window.confirm(message))
    }
  })
}

export function hapticSuccess() {
  getTG()?.HapticFeedback?.notificationOccurred?.('success')
}

export function hapticTap() {
  getTG()?.HapticFeedback?.impactOccurred?.('light')
}
