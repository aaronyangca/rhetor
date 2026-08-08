import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark } from '../components/Logo'
import { FormInput } from '../components/FormInput'
import { Button } from '../components/Button'
import { useApp } from '../state/AppContext'

export function Auth({ mode }: { mode: 'signup' | 'login' }) {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isSignup = mode === 'signup'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    login(email || 'you@example.com')
    navigate('/app')
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
              {isSignup ? 'Start building your first case in minutes.' : 'Log in to continue your argument work.'}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <FormInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {isSignup ? 'Create Account' : 'Log In'}
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
