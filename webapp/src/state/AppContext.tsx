import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, api } from '../lib/api'
import type {
  ApiKeys,
  ModelCatalogue,
  Motion,
  MotionSummary,
  Provider,
  Stage,
  User,
} from '../lib/types'
import { PROVIDERS } from '../lib/types'

const EMPTY_KEYS: ApiKeys = {
  openai: { connected: false, masked: null },
  anthropic: { connected: false, masked: null },
  gemini: { connected: false, masked: null },
}

interface AppState {
  /** False until the initial session check finishes — routes must wait. */
  ready: boolean
  user: User | null
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>

  motions: MotionSummary[]
  activeMotion: Motion | null
  activeMotionId: string | null
  selectMotion: (id: string | null) => void
  createMotion: (provider: Provider, model?: string) => Promise<string>
  deleteMotion: (id: string) => Promise<void>
  renameMotion: (id: string, title: string) => Promise<void>
  /** Resolves true when the turn is confirmed stored, false otherwise, so the
   *  composer can hand the user their text back instead of losing it. */
  sendMessage: (content: string) => Promise<boolean>
  advanceStage: () => Promise<void>
  goToStage: (stage: Stage) => Promise<void>
  setModel: (model: string) => Promise<void>

  /** Null until the catalogue has loaded. */
  catalogue: ModelCatalogue | null

  apiKeys: ApiKeys
  connectedProviders: Provider[]
  saveKey: (provider: Provider, key: string) => Promise<void>
  removeKey: (provider: Provider) => Promise<void>

  /** Text arriving from an in-flight turn, or null when nothing is streaming.
   *  The workspace shows this in place of the stored values while it runs. */
  streaming: { reply: string; document: string } | null

