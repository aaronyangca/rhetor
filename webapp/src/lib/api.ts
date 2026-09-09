/**
 * Client for the Flask API.
 *
 * Auth is a session cookie, so every call sends credentials and there are no
 * tokens to manage. In development Vite proxies /api to the Flask dev server,
 * so this is always a same-origin request.
 */
import type {
  ApiKeys,
  ChatMessage,
  ModelCatalogue,
  Motion,
  MotionSummary,
  Provider,
  Stage,
  User,
} from './types'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }

  /** True when the session has expired or was never established. */
  get isUnauthorized(): boolean {
    return this.status === 401
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasBody = init.body !== undefined

  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch {
    // fetch only rejects on network failure; HTTP errors resolve normally.
    throw new ApiError('Could not reach the server. Is the API running?', 0, 'network_error')
  }

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const error = payload?.error
    throw new ApiError(
      error?.message ?? `Request failed (${response.status})`,
      response.status,
      error?.code ?? 'error',
    )
  }

  return payload as T
}


/** Text as it arrives, field by field. */
export interface StreamHandlers {
  onDelta: (field: 'reply' | 'document', text: string) => void
}

/**
 * Consume a Server-Sent Events turn.
 *
 * EventSource cannot POST, so this reads the response body directly. Frames
 * are `event:`/`data:` pairs separated by a blank line; a partial frame at the
 * end of a chunk is held back until the rest arrives.
 */
async function streamTurn(path: string, body: unknown, handlers: StreamHandlers): Promise<Motion> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Could not reach the server. Is the API running?', 0, 'network_error')
  }

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => null)
    const error = payload?.error
    throw new ApiError(
      error?.message ?? `Request failed (${response.status})`,
      response.status,
      error?.code ?? 'error',
    )
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let motion: Motion | null = null

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let split: number
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, split)
      buffer = buffer.slice(split + 2)

      let event = ''
      let data = ''
      for (const line of frame.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7)
        else if (line.startsWith('data: ')) data = line.slice(6)
      }
      if (!event || !data) continue

      const payload = JSON.parse(data)
      if (event === 'delta') handlers.onDelta(payload.field, payload.text)
      else if (event === 'done') motion = payload.motion as Motion
      else if (event === 'error') throw new ApiError(payload.message, 502, payload.code ?? 'error')
    }
  }

  if (!motion) {
    // The socket closed before the turn finished; the server persists nothing
    // in that case, so the caller should re-sync rather than assume.
    throw new ApiError('The connection closed before the reply was complete.', 0, 'stream_truncated')
  }
  return motion
}

const json = (body: unknown) => JSON.stringify(body)

export const api = {
  // --- auth ---------------------------------------------------------------
  me: () => request<User>('/auth/me'),

  signup: (email: string, password: string) =>
    request<User>('/auth/signup', { method: 'POST', body: json({ email, password }) }),

  login: (email: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: json({ email, password }) }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  // --- account ------------------------------------------------------------
  getKeys: () => request<ApiKeys>('/account/keys'),

  setKey: (provider: Provider, key: string) =>
    request<ApiKeys>(`/account/keys/${provider}`, { method: 'PUT', body: json({ key }) }),

  deleteKey: (provider: Provider) =>
    request<ApiKeys>(`/account/keys/${provider}`, { method: 'DELETE' }),

  getModels: () => request<ModelCatalogue>('/account/models'),

  // --- motions ------------------------------------------------------------
  listMotions: () => request<MotionSummary[]>('/motions'),

  getMotion: (id: string) => request<Motion>(`/motions/${id}`),

  createMotion: (provider: Provider, model?: string) =>
    request<Motion>('/motions', { method: 'POST', body: json({ provider, model }) }),

  renameMotion: (id: string, title: string) =>
    request<MotionSummary>(`/motions/${id}`, { method: 'PATCH', body: json({ title }) }),

  setModel: (id: string, model: string) =>
    request<MotionSummary>(`/motions/${id}`, { method: 'PATCH', body: json({ model }) }),

  setStage: (id: string, currentStage: Stage) =>
    request<MotionSummary>(`/motions/${id}`, { method: 'PATCH', body: json({ currentStage }) }),

  deleteMotion: (id: string) => request<void>(`/motions/${id}`, { method: 'DELETE' }),

  streamMessage: (id: string, content: string, handlers: StreamHandlers) =>
    streamTurn(`/motions/${id}/messages/stream`, { content }, handlers),

  streamAdvance: (id: string, handlers: StreamHandlers) =>
    streamTurn(`/motions/${id}/advance/stream`, {}, handlers),

  sendMessage: (id: string, content: string) =>
    request<{ userMessage: ChatMessage; assistantMessage: ChatMessage; motion: Motion }>(
      `/motions/${id}/messages`,
      { method: 'POST', body: json({ content }) },
    ),

  advanceStage: (id: string) =>
    request<Motion>(`/motions/${id}/advance`, { method: 'POST', body: json({}) }),

  /** A plain URL, so the browser can download it directly. */
  exportUrl: (id: string, stage: Stage, format: 'markdown' | 'pdf' = 'markdown') =>
    `/api/motions/${id}/export?format=${format}&stage=${stage}`,
}
