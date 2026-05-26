import { describe, expect, it, vi } from 'vitest'

import { createSessionController } from '../src/store/session'
import type { AppAuthClient, SessionStorageAdapter } from '../src/store/session'
import type { AppUser } from '../src/types/user'

function createMemoryStorage(initialToken: string | null = null): SessionStorageAdapter {
  let token = initialToken
  let user: AppUser | null = null
  return {
    getToken: () => token,
    setToken: (nextToken) => {
      token = nextToken
    },
    getUser: () => user,
    setUser: (nextUser) => {
      user = nextUser
    },
    clear: () => {
      token = null
      user = null
    },
  }
}

describe('session controller', () => {
  it('hydrates as guest when no token exists', async () => {
    const client: AppAuthClient = {
      login: vi.fn(),
      me: vi.fn(),
      logout: vi.fn(),
    }
    const session = createSessionController({ client, storage: createMemoryStorage() })

    await session.hydrate()

    expect(session.state.status).toBe('guest')
    expect(session.state.user).toBeNull()
    expect(client.me).not.toHaveBeenCalled()
  })

  it('hydrates existing token by fetching current user', async () => {
    const user: AppUser = { id: 7, nickname: '移动端用户', avatar: 'avatar.png' }
    const client: AppAuthClient = {
      login: vi.fn(),
      me: vi.fn().mockResolvedValue(user),
      logout: vi.fn(),
    }
    const session = createSessionController({ client, storage: createMemoryStorage('jwt-token') })

    await session.hydrate()

    expect(session.state.status).toBe('authenticated')
    expect(session.state.token).toBe('jwt-token')
    expect(session.state.user).toEqual(user)
  })

  it('logs in and persists the app token plus current user', async () => {
    const user: AppUser = { id: 9, nickname: 'Admin App', avatar: '' }
    const storage = createMemoryStorage()
    const client: AppAuthClient = {
      login: vi.fn().mockResolvedValue({ token: 'new-token', user }),
      me: vi.fn(),
      logout: vi.fn(),
    }
    const session = createSessionController({ client, storage })

    await session.login({
      login_type: 'password',
      login_account: '15671628271',
      password: '123456',
      captcha_id: 'captcha-id',
      captcha_answer: { x: 120, y: 80 },
    })

    expect(storage.getToken()).toBe('new-token')
    expect(storage.getUser()).toEqual(user)
    expect(session.state.status).toBe('authenticated')
    expect(session.state.user).toEqual(user)
  })

  it('clears local state and storage on logout', async () => {
    const storage = createMemoryStorage('jwt-token')
    const client: AppAuthClient = {
      login: vi.fn(),
      me: vi.fn().mockResolvedValue({ id: 1, nickname: '用户', avatar: '' }),
      logout: vi.fn().mockResolvedValue(undefined),
    }
    const session = createSessionController({ client, storage })

    await session.hydrate()
    await session.logout()

    expect(storage.getToken()).toBeNull()
    expect(session.state.status).toBe('guest')
    expect(session.state.user).toBeNull()
    expect(client.logout).toHaveBeenCalledTimes(1)
  })
})
