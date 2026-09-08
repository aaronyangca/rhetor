import type { Stage } from '../lib/types'

const STAGES: Stage[] = [1, 2, 3]

/**
 * The header stage readout — a status indicator, not a tab bar: no pill, no
 * underline (an underline made testers read it as interactive). Active step is
 * accent, completed is 72% ink, upcoming is 40% ink; figures set tabular.
 *
 * The design specifies it as non-interactive. We keep already-reached stages
 * quietly clickable (pointer cursor only, no visual tab affordance) so the
 * existing back-to-an-earlier-stage behaviour is not lost — pass `onSelect`
 * and `isAvailable` to enable it.
 */
export function StageIndicator({
  currentStage,
  onSelect,
  isAvailable,
}: {
  currentStage: Stage
  onSelect?: (stage: Stage) => void
  isAvailable?: (stage: Stage) => boolean
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-2 text-[13.5px] whitespace-nowrap [font-feature-settings:'tnum'_1]"
      role="status"
      aria-label={`Stage ${currentStage} of 3`}
    >
      {STAGES.map((stage) => {
        const active = stage === currentStage
        const done = stage < currentStage
        const label = stage === 1 ? 'Stage 1' : String(stage)
        const tone = active
          ? 'text-accent-800 font-semibold'
          : done
            ? 'text-ink-72'
            : 'text-ink-40'
        const reachable = Boolean(onSelect) && !active && (isAvailable?.(stage) ?? false)

        return reachable ? (
          <button
            key={stage}
            type="button"
            onClick={() => onSelect?.(stage)}
            title={`Go back to Stage ${stage}`}
            className={`cursor-pointer bg-transparent p-0 transition-colors hover:text-accent-700 ${tone}`}
          >
            {label}
          </button>
        ) : (
          <span key={stage} className={tone}>
            {label}
          </span>
        )
      })}
    </div>
  )
}
