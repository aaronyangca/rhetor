import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileText,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import { useApp } from '../state/AppContext'
import { api } from '../lib/api'
import { LogoMark } from '../components/Logo'
import { SidebarMotionItem } from '../components/SidebarMotionItem'
import { GhostIconButton, Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { Stepper } from '../components/Stepper'
import { ChatBubble } from '../components/ChatBubble'
import { DocumentView } from '../components/DocumentView'
import {
  POSITION_LABELS,
  PROVIDER_LABELS,
  type ModelOption,
  type Motion,
  type Provider,
} from '../lib/types'

function ErrorBanner() {
  const { error, clearError } = useApp()
  if (!error) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2 border-b border-destructive/30 bg-destructive/5 px-7 py-3"
    >
      <AlertCircle size={15} className="mt-[1px] shrink-0 text-destructive" />
      <p className="flex-1 text-[13px] text-destructive">{error}</p>
      <button onClick={clearError} className="shrink-0 text-destructive" aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  )
}

/** One model row, shared by the create menu and the in-motion switcher. */
function ModelOptionRow({
  model,
  selected,
  onClick,
}: {
  model: ModelOption
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-[1px] rounded-[4px] px-2 py-[7px] text-left hover:bg-secondary ${
        selected ? 'bg-secondary' : ''
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] font-medium text-foreground">{model.label}</span>
        {selected && <Check size={12} className="text-primary" />}
        {/* Worth surfacing: picking one of these with a free key just fails. */}
        {!model.freeTier && (
          <span className="rounded-[3px] bg-accent-soft px-1 py-[1px] text-[10px] font-semibold text-accent">
            PAID KEY
          </span>
        )}
      </div>
      <span className="text-[11.5px] leading-4 text-muted-foreground">{model.blurb}</span>
    </button>
  )
}

