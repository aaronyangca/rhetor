type Tone = 'accent' | 'success' | 'secondary'

const tones: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  secondary: 'bg-secondary text-secondary-foreground',
}

export function Badge({ tone = 'accent', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[10px] py-[4px] text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
