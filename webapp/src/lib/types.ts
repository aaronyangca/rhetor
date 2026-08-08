export type Position = 'OG' | 'OO' | 'CG' | 'CO'
export type Provider = 'openai' | 'anthropic'

export interface ChatMessage {
  id: string
  stage: 1 | 2 | 3
  role: 'user' | 'assistant'
  content: string
}

export interface Motion {
  id: string
  title: string
  motionText: string
  position: Position
  provider: Provider
  currentStage: 1 | 2 | 3
  stageDocs: { 1: string | null; 2: string | null; 3: string | null }
  messages: ChatMessage[]
  createdAt: string
}

export interface ApiKeyState {
  connected: boolean
  masked: string | null
}
