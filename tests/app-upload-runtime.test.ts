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

  it('keeps avatar upload wired to COS runtime instead of local preview only', () => {
    const uploader = readProjectFile('src/components/AppUpload/src/AppAvatarUploader.vue')
    const runtime = readProjectFile('src/lib/appUploadRuntime.ts')

    expect(uploader).toContain('uploadAppFileToCloud')
    expect(uploader).toContain("folder: 'avatars'")
    expect(uploader).toContain("fileKind: 'image'")
    expect(uploader).toContain("emit('update:modelValue', uploaded.url)")
    expect(runtime).toContain("from 'cos-js-sdk-v5'")
    expect(runtime).toContain('cos.putObject')
    expect(runtime).toContain('buildPublicFileURL')
    expect(uploader).not.toContain('appUploadTokenClient.create')
  })
})
