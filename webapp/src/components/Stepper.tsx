import { Check } from 'lucide-react'

const stages = [1, 2, 3] as const
const stageNames: Record<number, string> = { 1: 'Stage 1', 2: 'Stage 2', 3: 'Stage 3' }

export function Stepper({ currentStage }: { currentStage: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2">
      {stages.map((stage, i) => {
        const done = stage < currentStage
        const active = stage === currentStage
        return (
          <div key={stage} className="flex items-center gap-2">
            <div className="flex items-center gap-[6px]">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? 'bg-success text-white'
                    : active
                      ? 'bg-primary text-white'
                      : 'border border-border bg-card text-muted-foreground'
                }`}
              >
                {done ? <Check size={13} /> : stage}
              </div>
              <span className={`text-[13px] ${active ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {stageNames[stage]}
              </span>
            </div>
            {i < stages.length - 1 && <div className="h-px w-5 bg-border" />}
          </div>
        )
      })}
    </div>
  )
}
