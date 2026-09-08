import { useCallback, useEffect, useRef, useState } from 'react'

const KEY = 'rhetor.split'
const MIN = 0.25
const MAX = 0.7
const STEP = 0.02

function clamp(f: number) {
  return Math.min(MAX, Math.max(MIN, f))
}

function readInitial(fallback: number): number {
  try {
    const v = Number(localStorage.getItem(KEY))
    if (Number.isFinite(v) && v >= MIN && v <= MAX) return v
  } catch {
    // no-op
  }
  return fallback
}

function persist(f: number) {
  try {
    localStorage.setItem(KEY, f.toFixed(4))
  } catch {
    // no-op
  }
}

/**
 * Drag-to-resize for the chat / document split (SPEC.md 3.4). Returns the
 * current fraction (0.25–0.70) for the first column, a `dragging` flag for the
 * handle tint, a ref for the container the fraction is measured against, and
 * pointer/keyboard handlers for the divider.
 */
export function useResizableSplit(fallback = 0.44) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [split, setSplit] = useState(() => readInitial(fallback))
  const [dragging, setDragging] = useState(false)
  const teardownRef = useRef<(() => void) | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()

    const move = (ev: PointerEvent) => {
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setSplit(clamp((ev.clientX - r.left) / r.width))
    }
    const up = () => {
      teardownRef.current?.()
    }

    teardownRef.current = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.cursor = ''
      teardownRef.current = null
      setDragging(false)
      setSplit((f) => {
        persist(f)
        return f
      })
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    document.body.style.cursor = 'col-resize'
    setDragging(true)
  }, [])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    setSplit((f) => {
      const next = clamp(f + (e.key === 'ArrowRight' ? STEP : -STEP))
      persist(next)
      return next
    })
  }, [])

  // Release any live drag listeners if the component unmounts mid-drag.
  useEffect(() => () => teardownRef.current?.(), [])

  return { split, dragging, containerRef, onPointerDown, onKeyDown }
}
