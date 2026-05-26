import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

type PageEntry = {
  path: string
}

type TabBarEntry = {
  pagePath: string
  text: string
}

type PagesConfig = {
  pages: PageEntry[]
  tabBar: {
    list: TabBarEntry[]
  }
}

const pagesJsonPath = `src/${'pages.json'}`
const retiredStarterPagePath = ['src', 'pages', 'index', 'index.vue'].join('/')

function readPagesConfig(): PagesConfig {
  const raw = readFileSync(join(process.cwd(), pagesJsonPath), 'utf8')
  return JSON.parse(raw) as PagesConfig
}

describe('app routing baseline', () => {
  it('uses admin_app project identity instead of starter defaults', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { name: string }

    expect(packageJson.name).toBe('admin-app')
    expect(existsSync(join(process.cwd(), 'src/shime-uni.d.ts'))).toBe(false)
    expect(existsSync(join(process.cwd(), 'src/shim-uni.d.ts'))).toBe(true)
  })

  it('keeps login as the entry page, tabbar limited to home/mine, and detail pages outside tabbar', () => {
    const pagesConfig = readPagesConfig()
    const pagePaths = pagesConfig.pages.map((page) => page.path)

    expect(pagePaths.slice(0, 3)).toEqual([
      'views/login/index',
      'views/home/index',
      'views/mine/index',
    ])
    expect(pagePaths).toContain('views/profile/edit')
    expect(pagePaths).toContain('views/settings/index')
    expect(pagesConfig.tabBar.list).toEqual([
      { pagePath: 'views/home/index', text: '首页' },
      { pagePath: 'views/mine/index', text: '我的' },
    ])
  })

  it('removes unused starter page and logo asset', () => {
    expect(existsSync(join(process.cwd(), retiredStarterPagePath))).toBe(false)
    expect(existsSync(join(process.cwd(), 'src/static/logo.png'))).toBe(false)
  })
})
