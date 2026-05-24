import { computed, reactive, readonly } from 'vue'

import { APP_LOCALE_STORAGE_KEY, APP_THEME_STORAGE_KEY } from '@/constants/storage'
import type { AppLocale, AppThemeMode } from '@/types/preferences'

export interface PreferenceStorageAdapter {
  get(key: string): string | null | undefined
  set(key: string, value: string): void
}

export interface AppPreferencesControllerDeps {
  storage: PreferenceStorageAdapter
  applyLocale: (locale: AppLocale) => void
  applyTheme: (theme: AppThemeMode) => void
}

export interface AppPreferencesState {
  locale: AppLocale
  theme: AppThemeMode
}

function normalizeLocale(value: string | null | undefined): AppLocale {
  return value === 'en-US' ? 'en-US' : 'zh-CN'
}

function normalizeTheme(value: string | null | undefined): AppThemeMode {
  return value === 'dark' ? 'dark' : 'light'
}

export function createAppPreferencesController(deps: AppPreferencesControllerDeps) {
  const state = reactive<AppPreferencesState>({
    locale: 'zh-CN',
    theme: 'light',
  })

  const themeClass = computed(() => `theme-${state.theme}`)

  function applyCurrent(): void {
    deps.applyLocale(state.locale)
    deps.applyTheme(state.theme)
  }

  function hydrate(): void {
    state.locale = normalizeLocale(deps.storage.get(APP_LOCALE_STORAGE_KEY))
    state.theme = normalizeTheme(deps.storage.get(APP_THEME_STORAGE_KEY))
    applyCurrent()
  }

  function setLocale(locale: AppLocale): void {
    state.locale = locale
    deps.storage.set(APP_LOCALE_STORAGE_KEY, locale)
    deps.applyLocale(locale)
  }

  function setTheme(theme: AppThemeMode): void {
    state.theme = theme
    deps.storage.set(APP_THEME_STORAGE_KEY, theme)
    deps.applyTheme(theme)
  }

  return {
    state: readonly(state),
    themeClass,
    hydrate,
    setLocale,
    setTheme,
  }
}
