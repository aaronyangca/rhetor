import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ApiKeyState, ChatMessage, Motion, Position, Provider } from '../lib/types'
import {
  advanceStageDoc,
  createMotionFromFirstMessage,
  mockAssistantReply,
  newMotionAssistantOpening,
  sampleMotions,
} from '../lib/mockData'

interface User {
  email: string
}

interface AppState {
  user: User | null
  login: (email: string) => void
  logout: () => void
  motions: Motion[]
  activeMotionId: string | null
  setActiveMotionId: (id: string | null) => void
  activeMotion: Motion | undefined
  createMotion: () => string
  sendMessage: (motionId: string, content: string) => void
  advanceStage: (motionId: string) => void
  renameMotion: (motionId: string, title: string) => void
  apiKeys: Record<Provider, ApiKeyState>
  connectKey: (provider: Provider) => void
}

const AppContext = createContext<AppState | null>(null)

let idCounter = 100
function nextId(): string {
  return `${idCounter++}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({ email: 'kampyang.ca@gmail.com' })
  const [motions, setMotions] = useState<Motion[]>(sampleMotions)
  const [activeMotionId, setActiveMotionId] = useState<string | null>(sampleMotions[0]?.id ?? null)
  const [apiKeys, setApiKeys] = useState<Record<Provider, ApiKeyState>>({
    openai: { connected: true, masked: 'sk-...a8f2' },
    anthropic: { connected: false, masked: null },
  })

  const activeMotion = motions.find((m) => m.id === activeMotionId)

  function login(email: string) {
    setUser({ email })
  }

  function logout() {
    setUser(null)
  }

  function createMotion(): string {
    const id = `m-new-${nextId()}`
    const motion: Motion = {
      id,
      title: 'New Motion',
      motionText: '',
      position: 'OG',
      provider: 'anthropic',
      currentStage: 1,
      stageDocs: { 1: null, 2: null, 3: null },
      messages: [{ id: nextId(), stage: 1, role: 'assistant', content: newMotionAssistantOpening() }],
      createdAt: new Date().toISOString(),
    }
    setMotions((prev) => [motion, ...prev])
    setActiveMotionId(id)
    return id
  }

  function sendMessage(motionId: string, content: string) {
    setMotions((prev) =>
      prev.map((m) => {
        if (m.id !== motionId) return m
        const userMsg: ChatMessage = {
          id: nextId(),
          stage: m.currentStage,
          role: 'user',
          content,
        }

        // First message on a brand-new motion: parse it as "motion + position"
        if (m.stageDocs[1] === null && m.messages.length === 1 && m.title === 'New Motion') {
          const positionMatch = content.match(/\b(OG|OO|CG|CO)\b/i)
          const position = (positionMatch?.[1]?.toUpperCase() as Position) ?? 'OG'
          const motionText = content.replace(/\b(OG|OO|CG|CO)\b/i, '').trim() || content
          const { title, stage1Doc } = createMotionFromFirstMessage(motionText, position)
          const assistantMsg: ChatMessage = {
            id: nextId(),
            stage: 1,
            role: 'assistant',
            content: `Got it — treating this as ${title} for ${position}. I've drafted the first round of seeds; see the document on the right.`,
          }
          return {
            ...m,
            title,
            motionText,
            position,
            stageDocs: { ...m.stageDocs, 1: stage1Doc },
            messages: [...m.messages, userMsg, assistantMsg],
          }
        }

        const assistantMsg: ChatMessage = {
          id: nextId(),
          stage: m.currentStage,
          role: 'assistant',
          content: mockAssistantReply(content, m.currentStage),
        }
        return { ...m, messages: [...m.messages, userMsg, assistantMsg] }
      }),
    )
  }

  function advanceStage(motionId: string) {
    setMotions((prev) =>
      prev.map((m) => {
        if (m.id !== motionId || m.currentStage === 3) return m
        const nextStage = (m.currentStage + 1) as 2 | 3
        const doc = advanceStageDoc(m.currentStage as 1 | 2, m.title, m.position)
        return {
          ...m,
          currentStage: nextStage,
          stageDocs: { ...m.stageDocs, [nextStage]: doc },
        }
      }),
    )
  }

  function renameMotion(motionId: string, title: string) {
    setMotions((prev) => prev.map((m) => (m.id === motionId ? { ...m, title } : m)))
  }

  function connectKey(provider: Provider) {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: { connected: true, masked: `sk-...${Math.random().toString(16).slice(2, 6)}` },
    }))
  }

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        motions,
        activeMotionId,
        setActiveMotionId,
        activeMotion,
        createMotion,
        sendMessage,
        advanceStage,
        renameMotion,
        apiKeys,
        connectKey,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
