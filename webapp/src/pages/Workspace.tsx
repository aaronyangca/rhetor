import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  PanelLeft,
  Pencil,
  Plus,
  Send,
  Square,
  Trash2,
  X,
} from 'lucide-react'
import { useApp } from '../state/AppContext'
import { api } from '../lib/api'
import { useStickToBottom } from '../lib/useStickToBottom'
import { useResizableSplit } from '../lib/useResizableSplit'
import { Wordmark } from '../components/Logo'
import { SidebarMotionItem } from '../components/SidebarMotionItem'
import { GhostIconButton } from '../components/Button'
import { StageIndicator } from '../components/StageIndicator'
import { ChatBubble } from '../components/ChatBubble'
import { DocumentView } from '../components/DocumentView'
import {
  POSITION_LABELS,
  PROVIDER_LABELS,
  type ModelOption,
  type Motion,
  type MotionSummary,
  type Provider,
  type Stage,
} from '../lib/types'

const DAY_MS = 86_400_000

/** Sidebar grouping — the list arrives newest-updated first. */
function groupMotions(motions: MotionSummary[]) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const weekAgo = startOfToday - 6 * DAY_MS
  const groups: Record<'today' | 'week' | 'earlier', MotionSummary[]> = {
    today: [],
    week: [],
    earlier: [],
  }
  for (const m of motions) {
    const t = new Date(m.updatedAt).getTime()
    if (t >= startOfToday) groups.today.push(m)
    else if (t >= weekAgo) groups.week.push(m)
    else groups.earlier.push(m)
  }
  return [
    { label: 'Today', items: groups.today },
    { label: 'Earlier this week', items: groups.week },
    { label: 'Earlier', items: groups.earlier },
  ].filter((g) => g.items.length > 0)
}

