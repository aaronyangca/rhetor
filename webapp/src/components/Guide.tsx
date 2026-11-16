import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Send, X } from 'lucide-react'
import { Button } from './Button'
import { Wordmark } from './Logo'

/* ── Step illustrations: small schematic mocks of the real UI ─────────────── */

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[150px] items-center justify-center rounded-md border border-divider bg-document-bg px-5">
      {children}
    </div>
  )
}

function WelcomeArt() {
  return (
    <Frame>
      {/* Fixed, equal-width columns and identical arrow columns keep the
          circles evenly spaced and put circle 2 at the exact centre. */}
      <div className="grid grid-cols-[108px_auto_108px_auto_108px] items-start gap-x-3 text-[13px] text-ink-70">
        {['Ideas', 'Develop & score', 'Final ranking'].flatMap((label, i) => [
          ...(i > 0
            ? [
                <span key={`arrow-${i}`} className="flex h-7 items-center">
                  <ArrowRight size={14} className="text-accent-500" />
                </span>,
              ]
            : []),
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-500 text-accent-800">
              {i + 1}
            </span>
            <span className="whitespace-nowrap">{label}</span>
          </div>,
        ])}
      </div>
    </Frame>
  )
}

function KeyArt() {
  return (
    <Frame>
      <div className="flex w-full max-w-[300px] flex-col gap-2 text-[12.5px]">
        <span className="text-ink-70">Anthropic API key</span>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md border border-ink-20 bg-card px-3 py-[6px] font-mono text-[12px] text-ink-58">
            sk-ant-••••••••••••
          </div>
          <span className="rounded-md border border-accent-500 px-3 py-[5px] text-accent-800">
            Save
          </span>
        </div>
        <span className="text-success">Connected</span>
      </div>
    </Frame>
  )
}

function MotionArt() {
  return (
    <Frame>
      <div className="flex w-full max-w-[330px] flex-col gap-3">
        <span className="flex w-[150px] items-center justify-center gap-2 rounded-md border border-accent-500 py-[5px] text-[13px] text-accent-800">
          <Plus size={13} /> New Motion
        </span>
        <div className="flex items-center gap-2 rounded-lg border border-ink-20 bg-card py-[5px] pr-[5px] pl-3 text-[12.5px] text-ink-82">
          <span className="flex-1 truncate">THBT social media does more harm than good — we’re OO</span>
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-accent-500 text-accent-800">
            <Send size={11} />
          </span>
        </div>
      </div>
    </Frame>
  )
}

function WorkspaceArt() {
  return (
    <Frame>
      <div className="grid h-[112px] w-full max-w-[340px] grid-cols-[1fr_3px_1.2fr] overflow-hidden rounded-md border border-divider bg-background text-[11px]">
        <div className="flex flex-col gap-2 p-2">
          <span className="text-ink-58">Chat</span>
          <span className="ml-auto h-3 w-3/4 rounded-sm bg-accent-100" />
          <span className="h-3 w-full rounded-sm bg-ink-10" />
          <span className="h-3 w-2/3 rounded-sm bg-ink-10" />
        </div>
        <div className="bg-divider" />
        <div className="flex flex-col gap-2 bg-document-bg p-2">
          <span className="text-ink-58">Document</span>
          <span className="h-2 w-1/2 rounded-sm bg-ink-20" />
          <span className="h-2 w-full rounded-sm bg-ink-10" />
          <span className="h-2 w-full rounded-sm bg-ink-10" />
          <span className="h-2 w-5/6 rounded-sm bg-ink-10" />
        </div>
      </div>
    </Frame>
  )
}

function StagesArt() {
  return (
    <Frame>
      <div className="flex flex-col items-center gap-3 text-[13px]">
        <div className="flex items-center gap-[6px]">
          <span className="text-ink-58">Stage</span>
          <div className="flex items-center gap-[2px] rounded-md border border-divider p-[2px]">
            <span className="inline-flex h-5 w-6 items-center justify-center rounded-[3px] text-ink-72">
              1
            </span>
            <span className="inline-flex h-5 w-6 items-center justify-center rounded-[3px] bg-accent-200 font-semibold text-accent-900">
              2
            </span>
            <span className="inline-flex h-5 w-6 items-center justify-center rounded-[3px] text-ink-40">
              3
            </span>
          </div>
          <span className="ml-2 flex items-center gap-[6px] rounded-md border border-accent-500 px-3 py-[3px] text-accent-800">
            Advance to stage 3 <ArrowRight size={14} />
          </span>
        </div>
        <span className="text-[12px] text-ink-58">
          or type <Kbd>move to stage 3</Kbd> in the chat
        </span>
      </div>
    </Frame>
  )
}

function ExportArt() {
  return (
    <Frame>
      <div className="flex items-center gap-5 border-t border-divider px-4 pt-3 text-[14px] text-accent-700">
        <span>Markdown</span>
        <span>PDF</span>
        <span>Copy</span>
      </div>
    </Frame>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[3px] border border-divider bg-card px-[5px] py-[1px] text-[12.5px] text-ink-82">
      {children}
    </span>
  )
}

/* ── Steps ───────────────────────────────────────────────────────────────── */

interface Step {
  title: string
  art: ReactNode
  body: ReactNode
}

