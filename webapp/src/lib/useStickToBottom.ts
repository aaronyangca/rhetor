import { useCallback, useEffect, useRef } from 'react'

/**
 * Keep a scroll container pinned to its newest content.
 *
 * A streaming turn appends text many times a second, so following it has to be
 * conditional: scrolling on every update would drag the view away from someone
 * reading further up. Following stops the moment they scroll off the bottom
 * and resumes when they come back to it.
 *
 * Scrolling is instant rather than smooth — a smooth animation restarts on
 * each delta and never catches up with the text.
 *
 * @param deps  what to follow, in useEffect terms (message count, live text…)
 * @param enabled  false leaves the container alone, e.g. a stored document
 *   that should open at the top rather than the end.
 */
export function useStickToBottom<T extends HTMLElement>(deps: unknown[], enabled = true) {
  const ref = useRef<T>(null)
  const pinned = useRef(true)

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    // Slack for fractional layout heights: scrollTop rarely lands on the exact
    // bottom, so an equality check would read as "scrolled away".
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32
  }, [])

  useEffect(() => {
    const el = ref.current
    if (enabled && el && pinned.current) el.scrollTop = el.scrollHeight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  /** Follow again regardless of scroll position — the user just sent a message. */
  const stick = useCallback(() => {
    pinned.current = true
  }, [])

  return { ref, onScroll, stick }
}
