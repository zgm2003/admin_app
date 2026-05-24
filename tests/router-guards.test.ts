import { computed, reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { createAuthGuards, HOME_PAGE, LOGIN_PAGE } from '../src/router/guards'

function createSessionStub(authenticated: boolean) {
  const state = reactive({
    authenticated,
    hydrateCalls: 0,
  })

  return {
    isAuthenticated: computed(() => state.authenticated),
    hydrate: vi.fn(async () => {
      state.hydrateCalls += 1
    }),
    setAuthenticated(nextValue: boolean) {
      state.authenticated = nextValue
    },
  }
}

describe('router auth guards', () => {
  it('redirects unauthenticated users to login page', async () => {
    const session = createSessionStub(false)
    const navigator = {
      reLaunch: vi.fn(),
      switchTab: vi.fn(),
    }
    const guards = createAuthGuards(session, navigator)

    const allowed = await guards.requireAuthenticatedPage()

    expect(allowed).toBe(false)
    expect(session.hydrate).toHaveBeenCalledTimes(1)
    expect(navigator.reLaunch).toHaveBeenCalledWith({ url: LOGIN_PAGE })
    expect(navigator.switchTab).not.toHaveBeenCalled()
  })

  it('allows authenticated users without redirecting', async () => {
    const session = createSessionStub(true)
    const navigator = {
      reLaunch: vi.fn(),
      switchTab: vi.fn(),
    }
    const guards = createAuthGuards(session, navigator)

    const allowed = await guards.requireAuthenticatedPage()

    expect(allowed).toBe(true)
    expect(session.hydrate).toHaveBeenCalledTimes(1)
    expect(navigator.reLaunch).not.toHaveBeenCalled()
  })

  it('uses switchTab for the home route', () => {
    const session = createSessionStub(true)
    const navigator = {
      reLaunch: vi.fn(),
      switchTab: vi.fn(),
    }
    const guards = createAuthGuards(session, navigator)

    guards.redirectToHome()

    expect(navigator.switchTab).toHaveBeenCalledWith({ url: HOME_PAGE })
  })
})
