import { describe, expect, it } from 'vitest'

import { resolveAppMediaPermissionPlan } from '../src/lib/platform/appMediaPermission'

describe('app media upload permissions', () => {
  it('does not request native permissions on H5', () => {
    expect(resolveAppMediaPermissionPlan({
      platform: 'h5',
      os: 'web',
      source: 'camera',
      mediaKind: 'image',
    })).toEqual({
      shouldShowRationale: false,
      shouldRequestNativePermission: false,
      permissions: [],
    })
  })

  it('requests camera permission before opening App camera', () => {
    expect(resolveAppMediaPermissionPlan({
      platform: 'app',
      os: 'android',
      androidSdkInt: 34,
      source: 'camera',
      mediaKind: 'image',
    })).toEqual({
      shouldShowRationale: true,
      shouldRequestNativePermission: true,
      permissions: ['android.permission.CAMERA'],
    })
  })

  it('uses Android 13 media permission for image album access', () => {
    expect(resolveAppMediaPermissionPlan({
      platform: 'app',
      os: 'android',
      androidSdkInt: 34,
      source: 'album',
      mediaKind: 'image',
    })).toEqual({
      shouldShowRationale: true,
      shouldRequestNativePermission: true,
      permissions: ['android.permission.READ_MEDIA_IMAGES'],
    })
  })

  it('uses legacy storage permission before Android 13', () => {
    expect(resolveAppMediaPermissionPlan({
      platform: 'app',
      os: 'android',
      androidSdkInt: 32,
      source: 'album',
      mediaKind: 'image',
    })).toEqual({
      shouldShowRationale: true,
      shouldRequestNativePermission: true,
      permissions: ['android.permission.READ_EXTERNAL_STORAGE'],
    })
  })
})
