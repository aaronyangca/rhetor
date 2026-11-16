/** Whether the first-run guide has been seen, kept per user in localStorage. */

const SEEN_KEY = 'rhetor.guideSeen'

/** Per user, so a second account on the same browser still gets the guide. */
function seenKey(userId: string) {
  return `${SEEN_KEY}.${userId}`
}

export function hasSeenGuide(userId: string) {
  try {
    return localStorage.getItem(seenKey(userId)) === '1'
  } catch {
    return true // Storage blocked — don't nag on every load.
  }
}

export function markGuideSeen(userId: string) {
  try {
    localStorage.setItem(seenKey(userId), '1')
  } catch {
    // Storage blocked — the guide just shows again next time.
  }
}
