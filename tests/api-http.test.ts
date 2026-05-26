import { describe, expect, it } from 'vitest'

import { getAuthToken, parseApiResponse } from '../src/lib/http'
import type { ApiResponse } from '../src/types/api'

describe('app api http boundary', () => {
  it('unwraps successful unified response', () => {
    const response: ApiResponse<{ token: string }> = {
      code: 0,
      data: { token: 'jwt-token' },
      msg: 'ok',
    }

    expect(parseApiResponse(response)).toEqual({ token: 'jwt-token' })
  })

  it('throws backend message on non-zero response code', () => {
    const response: ApiResponse<null> = {
      code: 100,
      data: null,
      msg: '登录参数错误',
    }

    expect(() => parseApiResponse(response)).toThrow('登录参数错误')
  })

  it('reads bearer token from provided storage adapter', () => {
    expect(getAuthToken({ get: () => 'stored-token' })).toBe('stored-token')
  })
})
