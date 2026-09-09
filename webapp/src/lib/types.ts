export type Position = 'OG' | 'OO' | 'CG' | 'CO'
export type Provider = 'openai' | 'anthropic' | 'gemini' | 'openrouter'
export type Stage = 1 | 2 | 3

export interface User {
  id: string
  email: string
  isAdmin: boolean
  createdAt: string
}

export interface ChatMessage {
  id: string
  stage: Stage
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ModelOption {
  id: string
  label: string
  blurb: string
  /** False for models a free API key cannot reach. */
  freeTier: boolean
}

export interface ProviderModels {
  default: string
  models: ModelOption[]
}

export type ModelCatalogue = Record<Provider, ProviderModels>

/** What the sidebar needs — no documents or messages. */
export interface MotionSummary {
  id: string
  title: string
  /** Null until the user's first reply names the motion and position. */
  position: Position | null
  provider: Provider
  model: string
  modelLabel: string
  currentStage: Stage
  createdAt: string
  updatedAt: string
}

/** The full motion, for the open workspace. */
export interface Motion extends MotionSummary {
  motionText: string | null
  stageDocs: Record<'1' | '2' | '3', string | null>
  messages: ChatMessage[]
}

export interface ApiKeyState {
  connected: boolean
  masked: string | null
}

export type ApiKeys = Record<Provider, ApiKeyState>

export const PROVIDERS: Provider[] = ['openai', 'anthropic', 'gemini', 'openrouter']

export const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  openrouter: 'OpenRouter',
}

/** Placeholder text for the key field. Google issues both `AIza...` and the
 *  newer `AQ...` keys, and both are accepted. */
export const PROVIDER_KEY_HINT: Record<Provider, string> = {
  openai: 'sk-…',
  anthropic: 'sk-ant-…',
  gemini: 'AIza… or AQ…',
  openrouter: 'sk-or-…',
}

export const POSITION_LABELS: Record<Position, string> = {
  OG: 'Opening Government',
  OO: 'Opening Opposition',
  CG: 'Closing Government',
  CO: 'Closing Opposition',
}
