import COS from 'cos-js-sdk-v5'

import { appUploadTokenClient } from '@/api/appUpload'
import type {
  AppUploadFileKind,
  AppUploadTokenPayload,
  AppUploadTokenResult,
} from '@/types/upload'
import { buildPublicFileURL } from '@/utils/uploadUrl'

export interface AppUploadFileLike {
  path: string
  name: string
  size?: number
  body?: Blob
}

interface AppUploadRuntimeOptions {
  folder: string
  fileKind?: AppUploadFileKind
}

interface CosAuthorization {
  TmpSecretId: string
  TmpSecretKey: string
  SecurityToken: string
  StartTime: number
  ExpiredTime: number
}

interface CosClient {
  putObject(
    params: { Bucket: string; Region: string; Key: string; Body: Blob },
    callback: (error: Error | null) => void,
  ): void
}

type CosConstructor = new (options: {
  getAuthorization: (_options: unknown, callback: (authorization: CosAuthorization) => void) => void
}) => CosClient

export interface AppUploadRuntimeResult {
  url: string
  key: string
  token: AppUploadTokenResult
}

const CosClientConstructor = COS as unknown as CosConstructor

export async function uploadAppFileToCloud(
  file: AppUploadFileLike,
  options: AppUploadRuntimeOptions,
): Promise<AppUploadRuntimeResult> {
  const body = file.body ?? await resolveUploadBody(file.path)
  const fileSize = resolveFileSize(file.size, body)
  if (fileSize <= 0) {
    throw new Error('upload.file_invalid')
  }

  const payload: AppUploadTokenPayload = {
    folder: options.folder,
    file_name: file.name,
    file_size: fileSize,
    file_kind: options.fileKind || 'image',
  }
  const token = await appUploadTokenClient.create(payload)

  validateUploadTokenRule(payload, token.rule)

  if (token.provider !== 'cos') {
    throw new Error('Unsupported upload provider')
  }

  const cos = new CosClientConstructor({
    getAuthorization(_options, callback) {
      callback({
        TmpSecretId: token.credentials.tmp_secret_id,
        TmpSecretKey: token.credentials.tmp_secret_key,
        SecurityToken: token.credentials.session_token,
        StartTime: token.start_time,
        ExpiredTime: token.expired_time,
      })
    },
  })

  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      { Bucket: token.bucket, Region: token.region, Key: token.key, Body: body },
      (error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      },
    )
  })

  return {
    url: buildPublicFileURL(token.bucket_domain, token.bucket, token.region, token.key),
    key: token.key,
    token,
  }
}

async function resolveUploadBody(path: string): Promise<Blob> {
  if (readUploadRuntimePlatform() === 'app') {
    return readAppLocalFileAsBlob(path)
  }

  if (typeof fetch === 'function') {
    const response = await fetch(path)
    return response.blob()
  }

  throw new Error('upload.file_read_failed')
}

function readUploadRuntimePlatform(): 'h5' | 'app' {
  try {
    return uni.getSystemInfoSync().uniPlatform === 'app' ? 'app' : 'h5'
  } catch {
    return 'h5'
  }
}

function readAppLocalFileAsBlob(path: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof plus === 'undefined' || !plus.io?.resolveLocalFileSystemURL) {
      reject(new Error('upload.file_read_failed'))
      return
    }

    plus.io.resolveLocalFileSystemURL(
      path,
      (entry) => {
        const fileEntry = entry as unknown as PlusIoFileEntry
        if (!fileEntry.isFile || typeof fileEntry.file !== 'function') {
          reject(new Error('upload.file_read_failed'))
          return
        }
        fileEntry.file(
          (file) => readPlusFileAsDataURL(file).then((dataUrl) => resolve(dataURLToBlob(dataUrl))).catch(reject),
          () => reject(new Error('upload.file_read_failed')),
        )
      },
      () => reject(new Error('upload.file_read_failed')),
    )
  })
}

function readPlusFileAsDataURL(file: PlusIoFile): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new plus.io.FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
        resolve(reader.result)
        return
      }
      reject(new Error('upload.file_read_failed'))
    }
    reader.onerror = () => reject(new Error('upload.file_read_failed'))
    reader.readAsDataURL(file)
  })
}

function dataURLToBlob(dataUrl: string): Blob {
  const [header, base64 = ''] = dataUrl.split(',')
  const contentType = /^data:([^;]+)/.exec(header)?.[1] || 'application/octet-stream'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: contentType })
}

function resolveFileSize(size: number | undefined, body: Blob): number {
  if (typeof size === 'number' && size > 0) {
    return size
  }
  return body.size
}

function validateUploadTokenRule(payload: AppUploadTokenPayload, rule: AppUploadTokenResult['rule']): void {
  if (rule.max_size_mb > 0 && payload.file_size > rule.max_size_mb * 1024 * 1024) {
    throw new Error('upload.file_invalid')
  }

  const ext = payload.file_name.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const allowedExts = payload.file_kind === 'image' ? rule.image_exts : rule.file_exts
  if (!ext || !allowedExts.some((item) => item.toLowerCase() === ext)) {
    throw new Error('upload.file_invalid')
  }
}
