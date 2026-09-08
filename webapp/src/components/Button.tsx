import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Rule 1 of the design system: the primary action is an ACCENT OUTLINE on
 * transparent, tinted on hover, one ramp step deeper on press — never a solid
 * fill. `solid` is an escape hatch, against the grain, use sparingly.
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'link' | 'solid'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-[18px] py-[9px] text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-45 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary:
    'border border-accent-500 bg-transparent text-accent-800 hover:bg-accent-100 active:bg-accent-200 active:border-accent-600',
  secondary:
    'border border-border bg-transparent text-foreground hover:bg-accent-100/60 active:bg-accent-200/70',
  ghost: 'bg-transparent text-accent-800 hover:bg-accent-100 active:bg-accent-200',
  link: 'px-0 py-0 text-accent-700 underline-offset-4 hover:text-accent-800 hover:underline',
  solid: 'bg-accent-700 text-[#fffaf3] hover:bg-accent-800',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function GhostIconButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent-100 hover:text-accent-800 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
