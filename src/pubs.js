// Minimal localStorage helper for the optional "which pub am I at" tag.
// Just a single current value — no remembered list, so there's nothing to
// manage or clean up. Type a name once, it sticks until you clear it or
// type a different one.

const CURRENT_KEY = 'bierdeckel:currentPub'

export function getCurrentPub() {
  try {
    return localStorage.getItem(CURRENT_KEY) || null
  } catch {
    return null
  }
}

export function setCurrentPub(name) {
  try {
    if (name) {
      localStorage.setItem(CURRENT_KEY, name)
    } else {
      localStorage.removeItem(CURRENT_KEY)
    }
  } catch {
    // localStorage can be unavailable in some privacy modes — fail quietly
  }
}
