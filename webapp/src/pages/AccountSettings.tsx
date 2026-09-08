import { useState } from 'react'
import { ArrowLeft, Lock, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import { Button } from '../components/Button'
import { FormInput } from '../components/FormInput'
import { ApiError } from '../lib/api'
import { PROVIDERS, PROVIDER_KEY_HINT, PROVIDER_LABELS, type Provider } from '../lib/types'

const PROVIDER_INITIALS: Record<Provider, string> = {
  openai: 'AI',
  anthropic: 'A',
  gemini: 'G',
}

function KeyRow({ provider }: { provider: Provider }) {
  const { apiKeys, saveKey, removeKey } = useApp()
  const [editing, setEditing] = useState(false)
  const [key, setKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const state = apiKeys[provider]
  const label = PROVIDER_LABELS[provider]

  function open() {
    setKey('')
    setError(null)
    setEditing(true)
  }

  async function save() {
    if (!key.trim() || pending) return
    setPending(true)
    setError(null)
    try {
      await saveKey(provider, key.trim())
      setEditing(false)
      setKey('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save that key.')
    } finally {
      setPending(false)
    }
  }

  async function remove() {
    setPending(true)
    try {
      await removeKey(provider)
    } catch {
      setError('Could not remove that key.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col border-t border-border py-4 first:border-t-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
            {PROVIDER_INITIALS[provider]}
          </div>
          <div className="flex flex-col gap-[2px]">
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="text-[12.5px] text-muted-foreground">
              {state.connected ? state.masked : 'Not connected'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state.connected && !editing && (
            <Button variant="ghost" onClick={remove} disabled={pending}>
              Remove
            </Button>
          )}
          {editing ? (
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={pending}>
              Cancel
            </Button>
          ) : (
            <Button variant={state.connected ? 'secondary' : 'primary'} onClick={open}>
              {state.connected ? (
                'Replace'
              ) : (
                <>
                  <Plus size={16} /> Add Key
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <div className="flex flex-col gap-3 pt-4">
          <FormInput
            label={`${label} API key`}
            type="password"
            placeholder={PROVIDER_KEY_HINT[provider]}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            autoFocus
          />
          {error && (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={save} disabled={!key.trim() || pending}>
              {pending ? 'Saving…' : 'Save Key'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AccountSettings() {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-8">
        <div className="flex items-center gap-[10px]">
          <span className="font-heading text-[19px] text-foreground">Rhetor</span>
          <span className="text-base text-border">/</span>
          <span className="text-sm font-medium text-muted-foreground">Account Settings</span>
        </div>
        <Link to="/app">
          <Button variant="secondary">
            <ArrowLeft size={16} /> Back to App
          </Button>
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center p-12">
        <div className="flex w-full max-w-[640px] flex-col gap-10">
          <div className="flex flex-col gap-[6px]">
            <h1 className="font-heading text-[28px] font-normal text-foreground">Account Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile and the API keys Rhetor uses to run the argument pipeline.
            </p>
          </div>

          <div className="flex flex-col gap-[2px]">
            <div className="text-[15px] font-medium text-foreground">API Keys</div>
            <p className="text-[13px] text-muted-foreground">
              One key per provider, used directly for every generation call. Rhetor never sees or
              bills your usage.
            </p>
            <div className="flex flex-col pt-4">
              {PROVIDERS.map((provider) => (
                <KeyRow key={provider} provider={provider} />
              ))}
            </div>
            <div className="flex items-start gap-2 pt-[14px]">
              <Lock size={13} className="mt-[3px] shrink-0 text-muted-foreground" />
              <p className="flex-1 text-xs text-muted-foreground">
                Keys are encrypted at rest and never shown in full after entry.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[2px]">
            <div className="text-[15px] font-medium text-foreground">Profile</div>
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
                  <div className="text-[12.5px] text-muted-foreground">Session</div>
                  <div className="text-sm font-medium text-foreground">
                    Signed in as {user?.email}
                  </div>
                </div>
                <Button variant="secondary" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
