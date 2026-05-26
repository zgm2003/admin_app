import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const srcRoot = join(process.cwd(), 'src')
const pagesJsonPath = `src/${'pages.json'}`

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf-8')
}

function aliasPath(segment: string): string {
  return `@/${segment}`
}

function sourcePath(segment: string): string {
  return `../src/${segment}`
}

describe('admin_app frontend architecture', () => {
  it('uses PC-admin-like top-level directory names', () => {
    for (const dir of [
      'api',
      'components',
      'enums',
      'hooks',
      'i18n',
      'lib',
      'platform',
      'router',
      'store',
      'types',
      'utils',
      'views',
    ]) {
      expect(existsSync(join(srcRoot, dir)), `${dir} should exist`).toBe(true)
    }

    for (const dir of ['composables', 'config', 'constants', 'locales', 'pages', 'plugins', 'stores']) {
      expect(existsSync(join(srcRoot, dir)), `${dir} should be migrated away`).toBe(false)
    }
  })

  it('routes UniApp pages through src/views', () => {
    const pages = JSON.parse(readProjectFile(pagesJsonPath)) as {
      pages: Array<{ path: string }>
      tabBar: { list: Array<{ pagePath: string; text: string }> }
    }

    expect(pages.pages.map((page) => page.path)).toEqual([
      'views/login/index',
      'views/home/index',
      'views/mine/index',
      'views/profile/edit',
      'views/settings/index',
    ])
    expect(pages.tabBar.list).toEqual([
      { pagePath: 'views/home/index', text: '首页' },
      { pagePath: 'views/mine/index', text: '我的' },
    ])
  })

  it('does not import through old architecture aliases', () => {
    const forbidden = [
      aliasPath('composables'),
      aliasPath('config'),
      aliasPath('constants'),
      aliasPath('locales'),
      aliasPath('plugins'),
      aliasPath('stores'),
      aliasPath('lib/platform'),
      aliasPath('lib/appUploadRuntime'),
      sourcePath('composables'),
      sourcePath('config'),
      sourcePath('constants'),
      sourcePath('locales'),
      sourcePath('plugins'),
      sourcePath('stores'),
    ]

    const filesToCheck = [
      'src/App.vue',
      'src/main.ts',
      'src/router/guards.ts',
      'src/api/appAuth.ts',
      'src/api/appProfile.ts',
      'src/api/appUpload.ts',
      'src/lib/http/index.ts',
      'src/hooks/useSession.ts',
      'src/hooks/usePreferences.ts',
      'src/components/AppMediaUploader/src/AppMediaUploader.vue',
      'tests/app-backend-base.test.ts',
      'tests/app-preferences.test.ts',
      'tests/session-controller.test.ts',
      'tests/uview-runtime.test.ts',
    ]

    for (const file of filesToCheck) {
      const content = readProjectFile(file)
      for (const oldPath of forbidden) {
        expect(content, `${file} must not contain ${oldPath}`).not.toContain(oldPath)
      }
    }
  })
})