function ErrorBanner() {
  const { error, clearError } = useApp()
  if (!error) return null
  return (
    <div
      role="alert"
      className="flex shrink-0 items-start gap-2 border-b border-destructive/30 bg-destructive/5 px-4 py-3"
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
  markFree,
  onClick,
}: {
  model: ModelOption
  selected?: boolean
  /** Show the "Free" tag — set only when free is the minority tier in this
   *  provider's list, so the marker actually distinguishes a row. */
  markFree?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-[1px] rounded-md px-2 py-[7px] text-left hover:bg-accent-100 ${
        selected ? 'bg-accent-100' : ''
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] text-foreground">{model.label}</span>
        {selected && <Check size={12} className="text-accent-700" />}
        {markFree && model.freeTier && (
          <span className="text-[10px] font-medium tracking-[0.4px] text-success uppercase">
            Free
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
  const single = connectedProviders.length === 1

  async function create(provider: Provider) {
    setOpen(false)
    setCreating(true)
    try {
      // No model is chosen here — that's a per-motion setting in the workspace.
      await createMotion(provider)
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
        className="flex min-h-[38px] w-full items-center justify-center gap-[9px] rounded-md border border-dashed border-border px-[18px] text-[14.5px] font-medium whitespace-nowrap text-muted-foreground hover:bg-accent-100/60"
      >
        <Plus size={15} strokeWidth={1.6} /> Add an API key first
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => (single ? create(connectedProviders[0]) : setOpen((v) => !v))}
        disabled={creating || !catalogue}
        className="flex min-h-[38px] w-full items-center justify-center gap-[9px] rounded-md border border-accent-500 px-[18px] text-[14.5px] font-medium whitespace-nowrap text-accent-800 transition-colors hover:bg-accent-100 disabled:opacity-45"
      >
        <Plus size={15} strokeWidth={1.6} /> {creating ? 'Creating…' : 'New Motion'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 left-0 z-20 mt-1 flex flex-col rounded-md border border-border bg-card p-1 shadow-sm">
            <div className="px-2 pt-2 pb-1 text-[11px] tracking-[0.4px] text-muted-foreground">
              PROVIDER
            </div>
            {connectedProviders.map((provider) => (
              <button
                key={provider}
                onClick={() => create(provider)}
                className="rounded-md px-2 py-[7px] text-left text-[13px] text-foreground hover:bg-accent-100"
              >
                {PROVIDER_LABELS[provider]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * The one place a motion's model is chosen — it applies to every stage. Lives
 * in the header next to the stage readout so it is always visible, and there is
 * never any doubt about which model an advance will use.
 */
function MotionModelPicker({ motion }: { motion: Motion }) {
  const { catalogue, setModel } = useApp()
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  // The header has `overflow-hidden`, so the menu is portalled to <body> and
  // positioned against the button's viewport rect rather than clipped inside it.
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const el = anchorRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setPos({ top: r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open])

  if (!catalogue) return null

  const options = catalogue[motion.provider].models
  const freeCount = options.filter((m) => m.freeTier).length
  // Tag the free option only when free is the minority in a mixed list — a
  // marker on every row (or on none) tells you nothing.
  const markFree = freeCount > 0 && freeCount < options.length - freeCount

  return (
    <div className="relative flex-none">
      <button
        ref={anchorRef}
        onClick={() => setOpen((v) => !v)}
        title={`Model · ${PROVIDER_LABELS[motion.provider]} · ${motion.modelLabel}`}
        className="flex min-h-[28px] max-w-[160px] items-center gap-[5px] rounded-md px-[8px] text-[13px] whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent-100 hover:text-accent-800"
      >
        <span className="truncate">{motion.modelLabel}</span>
        <ChevronDown size={13} className="shrink-0" />
      </button>

      {open &&
        pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="fixed z-50 flex w-[280px] flex-col rounded-md border border-border bg-card p-1 shadow-sm"
              style={{ top: pos.top, right: pos.right }}
            >
              <div className="px-2 pt-2 pb-1 text-[11px] tracking-[0.4px] text-muted-foreground">
                {PROVIDER_LABELS[motion.provider].toUpperCase()}
              </div>
              {options.map((model) => (
                <ModelOptionRow
                  key={model.id}
                  model={model}
                  selected={model.id === motion.model}
                  markFree={markFree}
                  onClick={() => {
                    setOpen(false)
                    setModel(model.id)
                  }}
                />
              ))}
              <p className="px-2 pt-2 pb-1 text-[11px] leading-4 text-muted-foreground">
                Used for the whole motion — every stage. Changing it takes effect
                on the next generation.
              </p>
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { motions, activeMotionId, selectMotion, deleteMotion, user } = useApp()
  const groups = collapsed ? [] : groupMotions(motions)

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-divider bg-sidebar-bg">
      <div
        className={`flex h-[52px] shrink-0 items-center border-b border-divider ${
          collapsed ? 'justify-center' : 'pr-3 pl-5'
        }`}
      >
        {!collapsed && (
          <>
            <Wordmark face="body" className="text-[17px]" />
            <div className="flex-1" />
          </>
        )}
        <GhostIconButton
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft size={17} strokeWidth={1.5} />
        </GhostIconButton>
      </div>

      {!collapsed && (
        <>
          <div className="h-[14px]" />
          <div className="px-[14px] pb-[14px]">
            <NewMotionButton />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-[10px] pt-[2px] pb-4">
            {motions.length === 0 && (
              <p className="px-[10px] py-2 text-[12.5px] leading-5 text-muted-foreground">
                No motions yet. Start one and Rhetor will ask for the motion and your position.
              </p>
            )}
            {groups.map((group, gi) => (
              <div key={group.label}>
                <p
                  className={`px-[10px] mb-[6px] text-[12.5px] text-ink-58 ${
                    gi === 0 ? 'mt-[6px]' : 'mt-5'
                  }`}
                >
                  {group.label}
                </p>
                <div className="flex flex-col gap-[1px]">
                  {group.items.map((m) => (
                    <div key={m.id} className="group relative">
                      <SidebarMotionItem
                        title={m.title}
                        stage={m.currentStage}
                        active={m.id === activeMotionId}
                        onClick={() => selectMotion(m.id)}
                      />
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${m.title}"? This cannot be undone.`))
                            deleteMotion(m.id)
                        }}
                        aria-label={`Delete ${m.title}`}
                        className="absolute top-1/2 right-2 hidden -translate-y-1/2 text-muted-foreground hover:text-destructive group-hover:block focus-visible:block"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-[10px] overflow-hidden border-t border-divider px-5 py-3 text-[13px] whitespace-nowrap text-ink-70">
            <span className="truncate">{user?.email}</span>
            <Link
              to="/app/settings"
              className="flex-none text-accent-700 hover:text-accent-800 hover:underline"
            >
              Settings
            </Link>
          </div>
        </>
      )}
    </aside>
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
  const advanceLabel =
    motion.currentStage < 3 ? `Advance to stage ${motion.currentStage + 1}` : 'Finish and export'
  const btnClass =
    'flex min-h-[32px] flex-none items-center gap-[7px] rounded-md border border-accent-500 px-[13px] text-[13.5px] whitespace-nowrap text-accent-800 transition-colors hover:bg-accent-100 active:border-accent-600 active:bg-accent-200 disabled:opacity-45'

  // Single flex row, uniform 10px gap, no spacer div — the position label's
  // margin-right:auto pushes the readout and advance button right (SPEC.md 0.2).
  // With no position yet, the edit button carries the auto margin instead.
  return (
    <header className="flex h-[52px] shrink-0 flex-nowrap items-center gap-[10px] overflow-hidden border-b border-divider px-4">
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
          className="min-w-0 flex-[0_1_auto] border-b border-divider bg-transparent font-body text-[17px] font-normal text-foreground outline-none"
        />
      ) : (
        <h1 className="min-w-0 flex-[0_1_auto] truncate font-body text-[17px] leading-[1.2] font-normal tracking-[-0.005em] text-foreground">
          {motion.title}
        </h1>
      )}
      <button
        onClick={() => {
          setDraftTitle(motion.title)
          setEditing(true)
        }}
        aria-label="Rename motion"
        className={`flex h-7 w-7 flex-none items-center justify-center text-muted-foreground hover:text-accent-800 ${
          motion.position ? 'max-[899px]:mr-auto' : 'mr-auto'
        }`}
      >
        <Pencil size={15} strokeWidth={1.5} />
      </button>
      {motion.position && (
        <span className="mr-auto hidden flex-none whitespace-nowrap text-[14px] text-ink-70 min-[900px]:inline">
          {POSITION_LABELS[motion.position]}
        </span>
      )}

      <MotionModelPicker motion={motion} />

      <StageIndicator
        currentStage={motion.currentStage}
        onSelect={goToStage}
        isAvailable={(stage) => Boolean(motion.stageDocs[String(stage) as '1' | '2' | '3'])}
      />

      {motion.currentStage < 3 ? (
        <button onClick={advanceStage} disabled={!currentDoc || advancing} className={btnClass}>
          <span className="hidden min-[1100px]:inline">
            {advancing ? 'Generating…' : advanceLabel}
          </span>
          <ArrowRight size={20} className="-my-[2px] block" />
        </button>
      ) : (
        <a href={api.exportUrl(motion.id, 3)} download className={btnClass}>
          <span className="hidden min-[1100px]:inline">{advanceLabel}</span>
          <ArrowRight size={20} className="-my-[2px] block" />
        </a>
      )}
    </header>
  )
}

const STAGE_HELP: Record<Stage, string> = {
  1: 'Stage 1 · Ideas. Give Rhetor the motion and your position (OG / OO / CG / CO), then think out loud. It builds a wide pool of rough argument ideas around your line — no scoring yet. When you have enough to develop, type “move to stage 2”.',
  2: 'Stage 2 · Develop & score. Rhetor fills each argument out — claim, mechanism, evidence, impact — and marks it the way a judge would, then ranks the bench. Ask it to push a mechanism, find harder evidence, or cut a weak one. When the bench is solid, type “move to stage 3”.',
  3: 'Stage 3 · Final ranking. Rhetor picks the shortlist you’d actually run and orders it by strategic fit for your bench position. Ask it to reconsider an inclusion or the order, then export when you’re done.',
}

const MOVE_VERB = /\b(move|advance|go|proceed|continue|jump|skip)\b/
const HOLD_BACK = /\b(don'?t|do not|dont|shouldn'?t|not yet|wait|hold on|hold off|stay|remain|keep)\b/
const NUM: Record<string, number> = { '2': 2, two: 2, '3': 3, three: 3 }

/** Deterministic — never the model's judgement. Returns a target stage only for
 *  an unambiguous, explicit "move to the next stage" instruction. */
function parseStageCommand(
  text: string,
  current: Stage,
): { kind: 'help' } | { kind: 'advance'; to: Stage } | null {
  const t = text.trim().toLowerCase()
  if (t === '?' || t === 'help' || t === '/help') return { kind: 'help' }
  if (!MOVE_VERB.test(t) || HOLD_BACK.test(t)) return null

  let to: number | null = null
  if (/\bnext stage\b/.test(t)) to = current + 1
  else {
    const m = t.match(/\bstage\s*(2|3|two|three)\b/)
    if (m) to = NUM[m[1]]
  }
  return to === current + 1 && to <= 3 ? { kind: 'advance', to: to as Stage } : null
}

/** A section boundary in the continuous chat — also the in-context way to make
 *  that stage current (switches the document panel and where new turns land). */
function StageDivider({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 text-[12px] whitespace-nowrap text-ink-58"
    >
      <span className="h-px flex-1 bg-divider" />
      <span className="rounded-full px-2 py-[1px] transition-colors group-hover:bg-accent-100 group-hover:text-accent-800">
        {label}
      </span>
      <span className="h-px flex-1 bg-divider" />
    </button>
  )
}

function StageHelpNote({ stage, onDismiss }: { stage: Stage; onDismiss: () => void }) {
  return (
    <div className="rounded-md border border-divider bg-accent-100/40 px-4 py-3 text-[13.5px] leading-[1.55] text-ink-82">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium">Stage {stage}</span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-ink-58 hover:text-accent-800"
        >
          <X size={14} />
        </button>
      </div>
      {STAGE_HELP[stage]}
    </div>
  )
}

const CHAT_STAGES: Stage[] = [1, 2, 3]

function ChatColumn({ motion }: { motion: Motion }) {
  const { sendMessage, sending, advancing, streaming, goToStage, cancelGeneration } = useApp()
  const [draft, setDraft] = useState('')
  const [help, setHelp] = useState<Stage | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const sectionRefs = useRef<Partial<Record<Stage, HTMLDivElement | null>>>({})

  // Any in-flight turn — a message or an advance — locks the composer to Stop.
  const busy = sending || advancing
  const stage = motion.currentStage
  // The whole conversation is shown at once, split into per-stage blocks — a
  // stage never disappears, you just scroll. New turns still go to `stage`.
  const byStage = (s: Stage) => motion.messages.filter((m) => m.stage === s)
  const highestStage = Math.max(stage, ...motion.messages.map((m) => m.stage)) as Stage
  const visibleStages = CHAT_STAGES.filter((s) => s <= highestStage)
  const scroll = useStickToBottom<HTMLDivElement>([
    motion.messages.length,
    busy,
    streaming?.reply,
    help,
  ])

  // Clear the ephemeral help / notice, and jump to the stage's block, on switch.
  useEffect(() => {
    setHelp(null)
    setNotice(null)
    sectionRefs.current[stage]?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [stage])

  function jumpToStage(s: Stage) {
    if (s === stage) sectionRefs.current[s]?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    else void goToStage(s)
  }

  async function handleSend() {
    const content = draft.trim()
    if (!content || busy) return

    const cmd = parseStageCommand(content, stage)
    if (cmd?.kind === 'help') {
      setHelp(stage)
      setNotice(null)
      setDraft('')
      scroll.stick()
      return
    }
    if (cmd?.kind === 'advance') {
      if (!motion.stageDocs[String(stage) as '1' | '2' | '3']) {
        setNotice('There’s nothing to move on with yet — send some ideas first.')
        return
      }
      setDraft('')
      setNotice(null)
      await goToStage(cmd.to)
      return
    }

    scroll.stick()
    setDraft('')
    setNotice(null)
    const delivered = await sendMessage(content)
    if (!delivered) setDraft((current) => current || content)
  }

  return (
    <section
      className="grid min-h-0 min-w-0 overflow-hidden"
      style={{ gridTemplateRows: 'minmax(0,1fr) auto', gridTemplateColumns: 'minmax(0,1fr)' }}
    >
      <div
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        className="flex min-h-0 flex-col overflow-y-auto px-5 pt-[14px] pb-2"
      >
        {visibleStages.map((s, i) => {
          const msgs = byStage(s)
          const isCurrent = s === stage
          const multi = visibleStages.length > 1
          return (
            <div
              key={s}
              ref={(el) => {
                sectionRefs.current[s] = el
              }}
              className={`flex flex-col gap-[26px] ${i > 0 ? 'pt-[26px]' : ''}`}
            >
              {multi && (
                <StageDivider
                  label={s === 1 ? 'Stage 1' : `Moved to Stage ${s}`}
                  onClick={() => jumpToStage(s)}
                />
              )}
              {msgs.map((m) => (
                <ChatBubble key={m.id} role={m.role} content={m.content} />
              ))}
              {isCurrent && streaming?.reply && (
                <ChatBubble role="assistant" content={streaming.reply} />
              )}
              {isCurrent && busy && !streaming?.reply && (
                <p className="text-[13px] text-muted-foreground italic">
                  {advancing ? 'Generating the next stage…' : 'Rhetor is working…'}
                </p>
              )}
              {isCurrent && help && (
                <StageHelpNote stage={help} onDismiss={() => setHelp(null)} />
              )}
              {isCurrent && msgs.length === 0 && !help && (
                <p className="text-[12.5px] text-ink-58">
                  Type “?” for what to do in this stage.
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="px-4 pt-2 pb-4">
        {notice && <p className="mb-2 px-1 text-[12.5px] text-accent-800">{notice}</p>}
        <div className="flex items-center gap-[6px] rounded-lg border border-ink-20 bg-card py-[7px] pr-2 pl-[14px]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={busy}
            aria-label="Message Rhetor"
            placeholder={
              busy
                ? advancing
                  ? 'Generating the next stage…'
                  : 'Waiting for a reply…'
                : 'Send message here…'
            }
            className="min-w-[60px] flex-[1_1_120px] bg-transparent text-[15.5px] leading-[1.6] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <div className="flex flex-none items-center gap-[2px]">
            {busy ? (
              <button
                onClick={cancelGeneration}
                aria-label="Stop generating"
                title="Stop"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-accent-600 bg-accent-200 text-accent-900 transition-colors hover:bg-accent-300"
              >
                <Square size={13} strokeWidth={0} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                aria-label="Send message"
                disabled={!draft.trim()}
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-accent-500 text-accent-800 transition-colors hover:bg-accent-100 active:border-accent-600 active:bg-accent-200 disabled:opacity-45"
              >
                <Send
                  size={16}
                  strokeWidth={1.6}
                  className="translate-x-[-0.5px] translate-y-[0.5px]"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function DocToolbar({ motion, markdown }: { motion: Motion; markdown: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const link = 'text-accent-700 hover:text-accent-800 hover:underline'

  return (
    <div className="flex shrink-0 items-center gap-4 border-t border-divider px-7 py-[10px] text-[14px]">
      <a href={api.exportUrl(motion.id, motion.currentStage)} download className={link}>
        Markdown
      </a>
      <a href={api.exportUrl(motion.id, motion.currentStage, 'pdf')} download className={link}>
        PDF
      </a>
      <button onClick={copy} className={link}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function DocumentColumn({ motion }: { motion: Motion }) {
  const { advancing, streaming, goToStage } = useApp()
  const stage = motion.currentStage
  const stored = motion.stageDocs[String(stage) as '1' | '2' | '3']

  const live = streaming?.document
  const doc = live || stored
  const isStreaming = Boolean(live)
  const prevDone = stage > 1 && Boolean(motion.stageDocs[String(stage - 1) as '1' | '2' | '3'])

  const scroll = useStickToBottom<HTMLDivElement>([live], isStreaming)

  return (
    <section className="flex min-h-0 min-w-0 flex-col bg-document-bg">
      <div
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        className="min-h-0 flex-1 overflow-y-auto px-7 pt-[14px] pb-7"
      >
        {doc ? (
          <>
            <DocumentView markdown={doc} />
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-text-bottom" />
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-10 text-center text-sm text-muted-foreground">
            {advancing || streaming ? (
              'Generating this stage’s document…'
            ) : (
              <>
                <p>Stage {stage} hasn’t been generated yet — send a message to start it.</p>
                {prevDone && (
                  <p>
                    Your Stage {stage - 1} work is saved.{' '}
                    <button
                      onClick={() => goToStage((stage - 1) as Stage)}
                      className="text-accent-700 hover:text-accent-800 hover:underline"
                    >
                      Go back to Stage {stage - 1}
                    </button>
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {stored && !isStreaming && <DocToolbar motion={motion} markdown={stored} />}
    </section>
  )
}

function SplitArea({ motion }: { motion: Motion }) {
  const { split, dragging, containerRef, onPointerDown, onKeyDown } = useResizableSplit()

  return (
    <div
      ref={containerRef}
      className="grid min-h-0 flex-1"
      style={{
        gridTemplateColumns: `minmax(0, ${split.toFixed(4)}fr) 5px minmax(0, ${(1 - split).toFixed(
          4,
        )}fr)`,
      }}
    >
      <ChatColumn motion={motion} />
      <div
        role="separator"
        aria-label="Resize panels"
        aria-orientation="vertical"
        aria-valuenow={Math.round(split * 100)}
        aria-valuemin={25}
        aria-valuemax={70}
        tabIndex={0}
        title="Drag to resize"
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className="touch-none cursor-col-resize transition-[background] duration-150"
        style={{ background: dragging ? 'var(--color-accent)' : 'var(--color-divider)' }}
      />
      <DocumentColumn motion={motion} />
    </div>
  )
}

export function Workspace() {
  const { activeMotion, activeMotionId, loadingMotion } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem('rhetor.sidebar') !== 'closed',
  )

  function toggleSidebar(open: boolean) {
    setSidebarOpen(open)
    localStorage.setItem('rhetor.sidebar', open ? 'open' : 'closed')
  }

  const pending = !activeMotion && (loadingMotion || Boolean(activeMotionId))

  return (
    <div
      className="grid h-screen overflow-hidden bg-background transition-[grid-template-columns] duration-[220ms] [transition-timing-function:ease]"
      style={{ gridTemplateColumns: `${sidebarOpen ? '230px' : '48px'} minmax(0,1fr)` }}
    >
      <Sidebar collapsed={!sidebarOpen} onToggle={() => toggleSidebar(!sidebarOpen)} />

      <main className="flex min-h-0 min-w-0 flex-col">
        {activeMotion ? (
          <>
            <TopBar motion={activeMotion} />
            <ErrorBanner />
            <SplitArea motion={activeMotion} />
          </>
        ) : (
          <>
            <ErrorBanner />
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 text-center">
              {pending ? (
                <p className="text-sm text-muted-foreground">Loading motion…</p>
              ) : (
                <>
                  <Wordmark className="text-[28px]" />
                  <p className="text-sm text-muted-foreground">
                    Select or create a motion to get started.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
