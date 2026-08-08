import { MessageSquare } from 'lucide-react'

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
      className={`flex w-full items-center gap-[10px] rounded-[6px] px-3 py-[10px] text-left transition-colors ${
        active ? 'bg-secondary' : 'hover:bg-black/5'
      }`}
    >
      <MessageSquare size={16} className={active ? 'text-primary' : 'text-muted-foreground'} />
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <div
          className={`truncate text-[13px] ${
            active ? 'font-semibold text-primary' : 'font-medium text-foreground'
          }`}
        >
          {title}
        </div>
        <div className={`text-[11px] ${active ? 'text-primary' : 'text-muted-foreground'}`}>
          Stage {stage}
        </div>
      </div>
    </button>
  )
}
