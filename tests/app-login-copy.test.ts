import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('app login page mobile contract', () => {
  it('keeps the login page aligned with the PC mobile login structure', () => {
    const loginPage = readProjectFile('src/pages/login/index.vue')

    expect(loginPage).toContain('login-mobile-sheet')
    expect(loginPage).toContain('method-tabs')
    expect(loginPage).toContain('captcha-overlay')
    expect(loginPage).toContain('agreement-row')
    expect(loginPage).toContain('captchaSliderMax')
    expect(loginPage).toContain('x: Math.round(captchaSliderX.value)')
  })

  it('keeps login copy in both locales for visible mobile auth UI', () => {
    const zhCN = readProjectFile('src/locales/zh-CN.ts')
    const enUS = readProjectFile('src/locales/en-US.ts')

    for (const source of [zhCN, enUS]) {
      expect(source).toContain('loginTypes')
      expect(source).toContain('password')
      expect(source).toContain('email')
      expect(source).toContain('phone')
      expect(source).toContain('captchaTitle')
      expect(source).toContain('serviceAgreement')
      expect(source).toContain('privacyPolicy')
    }
  })
})