function NewMotionButton() {
  const { connectedProviders, createMotion, catalogue } = useApp()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // A motion is pinned to one provider and one model. The backend rejects a
  // provider the user has no key for, so the choice has to happen up front.
  async function create(provider: Provider, model: string) {
    setOpen(false)
    setCreating(true)
    try {
      await createMotion(provider, model)
    } catch {
      // Surfaced by the shared error banner.
    } finally {
      setCreating(false)
    }
  }

  if (connectedProviders.length === 0) {
    return (
      <Link
        to="/app/settings"
        className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-dashed border-border px-[18px] py-[10px] text-sm font-semibold text-muted-foreground hover:bg-background"
      >
        <Plus size={16} /> Add an API key first
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={creating || !catalogue}
        className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-border bg-card px-[18px] py-[10px] text-sm font-semibold text-foreground hover:bg-background disabled:opacity-50"
      >
        <Plus size={16} /> {creating ? 'Creating…' : 'New Motion'}
      </button>

      {open && catalogue && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 flex max-h-[420px] flex-col overflow-y-auto rounded-[6px] border border-border bg-card p-1 shadow-lg">
            {connectedProviders.map((provider) => (
              <div key={provider} className="flex flex-col">
                <div className="px-2 pb-1 pt-2 text-[11px] font-semibold tracking-[0.4px] text-muted-foreground">
                  {PROVIDER_LABELS[provider].toUpperCase()}
                </div>
                {catalogue[provider].models.map((model) => (
                  <ModelOptionRow
                    key={model.id}
                    model={model}
                    selected={model.id === catalogue[provider].default}
                    onClick={() => create(provider, model.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Switches the model an open motion generates with. */
function ModelSwitcher({ motion }: { motion: Motion }) {
  const { catalogue, setModel } = useApp()
  const [open, setOpen] = useState(false)
  if (!catalogue) return null

  const options = catalogue[motion.provider].models

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={`${PROVIDER_LABELS[motion.provider]} · ${motion.modelLabel}`}
        className="flex items-center gap-1 rounded-[6px] border border-border px-2 py-[5px] text-[12px] font-medium text-muted-foreground hover:bg-background"
      >
        {motion.modelLabel}
        <ChevronDown size={13} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 flex w-[280px] flex-col rounded-[6px] border border-border bg-card p-1 shadow-lg">
            <div className="px-2 pb-1 pt-2 text-[11px] font-semibold tracking-[0.4px] text-muted-foreground">
              {PROVIDER_LABELS[motion.provider].toUpperCase()}
            </div>
            {options.map((model) => (
              <ModelOptionRow
                key={model.id}
                model={model}
                selected={model.id === motion.model}
                onClick={() => {
                  setOpen(false)
                  setModel(model.id)
                }}
              />
            ))}
            <p className="px-2 pb-1 pt-2 text-[11px] leading-4 text-muted-foreground">
              The provider is fixed for this motion. Switching model affects the
              next generation only.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function Sidebar() {
  const { motions, activeMotionId, selectMotion, deleteMotion, user } = useApp()

  return (
    <div className="flex h-full w-[272px] shrink-0 flex-col gap-5 border-r border-border bg-sidebar-bg p-4">
      <div className="flex flex-col gap-[2px]">
        <div className="text-xl font-bold tracking-tight text-foreground">Rhetor</div>
        <div className="text-xs text-muted-foreground">BP Argument Studio</div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <NewMotionButton />
        <div className="text-[11px] font-semibold tracking-[0.4px] text-muted-foreground">
          MOTIONS
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {motions.length === 0 && (
            <p className="px-3 py-2 text-[12.5px] leading-5 text-muted-foreground">
              No motions yet. Start one and Rhetor will ask for the motion and your position.
            </p>
          )}
          {motions.map((m) => (
            <div key={m.id} className="group relative">
              <SidebarMotionItem
                title={m.title}
                stage={m.currentStage}
                active={m.id === activeMotionId}
                onClick={() => selectMotion(m.id)}
              />
              <button
                onClick={() => {
                  if (confirm(`Delete "${m.title}"? This cannot be undone.`)) deleteMotion(m.id)
                }}
                aria-label={`Delete ${m.title}`}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-muted-foreground hover:text-destructive group-hover:block"
              >
                <Trash2 size={14} />
              </button>
            </div>
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

function TopBar({ motion }: { motion: Motion }) {
  const { advanceStage, renameMotion, goToStage, advancing } = useApp()
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(motion.title)

  function commitTitle() {
    const next = draftTitle.trim()
    if (next && next !== motion.title) renameMotion(motion.id, next)
    setEditing(false)
  }

  const currentDoc = motion.stageDocs[String(motion.currentStage) as '1' | '2' | '3']

  return (
    <div className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-7">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex min-w-0 items-center gap-[6px]">
          {editing ? (
            <input
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="border-b border-border bg-transparent text-base font-semibold text-foreground focus:outline-none"
            />
          ) : (
            <span className="truncate text-base font-semibold text-foreground">{motion.title}</span>
          )}
          <button
            onClick={() => {
              setDraftTitle(motion.title)
              setEditing(true)
            }}
            aria-label="Rename motion"
            className="shrink-0 text-muted-foreground"
          >
            <Pencil size={14} />
          </button>
        </div>
        {motion.position && <Badge tone="accent">{POSITION_LABELS[motion.position]}</Badge>}
        <ModelSwitcher motion={motion} />
      </div>

      <Stepper
        currentStage={motion.currentStage}
        onSelect={goToStage}
        // Only stages that already have a document can be revisited; going
        // forward is what the advance button is for.
        isAvailable={(stage) => Boolean(motion.stageDocs[String(stage) as '1' | '2' | '3'])}
      />

      {motion.currentStage < 3 ? (
        <Button onClick={advanceStage} disabled={!currentDoc || advancing}>
          {advancing ? (
            'Generating…'
          ) : (
            <>
              Move to Stage {motion.currentStage + 1} <ArrowRight size={16} />
            </>
          )}
        </Button>
      ) : (
        <div className="w-[190px]" />
      )}
    </div>
  )
}

function ChatColumn({ motion }: { motion: Motion }) {
  const { sendMessage, sending, streaming } = useApp()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = motion.messages.filter((m) => m.stage === motion.currentStage)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, sending])

  async function handleSend() {
    const content = draft.trim()
    if (!content || sending) return
    setDraft('')
    // Hand the text back if it never reached the server, rather than making
    // the user retype it.
    const delivered = await sendMessage(content)
    if (!delivered) setDraft((current) => current || content)
  }

  return (
    <div className="flex h-full flex-1 flex-col border-r border-border">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-7 pb-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {/* The reply as it arrives. It is replaced by the stored message once
            the turn completes, so there is never a duplicate. */}
        {streaming?.reply && <ChatBubble role="assistant" content={streaming.reply} />}
        {sending && !streaming?.reply && (
          <div className="px-1 text-[13px] italic text-muted-foreground">Rhetor is working…</div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex flex-col gap-0 p-5 pt-0">
        <div className="flex items-center gap-[10px] rounded-[10px] border border-border bg-card p-[12px_14px]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={sending}
            placeholder={
              sending ? 'Waiting for a reply…' : 'Message Rhetor about this stage...'
            }
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            aria-label="Send"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground disabled:opacity-40"
            disabled={!draft.trim() || sending}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ExportBar({ motion, markdown }: { motion: Motion; markdown: string }) {
  const [copied, setCopied] = useState(false)

  async function copyToClipboard() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-2 border-t border-border bg-card px-7 py-3">
      <span className="mr-1 text-xs font-semibold text-muted-foreground">EXPORT</span>
      {/* Served by the API so the filename and content come from the stored
          document, rather than being rebuilt in the browser. */}
      <a
        href={api.exportUrl(motion.id, motion.currentStage)}
        download
        className="flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-[6px] text-xs font-semibold text-foreground hover:bg-background"
      >
        <FileText size={13} /> Markdown
      </a>
      <button
        onClick={() => window.print()}
        title="Server-side PDF export is not built yet — this uses the browser's print dialog."
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

function DocumentColumn({ motion }: { motion: Motion }) {
  const { advancing, streaming } = useApp()
  const stored = motion.stageDocs[String(motion.currentStage) as '1' | '2' | '3']

  // While a turn is streaming, show what has been written so far. The stored
  // document only changes once the whole turn lands, so without this the panel
  // sits on the previous version for the length of the call.
  const live = streaming?.document
  const doc = live || stored
  const isStreaming = Boolean(live)

  return (
    <div className="flex h-full flex-1 flex-col bg-document-bg">
      <div className="flex-1 overflow-y-auto p-8">
        {doc ? (
          <>
            <DocumentView markdown={doc} />
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-text-bottom" />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center px-10 text-center text-sm text-muted-foreground">
            {advancing || streaming
              ? 'Generating this stage’s document…'
              : "Send a message to generate this stage's document."}
          </div>
        )}
      </div>
      {motion.currentStage === 3 && stored && !isStreaming && (
        <ExportBar motion={motion} markdown={stored} />
      )}
    </div>
  )
}

export function Workspace() {
  const { activeMotion, activeMotionId, loadingMotion } = useApp()

  // Three distinct states, deliberately not collapsed into "no motion". A
  // motion that is merely still loading must not render the big empty-state
  // logo — that read as the whole screen flashing.
  const pending = !activeMotion && (loadingMotion || Boolean(activeMotionId))

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex h-full flex-1 flex-col bg-background">
        {activeMotion ? (
          <>
            <TopBar motion={activeMotion} />
            <ErrorBanner />
            <div className="flex flex-1 overflow-hidden">
              <ChatColumn motion={activeMotion} />
              <DocumentColumn motion={activeMotion} />
            </div>
          </>
        ) : (
          <>
            <ErrorBanner />
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              {pending ? (
                <p className="text-sm text-muted-foreground">Loading motion…</p>
              ) : (
                <>
                  <LogoMark size={56} />
                  <p className="text-sm text-muted-foreground">
                    Select or create a motion to get started.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
