import { describe, expect, it } from 'vitest'

import { createAppAuthClient } from '../src/api/appAuth'
import type { AppRequestOptions } from '../src/api/http'
import type { AppLoginResult } from '../src/types/auth'
import type { AppUser } from '../src/types/user'

describe('app auth api client', () => {
  it('posts password login to app auth login without bearer requirement', async () => {
    const calls: AppRequestOptions[] = []
    const requester = async <T>(options: AppRequestOptions): Promise<T> => {
      calls.push(options)
      return { token: 'app-token', user: { id: 1, nickname: '用户', avatar: '' } } as T
    }
    const client = createAppAuthClient(requester)

    const result = await client.login({ account: '15671628271', password: '123456' })

    expect(result.token).toBe('app-token')
    expect(calls[0]).toEqual({
      url: '/auth/login',
      method: 'POST',
      data: { account: '15671628271', password: '123456' },
      auth: false,
    })
  })

  it('gets the current app user with bearer auth', async () => {
    const calls: AppRequestOptions[] = []
    const requester = async <T>(options: AppRequestOptions): Promise<T> => {
      calls.push(options)
      return { id: 2, nickname: '当前用户', avatar: 'a.png' } as T
    }
    const client = createAppAuthClient(requester)

    const result = await client.me()

    expect(result.nickname).toBe('当前用户')
    expect(calls[0]).toEqual({ url: '/users/me', method: 'GET' })
  })

  it('posts logout and hides null response from callers', async () => {
    const calls: AppRequestOptions[] = []
    const requester = async <T>(options: AppRequestOptions): Promise<T> => {
      calls.push(options)
      return null as T
    }
    const client = createAppAuthClient(requester)

    await expect(client.logout()).resolves.toBeUndefined()

    expect(calls[0]).toEqual({ url: '/auth/logout', method: 'POST' })
  })
})
