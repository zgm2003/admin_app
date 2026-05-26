import { describe, expect, it } from 'vitest'

import viteConfig from '../vite.config'
import { resolveAppApiBaseUrl } from '../src/lib/http/env'

describe('app backend base url', () => {
  it('connects to the Go backend directly instead of using a Vite reverse proxy', () => {
    const proxy = viteConfig.server?.proxy

    expect(proxy?.['/api/app/v1']).toBeUndefined()
    expect(resolveAppApiBaseUrl()).toBe('http://192.168.5.20:8080/api/app/v1')
  })

  it('keeps deployment override configurable and trims trailing slash', () => {
    expect(resolveAppApiBaseUrl('https://api.example.test/api/app/v1/')).toBe(
      'https://api.example.test/api/app/v1'
    )
  })
})
