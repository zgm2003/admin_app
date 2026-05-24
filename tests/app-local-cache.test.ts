import { describe, expect, it } from 'vitest'

import { clearAppLocalCache, isClearableAppCacheKey } from '../src/utils/localCache'

function createStorage(keys: string[]) {
  const values = new Set(keys)
  return {
    keys: () => Array.from(values),
    remove: (key: string) => {
      values.delete(key)
    },
    has: (key: string) => values.has(key),
  }
}

describe('app local cache utilities', () => {
  it('only treats explicit app cache/tmp keys as clearable', () => {
    expect(isClearableAppCacheKey('admin_app:cache:home')).toBe(true)
    expect(isClearableAppCacheKey('admin_app:tmp:upload')).toBe(true)
    expect(isClearableAppCacheKey('admin_app:access_token')).toBe(false)
    expect(isClearableAppCacheKey('admin_app:current_user')).toBe(false)
    expect(isClearableAppCacheKey('admin_app:locale')).toBe(false)
    expect(isClearableAppCacheKey('admin_app:theme')).toBe(false)
  })

  it('clears cache without deleting session or preferences', () => {
    const storage = createStorage([
      'admin_app:access_token',
      'admin_app:current_user',
      'admin_app:locale',
      'admin_app:theme',
      'admin_app:cache:home',
      'admin_app:tmp:upload',
    ])

    expect(clearAppLocalCache(storage)).toEqual(['admin_app:cache:home', 'admin_app:tmp:upload'])
    expect(storage.has('admin_app:access_token')).toBe(true)
    expect(storage.has('admin_app:current_user')).toBe(true)
    expect(storage.has('admin_app:locale')).toBe(true)
    expect(storage.has('admin_app:theme')).toBe(true)
    expect(storage.has('admin_app:cache:home')).toBe(false)
    expect(storage.has('admin_app:tmp:upload')).toBe(false)
  })
})