  loadingMotion: boolean
  sending: boolean
  advancing: boolean
  error: string | null
  clearError: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [motions, setMotions] = useState<MotionSummary[]>([])
  const [activeMotion, setActiveMotion] = useState<Motion | null>(null)
  const [activeMotionId, setActiveMotionId] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKeys>(EMPTY_KEYS)
  const [catalogue, setCatalogue] = useState<ModelCatalogue | null>(null)
  const [loadingMotion, setLoadingMotion] = useState(false)
  const [sending, setSending] = useState(false)
  const [streaming, setStreaming] = useState<{ reply: string; document: string } | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  /** An expired session isn't an error worth showing — the route guard bounces
   *  to /login on the next render. */
  const noteExpiredSession = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.isUnauthorized) setUser(null)
  }, [])

  /** For failures with no local handler: show them in the shared banner. */
  const report = useCallback(
    (err: unknown) => {
      noteExpiredSession(err)
      if (err instanceof ApiError) {
        if (!err.isUnauthorized) setError(err.message)
      } else {
        setError('Something went wrong.')
      }
      throw err
    },
    [noteExpiredSession],
  )

  /** For failures the caller renders itself — rethrow without touching the
   *  shared banner, so a handled error doesn't follow the user to another page. */
  const rethrow = useCallback(
    (err: unknown): never => {
      noteExpiredSession(err)
      throw err
    },
    [noteExpiredSession],
  )

  /** Reset everything a signed-in session owns. */
  const clearSession = useCallback(() => {
    setMotions([])
    setActiveMotion(null)
    setActiveMotionId(null)
    setApiKeys(EMPTY_KEYS)
    setCatalogue(null)
    setStreaming(null)
    setError(null)
  }, [])

  // Restore the session on load. A 401 here is the normal signed-out case.
  useEffect(() => {
    let cancelled = false
    api
      .me()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Load the signed-in user's motions and keys.
  useEffect(() => {
    if (!user) {
      clearSession()
      return
    }
    let cancelled = false
    Promise.all([api.listMotions(), api.getKeys(), api.getModels()])
      .then(([list, keys, models]) => {
        if (cancelled) return
        setMotions(list)
        setApiKeys(keys)
        setCatalogue(models)
        setActiveMotionId((current) => current ?? list[0]?.id ?? null)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your motions.')
      })
    return () => {
      cancelled = true
    }
  }, [user, clearSession])

  // Load the full motion whenever the selection changes. The list endpoint
  // returns summaries only, so documents and messages come from here.
  useEffect(() => {
    if (!activeMotionId) {
      setActiveMotion(null)
      return
    }
    let cancelled = false
    setLoadingMotion(true)
    api
      .getMotion(activeMotionId)
      .then((motion) => {
        if (cancelled) return
        setActiveMotion((prev) => {
          // A slow fetch must never clobber fresher state. `cancelled` only
          // covers the selection changing — it does not stop an in-flight
          // response from overwriting a turn that landed while it was open,
          // which would silently erase the message the user just sent.
          if (prev && prev.id === motion.id && prev.updatedAt >= motion.updatedAt) return prev
          return motion
        })
      })
      .catch((err) => {
        if (cancelled) return
        // Only blank the workspace when the motion is genuinely gone. A
        // transient failure used to null it out, which flashed the empty
        // state — logo and all — over a motion that was fine.
        if (err instanceof ApiError && err.status === 404) {
          setActiveMotion(null)
          setActiveMotionId(null)
        } else {
          setError('Could not load that motion.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMotion(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeMotionId])

  /** Fold an updated motion back into both the summary list and the open view. */
  const applyMotion = useCallback((motion: Motion) => {
    setActiveMotion(motion)
    setMotions((prev) => {
      const summary: MotionSummary = motion
      const without = prev.filter((m) => m.id !== motion.id)
      return [summary, ...without].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    })
  }, [])

  const signup = useCallback(
    async (email: string, password: string) => {
      setUser(await api.signup(email, password))
    },
    [],
  )

  const login = useCallback(async (email: string, password: string) => {
    setUser(await api.login(email, password))
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      setUser(null)
      clearSession()
    }
  }, [clearSession])

  const selectMotion = useCallback((id: string | null) => {
    setError(null)
    setActiveMotionId(id)
  }, [])

  const createMotion = useCallback(
    async (provider: Provider, model?: string) => {
      try {
        const motion = await api.createMotion(provider, model)
        applyMotion(motion)
        setActiveMotionId(motion.id)
        return motion.id
      } catch (err) {
        return report(err)
      }
    },
    [applyMotion, report],
  )

  const deleteMotion = useCallback(
    async (id: string) => {
      try {
        await api.deleteMotion(id)
        // Computed outside the updater: React may invoke an updater more than
        // once, so it must stay pure — nesting a setState inside one fired the
        // selection change twice under StrictMode.
        const remaining = motions.filter((m) => m.id !== id)
        setMotions(remaining)
        setActiveMotionId((current) => (current === id ? (remaining[0]?.id ?? null) : current))
      } catch (err) {
        report(err)
      }
    },
    [motions, report],
  )

  const renameMotion = useCallback(
    async (id: string, title: string) => {
      // Optimistic: renaming is instant and safe to roll back visually.
      const previous = motions
      setMotions((prev) => prev.map((m) => (m.id === id ? { ...m, title } : m)))
      setActiveMotion((prev) => (prev && prev.id === id ? { ...prev, title } : prev))
      try {
        await api.renameMotion(id, title)
      } catch (err) {
        setMotions(previous)
        report(err)
      }
    },
    [motions, report],
  )

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!activeMotion || sending) return false
      const motionId = activeMotion.id

      // Show the user's own message immediately; the server's copy replaces it.
      const pending = {
        id: `pending-${Date.now()}`,
        stage: activeMotion.currentStage,
        role: 'user' as const,
        content,
        createdAt: new Date().toISOString(),
      }
      setActiveMotion({ ...activeMotion, messages: [...activeMotion.messages, pending] })
      setSending(true)
      setError(null)

      try {
        // Streaming is refused for searching stages (409 no_streaming); those
        // fall back to the one-shot endpoint rather than failing.
        let motion: Motion
        try {
          setStreaming({ reply: '', document: '' })
          motion = await api.streamMessage(motionId, content, {
            onDelta: (field, text) =>
              setStreaming((prev) =>
                prev ? { ...prev, [field]: prev[field] + text } : prev,
              ),
          })
        } catch (streamErr) {
          if (streamErr instanceof ApiError && streamErr.code === 'no_streaming') {
            setStreaming(null)
            motion = (await api.sendMessage(motionId, content)).motion
          } else {
            throw streamErr
          }
        }
        applyMotion(motion)
        return true
      } catch (err) {
        // Whether the user's message survives depends on *why* this failed.
        //
        // A real HTTP error response means the backend handled the request and
        // rolled the turn back, so dropping the optimistic copy matches the
        // server. A network error means the request died in flight — the
        // server may well have finished and committed it, and generation calls
        // run long enough for that to be the common case. Guessing "it failed"
        // there is what threw away messages the server had already stored, so
        // ask the server instead of assuming.
        const serverAnswered = err instanceof ApiError && err.status > 0

        if (serverAnswered) {
          setActiveMotion((prev) =>
            prev && prev.id === motionId
              ? { ...prev, messages: prev.messages.filter((m) => m.id !== pending.id) }
              : prev,
          )
          setError((err as ApiError).message)
          return false
        }

        setError('Lost the connection before the reply arrived — checking whether it went through…')
        try {
          const fresh = await api.getMotion(motionId)
          applyMotion(fresh)
          // If the turn did land, there is nothing left to report.
          if (fresh.messages.some((m) => m.role === 'user' && m.content === content)) {
            setError(null)
            return true
          }
          setError('That message did not reach the server. Try sending it again.')
          return false
        } catch {
          setError(
            'Lost the connection to the server. Your message may still have gone ' +
              'through — reload to check.',
          )
          return false
        }
      } finally {
        setSending(false)
        setStreaming(null)
      }
    },
    [activeMotion, applyMotion, sending],
  )

  const advanceStage = useCallback(async () => {
    if (!activeMotion || advancing) return
    const motionId = activeMotion.id
    setAdvancing(true)
    setError(null)
    try {
      let motion: Motion
      try {
        setStreaming({ reply: '', document: '' })
        motion = await api.streamAdvance(motionId, {
          onDelta: (field, text) =>
            setStreaming((prev) => (prev ? { ...prev, [field]: prev[field] + text } : prev)),
        })
      } catch (streamErr) {
        if (streamErr instanceof ApiError && streamErr.code === 'no_streaming') {
          setStreaming(null)
          motion = await api.advanceStage(motionId)
        } else {
          throw streamErr
        }
      }
      applyMotion(motion)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Something went wrong.')
    } finally {
      setAdvancing(false)
      setStreaming(null)
    }
  }, [activeMotion, applyMotion, advancing])

  const goToStage = useCallback(
    async (stage: Stage) => {
      if (!activeMotion || activeMotion.currentStage === stage) return
      const previous = activeMotion
      setActiveMotion({ ...activeMotion, currentStage: stage })
      try {
        await api.setStage(activeMotion.id, stage)
        setMotions((prev) =>
          prev.map((m) => (m.id === previous.id ? { ...m, currentStage: stage } : m)),
        )
      } catch (err) {
        setActiveMotion(previous)
        if (err instanceof ApiError) setError(err.message)
      }
    },
    [activeMotion],
  )

  // The settings page renders these failures next to the field they came
  // from, so they must not also land in the workspace's shared banner.
  const setModel = useCallback(
    async (model: string) => {
      if (!activeMotion || activeMotion.model === model) return
      const previous = activeMotion
      // Optimistic: the choice only affects the next generation call, so a
      // failed switch costs nothing but the rollback.
      setActiveMotion({ ...activeMotion, model })
      try {
        const updated = await api.setModel(activeMotion.id, model)
        setActiveMotion((prev) =>
          prev && prev.id === updated.id
            ? { ...prev, model: updated.model, modelLabel: updated.modelLabel }
            : prev,
        )
        setMotions((prev) =>
          prev.map((m) =>
            m.id === updated.id
              ? { ...m, model: updated.model, modelLabel: updated.modelLabel }
              : m,
          ),
        )
      } catch (err) {
        setActiveMotion(previous)
        if (err instanceof ApiError) setError(err.message)
      }
    },
    [activeMotion],
  )

  const saveKey = useCallback(
    async (provider: Provider, key: string) => {
      try {
        setApiKeys(await api.setKey(provider, key))
      } catch (err) {
        rethrow(err)
      }
    },
    [rethrow],
  )

  const removeKey = useCallback(
    async (provider: Provider) => {
      try {
        setApiKeys(await api.deleteKey(provider))
      } catch (err) {
        rethrow(err)
      }
    },
    [rethrow],
  )

  const connectedProviders = useMemo(
    () => PROVIDERS.filter((p) => apiKeys[p].connected),
    [apiKeys],
  )

  const value: AppState = {
    ready,
    user,
    signup,
    login,
    logout,
    motions,
    activeMotion,
    activeMotionId,
    selectMotion,
    createMotion,
    deleteMotion,
    renameMotion,
    sendMessage,
    advanceStage,
    goToStage,
    setModel,
    catalogue,
    apiKeys,
    connectedProviders,
    saveKey,
    removeKey,
    streaming,
    loadingMotion,
    sending,
    advancing,
    error,
    clearError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
