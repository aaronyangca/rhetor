import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUp,
  Clipboard,
  Download,
  FileText,
  Pencil,
  Plus,
  Settings,
} from 'lucide-react'
import { useApp } from '../state/AppContext'
import { LogoMark } from '../components/Logo'
import { SidebarMotionItem } from '../components/SidebarMotionItem'
import { GhostIconButton, Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { Stepper } from '../components/Stepper'
import { ChatBubble } from '../components/ChatBubble'
import { DocumentView } from '../components/DocumentView'

const positionLabels: Record<string, string> = {
  OG: 'Opening Government',
  OO: 'Opening Opposition',
  CG: 'Closing Government',
  CO: 'Closing Opposition',
}

function Sidebar() {
  const { motions, activeMotionId, setActiveMotionId, createMotion, user } = useApp()
  return (
    <div className="flex h-full w-[272px] shrink-0 flex-col gap-5 border-r border-border bg-sidebar-bg p-4">
      <div className="flex flex-col gap-[2px]">
        <div className="text-xl font-bold tracking-tight text-foreground">Rhetor</div>
        <div className="text-xs text-muted-foreground">BP Argument Studio</div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <button
          onClick={() => createMotion()}
          className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-border bg-card px-[18px] py-[10px] text-sm font-semibold text-foreground hover:bg-background"
        >
          <Plus size={16} /> New Motion
        </button>
        <div className="text-[11px] font-semibold tracking-[0.4px] text-muted-foreground">MOTIONS</div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {motions.map((m) => (
            <SidebarMotionItem
              key={m.id}
              title={m.title}
              stage={m.currentStage}
              active={m.id === activeMotionId}
              onClick={() => setActiveMotionId(m.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-[10px]">
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-secondary text-[13px] font-semibold text-primary">
            {user?.email.charAt(0).toUpperCase()}
          </div>
          <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
        </div>
        <Link to="/app/settings">
          <GhostIconButton>
            <Settings size={18} />
          </GhostIconButton>
        </Link>
      </div>
    </div>
  )
}

function TopBar({ motionId }: { motionId: string }) {
  const { activeMotion, advanceStage, renameMotion } = useApp()
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(activeMotion?.title ?? '')
  if (!activeMotion) return null

  function commitTitle() {
    if (draftTitle.trim()) renameMotion(motionId, draftTitle.trim())
    setEditing(false)
  }

  return (
    <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-card px-7">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-[6px]">
          {editing ? (
            <input
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
              className="border-b border-border bg-transparent text-base font-semibold text-foreground focus:outline-none"
            />
          ) : (
            <span className="text-base font-semibold text-foreground">{activeMotion.title}</span>
          )}
          <button
            onClick={() => {
              setDraftTitle(activeMotion.title)
              setEditing(true)
            }}
            className="text-muted-foreground"
          >
            <Pencil size={14} />
          </button>
        </div>
        <Badge tone="accent">{positionLabels[activeMotion.position]}</Badge>
      </div>

      <Stepper currentStage={activeMotion.currentStage} />

      {activeMotion.currentStage < 3 ? (
        <Button onClick={() => advanceStage(motionId)} disabled={!activeMotion.stageDocs[activeMotion.currentStage]}>
          Move to Stage {activeMotion.currentStage + 1} <ArrowRight size={16} />
        </Button>
      ) : (
        <div className="w-[190px]" />
      )}
    </div>
  )
}

function ChatColumn({ motionId }: { motionId: string }) {
  const { activeMotion, sendMessage } = useApp()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMotion?.messages.length])

  if (!activeMotion) return null

  function handleSend() {
    if (!draft.trim()) return
    sendMessage(motionId, draft.trim())
    setDraft('')
  }

  return (
    <div className="flex h-full flex-1 flex-col border-r border-border">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-7 pb-4">
        {activeMotion.messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} content={m.content} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex flex-col gap-0 p-5 pt-0">
        <div className="flex items-center gap-[10px] rounded-[10px] border border-border bg-card p-[12px_14px]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message Rhetor about this stage..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground disabled:opacity-40"
            disabled={!draft.trim()}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ExportBar({ markdown, title }: { markdown: string; title: string }) {
  const [copied, setCopied] = useState(false)

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-shortlist.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-2 border-t border-border bg-card px-7 py-3">
      <span className="mr-1 text-xs font-semibold text-muted-foreground">EXPORT</span>
      <button
        onClick={downloadMarkdown}
        className="flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-[6px] text-xs font-semibold text-foreground hover:bg-background"
      >
        <FileText size={13} /> Markdown
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-[6px] text-xs font-semibold text-foreground hover:bg-background"
      >
        <Download size={13} /> PDF
      </button>
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-[6px] text-xs font-semibold text-foreground hover:bg-background"
      >
        <Clipboard size={13} /> {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

function DocumentColumn() {
  const { activeMotion } = useApp()
  if (!activeMotion) return null
  const doc = activeMotion.stageDocs[activeMotion.currentStage]

  return (
    <div className="flex h-full flex-1 flex-col bg-document-bg">
      <div className="flex-1 overflow-y-auto p-8">
        {doc ? (
          <DocumentView markdown={doc} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Send a message to generate this stage's document.
          </div>
        )}
      </div>
      {activeMotion.currentStage === 3 && doc && (
        <ExportBar markdown={doc} title={activeMotion.title} />
      )}
    </div>
  )
}

export function Workspace() {
  const { activeMotion, activeMotionId } = useApp()

  if (!activeMotion || !activeMotionId) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <LogoMark size={56} />
          <p className="text-sm text-muted-foreground">Select or create a motion to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex h-full flex-1 flex-col bg-background">
        <TopBar motionId={activeMotionId} />
        <div className="flex flex-1 overflow-hidden">
          <ChatColumn motionId={activeMotionId} />
          <DocumentColumn />
        </div>
      </div>
    </div>
  )
}
