import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'accent'

const base =
  'inline-flex items-center justify-center gap-2 rounded-[6px] px-[18px] py-[10px] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  accent: 'bg-accent text-[#FFF8EF] hover:bg-accent/90',
  outline: 'bg-card text-foreground border border-border hover:bg-background',
  ghost: 'text-foreground hover:bg-black/5',
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
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-black/5 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
