import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('admin_app platform scope', () => {
  it('advertises only H5 and App runtime targets', () => {
    const pkg = JSON.parse(readProjectFile('package.json')) as { scripts: Record<string, string> }
    const scriptNames = Object.keys(pkg.scripts)

    expect(scriptNames).toContain('dev:h5')
    expect(scriptNames).toContain('build:h5')
    expect(scriptNames).toContain('dev:app')
    expect(scriptNames).toContain('build:app')
    expect(scriptNames.some((name) => name.includes('mp-'))).toBe(false)
    expect(scriptNames.some((name) => name.includes('quickapp'))).toBe(false)
    expect(scriptNames.some((name) => name.includes('custom'))).toBe(false)
  })

  it('does not keep mini-program or quickapp manifest sections', () => {
    const manifest = readProjectFile('src/manifest.json')

    expect(manifest).toContain('"app-plus"')
    expect(manifest).not.toContain('"mp-weixin"')
    expect(manifest).not.toContain('"mp-alipay"')
    expect(manifest).not.toContain('"mp-baidu"')
    expect(manifest).not.toContain('"mp-toutiao"')
    expect(manifest).not.toContain('"quickapp"')
  })

  it('declares App camera and album permission metadata', () => {
    const manifest = readProjectFile('src/manifest.json')

    expect(manifest).toContain('android.permission.CAMERA')
    expect(manifest).toContain('android.permission.READ_MEDIA_IMAGES')
    expect(manifest).toContain('android.permission.READ_MEDIA_VIDEO')
    expect(manifest).toContain('android.permission.READ_EXTERNAL_STORAGE')
    expect(manifest).toContain('NSCameraUsageDescription')
    expect(manifest).toContain('NSPhotoLibraryUsageDescription')
  })

  it('documents H5 plus App instead of mini-program multi-end support', () => {
    const architecture = readProjectFile('docs/architecture.md')

    expect(architecture).toContain('H5 + App')
    expect(architecture).toContain('不做小程序')
    expect(architecture).not.toContain('App/H5/小程序多端基线')
  })
})
