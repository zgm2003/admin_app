import { CURRENT_USER_STORAGE_KEY, ACCESS_TOKEN_STORAGE_KEY } from '@/enums/storage'
import type { SessionStorageAdapter } from '@/store/session'
import type { AppUser } from '@/types/user'

function readJson<T>(key: string): T | null {
  const raw = uni.getStorageSync(key)
  if (typeof raw !== 'string' || !raw.trim()) {
    return null
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    uni.removeStorageSync(key)
    return null
  }
}

export const uniSessionStorage: SessionStorageAdapter = {
  getToken() {
    const token = uni.getStorageSync(ACCESS_TOKEN_STORAGE_KEY)
    return typeof token === 'string' && token.trim() ? token : null
  },
  setToken(token: string) {
    uni.setStorageSync(ACCESS_TOKEN_STORAGE_KEY, token)
  },
  getUser() {
    return readJson<AppUser>(CURRENT_USER_STORAGE_KEY)
  },
  setUser(user: AppUser) {
    uni.setStorageSync(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
  },
  clear() {
    uni.removeStorageSync(ACCESS_TOKEN_STORAGE_KEY)
    uni.removeStorageSync(CURRENT_USER_STORAGE_KEY)
  },
}
