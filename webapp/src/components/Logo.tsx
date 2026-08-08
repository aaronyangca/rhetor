export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  const glyphSize = size * 1.1727
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-primary ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.227 }}
    >
      <span
        className="absolute font-display font-black italic text-accent"
        style={{
          fontSize: glyphSize,
          left: size * 0.1568,
          top: -size * 0.0159,
          transform: 'rotate(6deg)',
          transformOrigin: 'top left',
          lineHeight: 1,
        }}
      >
        R
      </span>
      <span
        className="absolute font-display font-black italic text-[#F7F1E5]"
        style={{
          fontSize: glyphSize,
          left: size * 0.0477,
          top: -size * 0.1409,
          transform: 'rotate(6deg)',
          transformOrigin: 'top left',
          lineHeight: 1,
        }}
      >
        R
      </span>
    </div>
  )
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className="font-wordmark font-semibold text-[21px]"
      style={{ color: dark ? '#F7F1E5' : undefined, letterSpacing: '1px' }}
    >
      R<span style={{ letterSpacing: '2.2px' }}>HETOR</span>
    </span>
  )
}
