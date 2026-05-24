import {
  ACCESS_TOKEN_STORAGE_KEY,
  APP_LOCALE_STORAGE_KEY,
  APP_THEME_STORAGE_KEY,
  CURRENT_USER_STORAGE_KEY,
} from '@/constants/storage'

export interface LocalCacheStorageAdapter {
  keys(): string[]
  remove(key: string): void
}

const PROTECTED_STORAGE_KEYS = new Set([
  ACCESS_TOKEN_STORAGE_KEY,
  CURRENT_USER_STORAGE_KEY,
  APP_LOCALE_STORAGE_KEY,
  APP_THEME_STORAGE_KEY,
])

const CLEARABLE_CACHE_PREFIXES = ['admin_app:cache:', 'admin_app:tmp:']

export function isClearableAppCacheKey(key: string): boolean {
  return !PROTECTED_STORAGE_KEYS.has(key)
    && CLEARABLE_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))
}

export function clearAppLocalCache(storage: LocalCacheStorageAdapter): string[] {
  const removedKeys: string[] = []
  for (const key of storage.keys()) {
    if (!isClearableAppCacheKey(key)) {
      continue
    }
    storage.remove(key)
    removedKeys.push(key)
  }
  return removedKeys
}
