import { describe, expect, it } from 'vitest'

import { createAppPreferencesController } from '../src/stores/preferences'
import type { AppLocale, AppThemeMode } from '../src/types/preferences'

function createMemoryPreferenceStorage(initial: Record<string, string> = {}) {
  const values = new Map<string, string>(Object.entries(initial))
  return {
    get(key: string) {
      return values.get(key) ?? null
    },
    set(key: string, value: string) {
      values.set(key, value)
    },
  }
}

describe('app preferences controller', () => {
  it('defaults to light theme and zh-CN locale', () => {
    const applied: Array<{ locale?: AppLocale; theme?: AppThemeMode }> = []
    const preferences = createAppPreferencesController({
      storage: createMemoryPreferenceStorage(),
      applyLocale: (locale) => applied.push({ locale }),
      applyTheme: (theme) => applied.push({ theme }),
    })

    preferences.hydrate()

    expect(preferences.state.locale).toBe('zh-CN')
    expect(preferences.state.theme).toBe('light')
    expect(preferences.themeClass.value).toBe('theme-light')
    expect(applied).toEqual([{ locale: 'zh-CN' }, { theme: 'light' }])
  })

  it('persists language and day/night theme changes', () => {
    const storage = createMemoryPreferenceStorage()
    const appliedLocales: AppLocale[] = []
    const appliedThemes: AppThemeMode[] = []
    const preferences = createAppPreferencesController({
      storage,
      applyLocale: (locale) => appliedLocales.push(locale),
      applyTheme: (theme) => appliedThemes.push(theme),
    })

    preferences.setLocale('en-US')
    preferences.setTheme('dark')

    expect(preferences.state.locale).toBe('en-US')
    expect(preferences.state.theme).toBe('dark')
    expect(preferences.themeClass.value).toBe('theme-dark')
    expect(storage.get('admin_app:locale')).toBe('en-US')
    expect(storage.get('admin_app:theme')).toBe('dark')
    expect(appliedLocales).toEqual(['en-US'])
    expect(appliedThemes).toEqual(['dark'])
  })

  it('ignores unsupported persisted values', () => {
    const preferences = createAppPreferencesController({
      storage: createMemoryPreferenceStorage({
        'admin_app:locale': 'fr-FR',
        'admin_app:theme': 'blue',
      }),
      applyLocale: () => undefined,
      applyTheme: () => undefined,
    })

    preferences.hydrate()

    expect(preferences.state.locale).toBe('zh-CN')
    expect(preferences.state.theme).toBe('light')
  })
})
