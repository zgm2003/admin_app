import { computed, reactive, readonly } from 'vue'

import type { AppLoginPayload, AppLoginResult } from '@/types/auth'
import type { AppUser } from '@/types/user'

export type SessionStatus = 'checking' | 'guest' | 'authenticated'

export interface SessionStorageAdapter {
  getToken(): string | null
  setToken(token: string): void
  getUser(): AppUser | null
  setUser(user: AppUser): void
  clear(): void
}

export interface AppAuthClient {
  login(payload: AppLoginPayload): Promise<AppLoginResult>
  me(): Promise<AppUser>
  logout(): Promise<void>
}

export interface SessionState {
  token: string | null
  user: AppUser | null
  status: SessionStatus
  loading: boolean
  errorMessage: string | null
}

export interface SessionControllerDeps {
  client: AppAuthClient
  storage: SessionStorageAdapter
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return '会话状态异常'
}

export function createSessionController(deps: SessionControllerDeps) {
  const state = reactive<SessionState>({
    token: null,
    user: null,
    status: 'checking',
    loading: false,
    errorMessage: null,
  })

  const isAuthenticated = computed(() => state.status === 'authenticated' && !!state.token && !!state.user)

  function setGuest(): void {
    state.token = null
    state.user = null
    state.status = 'guest'
    deps.storage.clear()
  }

  function setAuthenticated(token: string, user: AppUser): void {
    state.token = token
    state.user = user
    state.status = 'authenticated'
    deps.storage.setToken(token)
    deps.storage.setUser(user)
  }

  async function hydrate(): Promise<void> {
    state.loading = true
    state.errorMessage = null
    const token = deps.storage.getToken()

    if (!token) {
      setGuest()
      state.loading = false
      return
    }

    state.token = token
    state.status = 'checking'
    try {
      const user = await deps.client.me()
      setAuthenticated(token, user)
    } catch (error) {
      state.errorMessage = toErrorMessage(error)
      setGuest()
    } finally {
      state.loading = false
    }
  }

  async function login(payload: AppLoginPayload): Promise<void> {
    state.loading = true
    state.errorMessage = null
    try {
      const result = await deps.client.login(payload)
      if (!result.token.trim() || result.user.id <= 0) {
        throw new Error('登录结果无效')
      }
      setAuthenticated(result.token, result.user)
    } catch (error) {
      state.errorMessage = toErrorMessage(error)
      throw error
    } finally {
      state.loading = false
    }
  }

  async function logout(): Promise<void> {
    state.loading = true
    state.errorMessage = null
    try {
      if (state.token) {
        await deps.client.logout()
      }
    } finally {
      setGuest()
      state.loading = false
    }
  }

  return {
    state: readonly(state),
    isAuthenticated,
    hydrate,
    login,
    logout,
  }
}
