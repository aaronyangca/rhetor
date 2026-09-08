/**
 * One motion in the sidebar list (SPEC.md 3.2): a single line — title left
 * (ellipsised), stage meta right. Selected row is a plain tint only: no border,
 * no left accent bar.
 */
export function SidebarMotionItem({
  title,
  stage,
  active,
  onClick,
}: {
  title: string
  stage: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`flex w-full items-center gap-[10px] px-[10px] py-[7px] text-left transition-colors ${
        active ? 'bg-selected-row' : 'hover:bg-accent-100/60'
      }`}
    >
      <span className="min-w-0 flex-1 truncate text-[13.5px] leading-[1.35]">{title}</span>
      <span className="flex-none text-[12px] whitespace-nowrap text-ink-48">Stage {stage}</span>
    </button>
  )
}