function buildSteps(hasKey: boolean, onClose: () => void): Step[] {
  return [
    {
      title: 'Welcome to Rhetor',
      art: <WelcomeArt />,
      body: (
        <>
          <p>
            Rhetor helps you prep a British Parliamentary case. You give it a motion and your
            position, and it builds arguments with you over three stages: lots of rough ideas
            first, then fully developed and scored arguments, then a final shortlist you’d
            actually run.
          </p>
          <p className="mt-2">
            You steer the whole way by chatting with it. This takes about a minute to walk
            through.
          </p>
        </>
      ),
    },
    {
      title: 'Connect an AI model',
      art: <KeyArt />,
      body: (
        <>
          <p>
            Rhetor runs on your own API key from Anthropic, OpenAI, Google Gemini or
            OpenRouter. Add one under <strong>Settings → API keys</strong>. Keys are stored
            encrypted and only used for your motions.
          </p>
          {hasKey ? (
            <p className="mt-2 text-success">You already have a key connected, so you’re set.</p>
          ) : (
            <p className="mt-2">
              You haven’t added one yet.{' '}
              <Link
                to="/app/settings"
                onClick={onClose}
                className="text-accent-700 hover:text-accent-800 hover:underline"
              >
                Add a key in Settings
              </Link>{' '}
              (you can come back to this guide any time).
            </p>
          )}
        </>
      ),
    },
    {
      title: 'Start a motion',
      art: <MotionArt />,
      body: (
        <p>
          Click <strong>New Motion</strong> in the sidebar. Then, in the chat, tell Rhetor the
          motion and which bench you’re on: OG, OO, CG or CO. Add anything you already have in mind, like angles you want to run or
          what the other side will say. Rough notes are fine.
        </p>
      ),
    },
    {
      title: 'Chat on the left, case on the right',
      art: <WorkspaceArt />,
      body: (
        <p>
          You talk to Rhetor in the chat. The <strong>document</strong> on the right is the
          actual case it builds, and it updates as you go. Drag the line between them to resize.
          The model menu in the top bar picks which AI writes this motion. Type <Kbd>?</Kbd> in
          the chat any time to see what to do in the current stage.
        </p>
      ),
    },
    {
      title: 'Move through the three stages',
      art: <StagesArt />,
      body: (
        <>
          <p>
            <strong>1 · Ideas:</strong> a wide pool of rough argument seeds.{' '}
            <strong>2 · Develop &amp; score:</strong> each argument gets a claim, mechanism,
            evidence and impact, then a judge-style score. <strong>3 · Final ranking:</strong> the
            shortlist ordered for your bench.
          </p>
          <p className="mt-2">
            When a stage looks good, click <strong>Advance</strong> in the top bar. Earlier stages
            are saved, so you can click a stage number to go back.
          </p>
        </>
      ),
    },
    {
      title: 'Take your case with you',
      art: <ExportArt />,
      body: (
        <p>
          Under the document you can download the current stage as <strong>Markdown</strong> or{' '}
          <strong>PDF</strong>, or copy it. At Stage 3 the top-bar button becomes{' '}
          <strong>Finish and export</strong>. Your motions are saved in the sidebar, so you can
          pick any of them up later.
        </p>
      ),
    },
  ]
}

/**
 * The first-run walkthrough. Opens itself once per user in the workspace, and
 * again from the sidebar's Guide button.
 */
export function Guide({ hasKey, onClose }: { hasKey: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const steps = buildSteps(hasKey, onClose)
  const step = steps[index]
  const last = index === steps.length - 1

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, steps.length])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hero-ink/30 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        className="relative flex max-h-full w-full max-w-[520px] flex-col overflow-y-auto rounded-lg border border-divider bg-card shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-divider px-6 py-3">
          <Wordmark face="body" className="text-[15px]" />
          <div className="flex items-center gap-3">
            <span className="text-[12.5px] text-ink-58 [font-feature-settings:'tnum'_1]">
              {index + 1} of {steps.length}
            </span>
            <button
              onClick={onClose}
              aria-label="Close guide"
              className="text-ink-58 hover:text-accent-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 pt-5 pb-2">
          {step.art}
          <h2
            id="guide-title"
            className="mt-5 font-body text-[19px] leading-[1.25] font-medium text-foreground"
          >
            {step.title}
          </h2>
          <div className="mt-2 min-h-[110px] text-[14px] leading-[1.6] text-ink-82 [&_strong]:font-medium [&_strong]:text-foreground">
            {step.body}
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 pt-2 pb-5">
          <div className="flex flex-1 items-center gap-[6px]">
            {steps.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setIndex(i)}
                aria-label={`Go to step ${i + 1}: ${s.title}`}
                className={`h-[6px] rounded-full transition-all ${
                  i === index ? 'w-5 bg-accent-500' : 'w-[6px] bg-ink-20 hover:bg-accent-300'
                }`}
              />
            ))}
          </div>
          {index === 0 ? (
            <Button variant="ghost" onClick={onClose}>
              Skip
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setIndex(index - 1)}>
              Back
            </Button>
          )}
          <Button
            autoFocus
            onClick={() => (last ? onClose() : setIndex(index + 1))}
          >
            {last ? 'Get started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
