import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Wordmark } from '../components/Logo'
import { FormInput } from '../components/FormInput'
import { Button } from '../components/Button'
import { useApp } from '../state/AppContext'
import { ApiError, api } from '../lib/api'

const MIN_PASSWORD_LENGTH = 8

/** Same frame as the login page, so the two read as one flow. */
function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-[380px] flex-col items-center gap-8">
        <Link to="/">
          <Wordmark className="text-[30px]" />
        </Link>
        <div className="flex w-full flex-col gap-7">
          <div className="flex flex-col gap-[6px]">
            <h1 className="font-heading text-[28px] font-normal text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
    >
      {children}
    </p>
  )
}

function BackToLogin() {
  return (
    <div className="flex justify-center text-[13px]">
      <Link to="/login" className="font-medium text-accent-700">
        Back to log in
      </Link>
    </div>
  )
}

/** Step 1: ask for the email and send the link. */
export function ForgotPassword() {
  const location = useLocation()
  const [email, setEmail] = useState<string>(
    (location.state as { email?: string } | null)?.email ?? '',
  )
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <AuthFrame
        title="Check your email"
        subtitle={`If an account exists for ${email}, we’ve sent it a link to reset your password. The link works for one hour.`}
      >
        <BackToLogin />
      </AuthFrame>
    )
  }

  return (
    <AuthFrame
      title="Reset your password"
      subtitle="Enter the email you signed up with and we’ll send you a link to choose a new password."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          required
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Sending…' : 'Send Reset Link'}
        </Button>
        <BackToLogin />
      </form>
    </AuthFrame>
  )
}

/** Step 2: the page the emailed link opens. */
export function ResetPassword() {
  const { resetPassword } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [linkDead, setLinkDead] = useState(!token)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (pending) return
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    setPending(true)
    setError(null)
    try {
      await resetPassword(token, password)
      navigate('/app', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'invalid_token' || err.code === 'expired_token')) {
        setLinkDead(true)
      }
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
      setPending(false)
    }
  }

  if (linkDead) {
    return (
      <AuthFrame
        title="This link no longer works"
        subtitle={error ?? 'This reset link is missing or incomplete. Request a new one.'}
      >
        <Button className="w-full" onClick={() => navigate('/forgot-password')}>
          Request a New Link
        </Button>
        <BackToLogin />
      </AuthFrame>
    )
  }

  return (
    <AuthFrame title="Choose a new password" subtitle="You’ll be logged in once it’s saved.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <FormInput
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          autoFocus
          required
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Saving…' : 'Save Password'}
        </Button>
      </form>
    </AuthFrame>
  )
}
