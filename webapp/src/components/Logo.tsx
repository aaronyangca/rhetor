/**
 * Rhetor identity — a plain text wordmark, no glyph. Weight 400 (SPEC.md 0.5:
 * no display/novelty face, no "Studio"). The landing sets it in Cormorant
 * Garamond; the workspace sets it in Lora, same size as the motion title.
 */
export function Wordmark({
  className = 'text-[21px]',
  face = 'heading',
  tone = 'ink',
}: {
  className?: string
  face?: 'heading' | 'body'
  tone?: 'ink' | 'cream'
}) {
  return (
    <span
      className={`${face === 'body' ? 'font-body' : 'font-heading'} font-normal tracking-[0.01em] ${
        tone === 'cream' ? 'text-[#fdf6ea]' : 'text-foreground'
      } ${className}`}
    >
      Rhetor
    </span>
  )
}
