import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const KEY = 'rhetor.theme'

function read(): Theme {
  const stored = localStorage.getItem(KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

/**
 * Apply a theme by stamping `data-theme` on <html>.
 *
 * "system" removes the attribute rather than resolving it here, so the CSS
 * media query stays in charge and the page follows the OS if it changes while
 * the app is open.
 */
function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

/** Run before React mounts, so the first paint is already the right theme. */
export function initTheme() {
  apply(read())
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read)

  useEffect(() => {
    apply(theme)
    if (theme === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, theme)
  }, [theme])

  return { theme, setTheme }
}
