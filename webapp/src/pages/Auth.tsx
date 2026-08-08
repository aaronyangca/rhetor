import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark } from '../components/Logo'
import { FormInput } from '../components/FormInput'
import { Button } from '../components/Button'
import { useApp } from '../state/AppContext'
import { ApiError } from '../lib/api'

const MIN_PASSWORD_LENGTH = 8

export function Auth({ mode }: { mode: 'signup' | 'login' }) {
  const { login, signup } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isSignup = mode === 'signup'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (pending) return

    // Checked here as well as server-side, so the error lands before a round trip.
    if (isSignup && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setPending(true)
    setError(null)
    try {
      if (isSignup) await signup(email, password)
      else await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-[380px] flex-col items-center gap-8">
        <Link to="/">
          <LogoMark size={52} />
        </Link>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-7">
          <div className="flex flex-col gap-[6px]">
            <h1 className="font-display text-[28px] font-bold text-foreground">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignup
                ? 'Start building your first case in minutes.'
                : 'Log in to continue your argument work.'}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <FormInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
            >
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? isSignup
                ? 'Creating account…'
                : 'Logging in…'
              : isSignup
                ? 'Create Account'
                : 'Log In'}
          </Button>

          {isSignup && (
            <p className="text-center text-[11.5px] leading-4 text-muted-foreground">
              By creating an account, you agree to the Terms of Service and Privacy Policy.
            </p>
          )}

          <div className="flex justify-center gap-1 text-[13px]">
            <span className="text-muted-foreground">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <Link to={isSignup ? '/login' : '/signup'} className="font-semibold text-primary">
              {isSignup ? 'Log in' : 'Sign up'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
