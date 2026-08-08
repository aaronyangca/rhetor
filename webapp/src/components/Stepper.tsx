import { Check } from 'lucide-react'
import type { Stage } from '../lib/types'

const stages: Stage[] = [1, 2, 3]
const stageNames: Record<number, string> = { 1: 'Stage 1', 2: 'Stage 2', 3: 'Stage 3' }

export function Stepper({
  currentStage,
  onSelect,
  isAvailable,
}: {
  currentStage: Stage
  /** Omit to render a read-only stepper. */
  onSelect?: (stage: Stage) => void
  /** A stage is reachable once it has a document; advancing is what creates one. */
  isAvailable?: (stage: Stage) => boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {stages.map((stage, i) => {
        const done = stage < currentStage
        const active = stage === currentStage
        const reachable = Boolean(onSelect) && !active && (isAvailable?.(stage) ?? false)

        const content = (
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
            <span
              className={`text-[13px] ${
                active ? 'font-semibold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {stageNames[stage]}
            </span>
          </div>
        )

        return (
          <div key={stage} className="flex items-center gap-2">
            {reachable ? (
              <button
                type="button"
                onClick={() => onSelect?.(stage)}
                title={`Go back to ${stageNames[stage]}`}
                className="rounded-[6px] px-1 py-0.5 transition-colors hover:bg-black/5"
              >
                {content}
              </button>
            ) : (
              <div className="px-1 py-0.5">{content}</div>
            )}
            {i < stages.length - 1 && <div className="h-px w-5 bg-border" />}
          </div>
        )
      })}
    </div>
  )
}
