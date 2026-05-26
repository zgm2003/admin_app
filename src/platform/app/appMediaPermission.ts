import { i18n } from '@/i18n'

export type AppUploadRuntimePlatform = 'h5' | 'app'
export type AppUploadRuntimeOS = 'web' | 'android' | 'ios' | 'unknown'
export type AppMediaSource = 'album' | 'camera'
export type AppMediaKind = 'image' | 'video'
export type AppNativePermissionStatus = 'authorized' | 'denied' | 'undetermined' | 'notdeny' | 'unknown' | 'unsupported'

export interface AppMediaPermissionInput {
  platform: AppUploadRuntimePlatform
  os: AppUploadRuntimeOS
  source: AppMediaSource
  mediaKind: AppMediaKind
  androidSdkInt?: number
}

export interface AppMediaPermissionPlan {
  shouldShowRationale: boolean
  shouldRequestNativePermission: boolean
  permissions: string[]
}

interface AndroidPermissionResult {
  granted?: string[]
  deniedAlways?: string[]
  deniedPresent?: string[]
}

export function readAppRuntimePlatform(): AppUploadRuntimePlatform {
  try {
    return uni.getSystemInfoSync().uniPlatform === 'app' ? 'app' : 'h5'
  } catch {
    return 'h5'
  }
}

export function resolveAppMediaPermissionPlan(input: AppMediaPermissionInput): AppMediaPermissionPlan {
  if (input.platform === 'h5') {
    return { shouldShowRationale: false, shouldRequestNativePermission: false, permissions: [] }
  }

  if (input.os !== 'android') {
    return { shouldShowRationale: true, shouldRequestNativePermission: false, permissions: [] }
  }

  if (input.source === 'camera') {
    return { shouldShowRationale: true, shouldRequestNativePermission: true, permissions: ['android.permission.CAMERA'] }
  }

  const sdk = input.androidSdkInt || 0
  if (sdk >= 33) {
    return {
      shouldShowRationale: true,
      shouldRequestNativePermission: true,
      permissions: [input.mediaKind === 'video' ? 'android.permission.READ_MEDIA_VIDEO' : 'android.permission.READ_MEDIA_IMAGES'],
    }
  }

  return { shouldShowRationale: true, shouldRequestNativePermission: true, permissions: ['android.permission.READ_EXTERNAL_STORAGE'] }
}

export async function ensureAppMediaPermission(source: AppMediaSource, mediaKind: AppMediaKind): Promise<boolean> {
  const platform = readAppRuntimePlatform()
  if (platform !== 'app') {
    return true
  }

  const os = readAppRuntimeOS()
  if (os === 'ios') {
    const status = readIosMediaPermissionStatus(source)
    if (status === 'authorized') {
      return true
    }

    const confirmed = await showPermissionRationale(source)
    if (!confirmed) {
      return false
    }

    return status !== 'denied' && status !== 'unsupported'
  }

  const plan = resolveAppMediaPermissionPlan({
    platform,
    os,
    source,
    mediaKind,
    androidSdkInt: readAndroidSdkInt(),
  })

  if (plan.shouldRequestNativePermission && areAndroidPermissionsGranted(plan.permissions)) {
    return true
  }

  if (plan.shouldShowRationale) {
    const confirmed = await showPermissionRationale(source)
    if (!confirmed) {
      return false
    }
  }

  if (!plan.shouldRequestNativePermission || plan.permissions.length === 0) {
    return true
  }

  return requestAndroidPermissions(plan.permissions)
}

function readIosMediaPermissionStatus(source: AppMediaSource): AppNativePermissionStatus {
  const runtime = getPlusRuntime()
  const permissionName = source === 'camera'
    ? runtime?.navigator?.PermissionNames?.CAMERA || 'CAMERA'
    : runtime?.navigator?.PermissionNames?.GALLERY || 'GALLERY'

  if (!runtime?.navigator?.checkPermission || !permissionName) {
    return 'unknown'
  }

  return normalizePermissionStatus(
    runtime.navigator.checkPermission(permissionName as unknown as PlusNavigatorPermissionNames),
  )
}

function normalizePermissionStatus(status: string): AppNativePermissionStatus {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'authorized' || normalized === 'denied' || normalized === 'undetermined' || normalized === 'notdeny' || normalized === 'unknown' || normalized === 'unsupported') {
    return normalized
  }
  return 'unknown'
}

function readAppRuntimeOS(): AppUploadRuntimeOS {
  try {
    const system = uni.getSystemInfoSync()
    const name = (system.osName || system.platform || '').toLowerCase()
    if (name.includes('android')) return 'android'
    if (name.includes('ios')) return 'ios'
  } catch {
    // Fall through to plus.os below.
  }

  const runtime = getPlusRuntime()
  const plusName = runtime?.os?.name?.toLowerCase() || ''
  if (plusName.includes('android')) return 'android'
  if (plusName.includes('ios')) return 'ios'
  return 'unknown'
}

function readAndroidSdkInt(): number {
  const runtime = getPlusRuntime()
  if (!runtime?.android?.importClass) {
    return 0
  }

  try {
    const version = runtime.android.importClass('android.os.Build$VERSION') as { SDK_INT?: number } | undefined
    return Number(version?.SDK_INT || 0)
  } catch {
    return 0
  }
}

function areAndroidPermissionsGranted(permissions: string[]): boolean {
  const runtime = getPlusRuntime()
  if (!runtime?.android?.runtimeMainActivity || !runtime.android.invoke) {
    return false
  }

  try {
    const activity = runtime.android.runtimeMainActivity()
    return permissions.every((permission) => Number(runtime.android?.invoke?.(activity, 'checkSelfPermission', permission)) === 0)
  } catch {
    return false
  }
}

function requestAndroidPermissions(permissions: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const runtime = getPlusRuntime()
    if (!runtime?.android?.requestPermissions) {
      resolve(false)
      return
    }

    runtime.android.requestPermissions(
      permissions,
      (result: AndroidPermissionResult) => {
        resolve((result.deniedAlways || []).length === 0 && (result.deniedPresent || []).length === 0)
      },
      () => resolve(false),
    )
  })
}

function showPermissionRationale(source: AppMediaSource): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title: i18n.global.t('upload.permissionTitle'),
      content: i18n.global.t(source === 'camera' ? 'upload.cameraPermissionDesc' : 'upload.albumPermissionDesc'),
      confirmText: i18n.global.t('upload.permissionConfirm'),
      cancelText: i18n.global.t('common.cancel'),
      success: (result) => resolve(Boolean(result.confirm)),
      fail: () => resolve(false),
    })
  })
}

function getPlusRuntime(): Partial<Plus> | null {
  if (typeof plus === 'undefined') {
    return null
  }
  return plus
}
