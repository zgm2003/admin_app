import { describe, expect, it } from 'vitest'

import { createAppAuthClient } from '../src/api/appAuth'
import type { AppRequestOptions } from '../src/lib/http'
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

    const result = await client.login({
      login_type: 'password',
      login_account: '15671628271',
      password: '123456',
      captcha_id: 'captcha-id',
      captcha_answer: { x: 120, y: 80 },
    })

    expect(result.token).toBe('app-token')
    expect(calls[0]).toEqual({
      url: '/auth/login',
      method: 'POST',
      data: {
        login_type: 'password',
        login_account: '15671628271',
        password: '123456',
        captcha_id: 'captcha-id',
        captcha_answer: { x: 120, y: 80 },
      },
      auth: false,
    })
  })

  it('gets app login config and slide captcha through app auth namespace', async () => {
    const calls: AppRequestOptions[] = []
    const requester = async <T>(options: AppRequestOptions): Promise<T> => {
      calls.push(options)
      if (options.url === '/auth/login-config') {
        return {
          login_type_arr: [{ label: '密码登录', value: 'password' }],
          captcha_enabled: true,
          captcha_type: 'slide',
        } as T
      }
      return {
        captcha_id: 'captcha-id',
        captcha_type: 'slide',
        master_image: 'data:image/jpeg;base64,master',
        tile_image: 'data:image/png;base64,tile',
        tile_x: 7,
        tile_y: 53,
        tile_width: 62,
        tile_height: 62,
        image_width: 300,
        image_height: 220,
        expires_in: 120,
      } as T
    }
    const client = createAppAuthClient(requester)

    const config = await client.loginConfig()
    const captcha = await client.captcha()

    expect(config.captcha_enabled).toBe(true)
    expect(captcha.captcha_id).toBe('captcha-id')
    expect(calls).toEqual([
      { url: '/auth/login-config', method: 'GET', auth: false },
      { url: '/auth/captcha', method: 'GET', auth: false },
    ])
  })

  it('posts app send-code request without bearer requirement', async () => {
    const calls: AppRequestOptions[] = []
    const requester = async <T>(options: AppRequestOptions): Promise<T> => {
      calls.push(options)
      return null as T
    }
    const client = createAppAuthClient(requester)

    await expect(client.sendCode({ account: '15671628271', scene: 'login' })).resolves.toBeUndefined()

    expect(calls[0]).toEqual({
      url: '/auth/send-code',
      method: 'POST',
      data: { account: '15671628271', scene: 'login' },
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
