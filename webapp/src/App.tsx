import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './state/AppContext'
import { Welcome } from './pages/Welcome'
import { Auth } from './pages/Auth'
import { Workspace } from './pages/Workspace'
import { AccountSettings } from './pages/AccountSettings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/app" element={<Workspace />} />
          <Route path="/app/settings" element={<AccountSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
