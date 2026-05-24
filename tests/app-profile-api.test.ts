import { describe, expect, it } from 'vitest'

import { createAppProfileClient } from '../src/api/appProfile'
import { createAppUploadTokenClient } from '../src/api/appUpload'
import type { AppRequestOptions } from '../src/api/http'

describe('app profile and upload api clients', () => {
  it('uses the app profile namespace for current-user profile read and update', async () => {
    const calls: AppRequestOptions[] = []
    const requester = async <T>(options: AppRequestOptions): Promise<T> => {
      calls.push(options)
      if (options.method === 'PUT') {
        return { user: { id: 7, nickname: '移动端用户2', avatar: 'avatar2.png' } } as T
      }
      return {
        profile: {
          user_id: 7,
          nickname: '移动端用户',
          email: 'app@example.test',
          phone: '15671628271',
          avatar: 'avatar.png',
          sex: 1,
          birthday: '2026-05-24',
          address_id: 0,
          detail_address: '',
          bio: 'old bio',
        },
        dict: {
          sexArr: [{ label: '男', value: 1 }],
          auth_address_tree: [],
        },
      } as T
    }
    const client = createAppProfileClient(requester)

    const profile = await client.profile()
    const updated = await client.updateProfile({
      nickname: '移动端用户2',
      avatar: 'avatar2.png',
      sex: 2,
      birthday: '2026-05-25',
      address_id: 0,
      detail_address: '',
      bio: 'new bio',
    })

    expect(profile.profile.nickname).toBe('移动端用户')
    expect(updated.user.nickname).toBe('移动端用户2')
    expect(calls).toEqual([
      { url: '/profile', method: 'GET' },
      {
        url: '/profile',
        method: 'PUT',
        data: {
          nickname: '移动端用户2',
          avatar: 'avatar2.png',
          sex: 2,
          birthday: '2026-05-25',
          address_id: 0,
          detail_address: '',
          bio: 'new bio',
        },
      },
    ])
  })

  it('requests avatar upload credentials through the app namespace', async () => {
    const calls: AppRequestOptions[] = []
    const requester = async <T>(options: AppRequestOptions): Promise<T> => {
      calls.push(options)
      return {
        provider: 'cos',
        bucket: 'bucket-a',
        region: 'ap-nanjing',
        key: 'avatars/2026/05/24/avatar.png',
        upload_path: 'avatars/2026/05/24/',
        bucket_domain: 'cos.example.test',
        credentials: {
          tmp_secret_id: 'tmp-id',
          tmp_secret_key: 'tmp-key',
          session_token: 'session-token',
        },
        start_time: 100,
        expired_time: 200,
        rule: {
          max_size_mb: 2,
          image_exts: ['png', 'jpg'],
          file_exts: ['pdf'],
        },
      } as T
    }
    const client = createAppUploadTokenClient(requester)

    const result = await client.create({
      folder: 'avatars',
      file_name: 'avatar.png',
      file_size: 1024,
      file_kind: 'image',
    })

    expect(result.provider).toBe('cos')
    expect(calls[0]).toEqual({
      url: '/upload-tokens',
      method: 'POST',
      data: {
        folder: 'avatars',
        file_name: 'avatar.png',
        file_size: 1024,
        file_kind: 'image',
      },
    })
  })
})
