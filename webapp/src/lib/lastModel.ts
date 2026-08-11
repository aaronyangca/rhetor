import type { Provider } from './types'

/**
 * The provider and model last used to start a motion.
 *
 * A motion is pinned to one provider and model at creation, so without this
 * every new motion reverts to the catalogue default and has to be switched
 * back by hand. Kept in localStorage rather than on the account: it is a
 * per-device convenience, and it must not fail a motion if it is stale.
 */
const KEY = 'rhetor.lastModel'

export interface LastModel {
  provider: Provider
  model: string
}

export function readLastModel(): LastModel | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LastModel>
    if (typeof parsed?.provider !== 'string' || typeof parsed?.model !== 'string') return null
    return { provider: parsed.provider as Provider, model: parsed.model }
  } catch {
    return null
  }
}

export function writeLastModel(next: LastModel) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Private browsing, quota, or a disabled store. Losing the preference is
    // not worth failing the action the user actually asked for.
  }
}
