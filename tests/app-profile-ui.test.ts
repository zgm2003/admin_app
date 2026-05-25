import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('app profile/settings ui contract', () => {
  it('keeps Mine as an account hub instead of dumping forms into the tab page', () => {
    const minePage = readProjectFile('src/pages/mine/index.vue')

    expect(minePage).toContain('profileEntryTitle')
    expect(minePage).toContain('settingsEntryTitle')
    expect(minePage).toContain("uni.navigateTo({ url: '/pages/profile/edit' })")
    expect(minePage).toContain("uni.navigateTo({ url: '/pages/settings/index' })")
    expect(minePage).not.toContain('AppMediaUploader')
    expect(minePage).not.toContain('AppAvatarUploader')
    expect(minePage).not.toContain('handleSaveProfile')
    expect(minePage).not.toContain('setTheme(item.value)')
  })

  it('keeps profile edit and settings as independent pages', () => {
    const profileEditPage = readProjectFile('src/pages/profile/edit.vue')
    const settingsPage = readProjectFile('src/pages/settings/index.vue')
    const pages = readProjectFile('src/pages.json')

    expect(pages).toContain('pages/profile/edit')
    expect(pages).toContain('pages/settings/index')
    expect(profileEditPage).toContain('AppMediaUploader')
    expect(profileEditPage).toContain('folder="avatars"')
    expect(profileEditPage).toContain('media-kind="image"')
    expect(profileEditPage).toContain('handleSaveProfile')
    expect(profileEditPage).toContain('sexOptions')
    expect(profileEditPage).toContain('addressPickerOptions')
    expect(profileEditPage).toContain('profileForm.detail_address')
    expect(profileEditPage).toContain('profileForm.avatar.trim()')
    expect(settingsPage).toContain('setLocale(item.value)')
    expect(settingsPage).toContain('setTheme(item.value)')
    expect(settingsPage).toContain('handleClearCache')
    expect(settingsPage).toContain('clearAppLocalCache')
  })

  it('keeps Home and App default visual surface light-first', () => {
    const app = readProjectFile('src/App.vue')
    const homePage = readProjectFile('src/pages/home/index.vue')
    const pages = readProjectFile('src/pages.json')

    expect(app).toContain('theme-light')
    expect(app).toContain('--app-bg: #f6f8fc')
    expect(homePage).toContain('home-hero-card')
    expect(homePage).not.toContain('linear-gradient(180deg, #06111a')
    expect(pages).toContain('"backgroundColor": "#f6f8fc"')
    expect(pages).toContain('"backgroundColor": "#ffffff"')
  })

  it('keeps visible settings/profile/upload copy in both locales', () => {
    const zhCN = readProjectFile('src/locales/zh-CN.ts')
    const enUS = readProjectFile('src/locales/en-US.ts')

    for (const source of [zhCN, enUS]) {
      expect(source).toContain('settings')
      expect(source).toContain('profileEntryTitle')
      expect(source).toContain('settingsEntryTitle')
      expect(source).toContain('clearCache')
      expect(source).toContain('language')
      expect(source).toContain('themeMode')
      expect(source).toContain('editProfile')
      expect(source).toContain('saveProfile')
      expect(source).toContain('avatarUpload')
      expect(source).toContain('mediaUpload')
      expect(source).toContain('uploading')
      expect(source).toContain('uploadSuccess')
      expect(source).toContain('replace')
      expect(source).toContain('detailAddressPlaceholder')
      expect(source).toContain('addressPlaceholder')
      expect(source).toContain('notSet')
    }
  })
})
