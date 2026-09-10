import type { Stage } from '../lib/types'

const STAGES: Stage[] = [1, 2, 3]

/**
 * The header stage control — a segmented control, per the standard pattern:
 * the current stage is a filled pill (the dominant element, "you are here",
 * not itself clickable); any generated stage is plain text that tints on hover
 * to show it can be jumped to; an ungenerated stage is faint and inert. The
 * numbers share a track so it reads as one control. Every cell is the same
 * fixed size so state changes never shift the layout.
 *
 * Pass `onSelect` and `isAvailable` to enable navigation.
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
  const cell =
    'inline-flex h-[20px] w-[24px] items-center justify-center rounded-[3px] text-[13px] transition-colors [font-feature-settings:"tnum"_1]'

  return (
    <div
      className="flex shrink-0 items-center gap-[6px] whitespace-nowrap"
      role="status"
      aria-label={`Stage ${currentStage} of 3`}
    >
      <span className="text-[13px] text-ink-58">Stage</span>
      <div className="flex items-center gap-[2px] rounded-md border border-divider p-[2px]">
        {STAGES.map((stage) => {
          if (stage === currentStage) {
            return (
              <span
                key={stage}
                aria-current="step"
                className={`${cell} bg-accent-200 font-semibold text-accent-900`}
              >
                {stage}
              </span>
            )
          }
          const reachable = Boolean(onSelect) && (isAvailable?.(stage) ?? false)
          if (reachable) {
            return (
              <button
                key={stage}
                type="button"
                onClick={() => onSelect?.(stage)}
                title={`Go to Stage ${stage}`}
                className={`${cell} cursor-pointer text-ink-72 hover:bg-accent-100 hover:text-accent-800`}
              >
                {stage}
              </button>
            )
          }
          return (
            <span key={stage} className={`${cell} text-ink-40`}>
              {stage}
            </span>
          )
        })}
      </div>
    </div>
  )
}
