import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './state/AppContext'
import { Welcome } from './pages/Welcome'
import { Auth } from './pages/Auth'
import { Workspace } from './pages/Workspace'
import { AccountSettings } from './pages/AccountSettings'
import { Wordmark } from './components/Logo'

function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <Wordmark className="text-[26px]" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

/** Waits for the session check before deciding, so a reload doesn't flash the
 *  login page at an already-signed-in user. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, user } = useApp()
  if (!ready) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Signed-in users have no reason to see the login or signup forms. */
function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { ready, user } = useApp()
  if (!ready) return <Loading />
  if (user) return <Navigate to="/app" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route
            path="/signup"
            element={
              <RedirectIfAuthed>
                <Auth mode="signup" />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <Auth mode="login" />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <Workspace />
              </RequireAuth>
            }
          />
          <Route
            path="/app/settings"
            element={
              <RequireAuth>
                <AccountSettings />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
