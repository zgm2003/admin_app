import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildPublicFileURL } from '../src/utils/uploadUrl'

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('app upload runtime', () => {
  it('builds COS public URLs with explicit or fallback domain', () => {
    expect(buildPublicFileURL('cos.example.test/', 'bucket-a', 'ap-nanjing', '/avatars/a b.png'))
      .toBe('https://cos.example.test/avatars/a%20b.png')
    expect(buildPublicFileURL('', 'bucket-a', 'ap-nanjing', 'avatars/avatar.png'))
      .toBe('https://bucket-a.cos.ap-nanjing.myqcloud.com/avatars/avatar.png')
  })

  it('keeps app media upload permission-gated and wired to COS runtime', () => {
    const uploader = readProjectFile('src/components/AppMediaUploader/src/AppMediaUploader.vue')
    const runtime = readProjectFile('src/lib/upload/appUploadRuntime.ts')
    const permission = readProjectFile('src/platform/app/appMediaPermission.ts')

    expect(uploader).toContain('<up-upload')
    expect(uploader).toContain(':auto-upload="false"')
    expect(uploader).toContain(':disabled="isUploadDisabled"')
    expect(uploader).toContain('ensureAppMediaPermission')
    expect(uploader).toContain('uploadAppFileToCloud')
    expect(uploader).toContain('<template #trigger>')
    expect(uploader).toContain('@tap.stop.prevent="handleChoose"')
    expect(uploader).toContain("t('upload.replace')")
    expect(uploader.indexOf('<template #trigger>')).toBeGreaterThan(uploader.indexOf('<up-upload'))
    expect(uploader.indexOf('<template #trigger>')).toBeLessThan(uploader.indexOf('</up-upload>'))
    expect(uploader).not.toContain('/>\n\n      <view\n        v-if="!hasFile && !pickerOpen"')
    expect(uploader).not.toContain('uni.chooseImage({')
    expect(uploader).not.toContain('wx.')
    expect(uploader).not.toContain('MP-WEIXIN')
    expect(permission).toContain('readAppRuntimePlatform')
    expect(permission).toContain('readIosMediaPermissionStatus')
    expect(permission).toContain('checkPermission')
    expect(permission).toContain('READ_MEDIA_IMAGES')
    expect(permission).toContain('READ_EXTERNAL_STORAGE')
    expect(permission).not.toContain(`import i18n from '${['@', 'locales'].join('/')}'`)
    expect(permission).not.toContain('declare const plus')
    expect(permission).not.toContain('// #ifdef H5')
    expect(runtime).toContain("from 'cos-js-sdk-v5'")
    expect(runtime).toContain('cos.putObject')
    expect(runtime).toContain('buildPublicFileURL')
    expect(runtime).toContain('readAppLocalFileAsBlob')
    expect(runtime).toContain('validateUploadTokenRule')
    expect(runtime).not.toContain(`// #ifdef APP-PLUS\n  return path`)
  })
})
