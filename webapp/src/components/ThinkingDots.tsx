import { useEffect, useState, type ReactNode } from 'react'

/**
 * A status line whose trailing ellipsis cycles "." → ".." → "...". The dots
 * sit in a fixed-width box so the text never shifts as they change.
 */
export function ThinkingDots({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => (c % 3) + 1), 450)
    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      {children}
      <span aria-hidden="true" className="inline-block w-[1.2em] text-left">
        {'.'.repeat(count)}
      </span>
    </>
  )
}
