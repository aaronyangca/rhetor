import { ArrowLeft, Lock, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import { Button } from '../components/Button'

function KeyRow({
  initials,
  name,
  status,
  connected,
  onConnect,
}: {
  initials: string
  name: string
  status: string
  connected: boolean
  onConnect: () => void
}) {
  return (
    <div className="flex items-center justify-between border-t border-border py-4 first:border-t-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-secondary text-xs font-bold text-primary">
          {initials}
        </div>
        <div className="flex flex-col gap-[2px]">
          <div className="text-sm font-semibold text-foreground">{name}</div>
          <div className="text-[12.5px] text-muted-foreground">{status}</div>
        </div>
      </div>
      {connected ? (
        <Button variant="outline" onClick={onConnect}>
          Replace
        </Button>
      ) : (
        <Button onClick={onConnect}>
          <Plus size={16} /> Add Key
        </Button>
      )}
    </div>
  )
}

export function AccountSettings() {
  const { user, apiKeys, connectKey } = useApp()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-8">
        <div className="flex items-center gap-[10px]">
          <span className="text-base font-bold text-foreground">Rhetor</span>
          <span className="text-base text-border">/</span>
          <span className="text-sm font-medium text-muted-foreground">Account Settings</span>
        </div>
        <Link to="/app">
          <Button variant="outline">
            <ArrowLeft size={16} /> Back to App
          </Button>
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center p-12">
        <div className="flex w-full max-w-[640px] flex-col gap-10">
          <div className="flex flex-col gap-[6px]">
            <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile and the API keys Rhetor uses to run the argument pipeline.
            </p>
          </div>

          <div className="flex flex-col gap-[2px]">
            <div className="text-[15px] font-semibold text-foreground">API Keys</div>
            <p className="text-[13px] text-muted-foreground">
              One key per provider, used directly for every generation call. Rhetor never sees or
              bills your usage.
            </p>
            <div className="flex flex-col pt-4">
              <KeyRow
                initials="AI"
                name="OpenAI"
                status={apiKeys.openai.connected ? apiKeys.openai.masked! : 'Not connected'}
                connected={apiKeys.openai.connected}
                onConnect={() => connectKey('openai')}
              />
              <KeyRow
                initials="A"
                name="Anthropic"
                status={apiKeys.anthropic.connected ? apiKeys.anthropic.masked! : 'Not connected'}
                connected={apiKeys.anthropic.connected}
                onConnect={() => connectKey('anthropic')}
              />
            </div>
            <div className="flex items-start gap-2 pt-[14px]">
              <Lock size={13} className="mt-[3px] shrink-0 text-muted-foreground" />
              <p className="flex-1 text-xs text-muted-foreground">
                Keys are encrypted at rest and never shown in full after entry.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[2px]">
            <div className="text-[15px] font-semibold text-foreground">Profile</div>
            <p className="text-[13px] text-muted-foreground">Your account credentials.</p>
            <div className="flex flex-col pt-4">
              <div className="flex items-center justify-between border-t border-border py-4">
                <div className="flex flex-col gap-[2px]">
                  <div className="text-[12.5px] text-muted-foreground">Email</div>
                  <div className="text-sm font-medium text-foreground">{user?.email}</div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border py-4">
                <div className="flex flex-col gap-[2px]">
                  <div className="text-[12.5px] text-muted-foreground">Password</div>
                  <div className="text-sm font-medium text-foreground">••••••••••••</div>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
