import { i18n } from '@/i18n'
import { createAppPreferencesController } from '@/store/preferences'
import type { AppLocale, AppThemeMode } from '@/types/preferences'

function getStoredValue(key: string): string | null {
  const value = uni.getStorageSync(key)
  return typeof value === 'string' && value.trim() ? value : null
}

function syncTabBarLocale(): void {
  try {
    uni.setTabBarItem({ index: 0, text: i18n.global.t('tabbar.home') })
    uni.setTabBarItem({ index: 1, text: i18n.global.t('tabbar.mine') })
  } catch {
    // TabBar may be unavailable during early boot or in unit-like runtimes.
  }
}

function syncTabBarTheme(theme: AppThemeMode): void {
  try {
    uni.setTabBarStyle(theme === 'dark'
      ? {
          color: '#91a7c1',
          selectedColor: '#57d2ff',
          backgroundColor: '#101b2b',
          borderStyle: 'black',
        }
      : {
          color: '#7F97AF',
          selectedColor: '#2563EB',
          backgroundColor: '#ffffff',
          borderStyle: 'white',
        })
  } catch {
    // TabBar may be unavailable during early boot or in unit-like runtimes.
  }
}

function applyLocale(locale: AppLocale): void {
  ;(i18n.global.locale as unknown as { value: AppLocale }).value = locale
  syncTabBarLocale()
}

function applyTheme(theme: AppThemeMode): void {
  syncTabBarTheme(theme)
  if (typeof document === 'undefined') {
    return
  }
  const className = `theme-${theme}`
  document.documentElement.classList.remove('theme-light', 'theme-dark')
  document.body.classList.remove('theme-light', 'theme-dark')
  document.documentElement.classList.add(className)
  document.body.classList.add(className)
}

export const preferences = createAppPreferencesController({
  storage: {
    get: getStoredValue,
    set(key, value) {
      uni.setStorageSync(key, value)
    },
  },
  applyLocale,
  applyTheme,
})

export function usePreferences() {
  return preferences
}
