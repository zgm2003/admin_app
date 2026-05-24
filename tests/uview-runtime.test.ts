import { describe, expect, it, vi } from 'vitest'

import { createUViewRuntime, installUViewRuntime } from '../src/plugins/uview-runtime'

describe('uview runtime bootstrap', () => {
  it('creates a minimal $u runtime', () => {
    const runtime = createUViewRuntime()

    expect(runtime.color.mainColor).toBe('#303133')
    expect(runtime.theme.mode).toBe('light')
    expect(runtime.zIndex.popup).toBe(10075)
  })

  it('installs the runtime onto uni and app globals', () => {
    const app = {
      config: {
        globalProperties: {},
      },
    }
    const originalUni = globalThis.uni

    vi.stubGlobal('uni', {})

    installUViewRuntime(app)

    expect(globalThis.uni.$u).toBeDefined()
    expect(app.config.globalProperties.$u).toBeDefined()
    expect(app.config.globalProperties.$u).toBe(globalThis.uni.$u)

    vi.unstubAllGlobals()
    globalThis.uni = originalUni
  })
})
