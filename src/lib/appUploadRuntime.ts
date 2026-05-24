import COS from 'cos-js-sdk-v5'

import { appUploadTokenClient } from '@/api/appUpload'
import type {
  AppUploadFileKind,
  AppUploadTokenPayload,
  AppUploadTokenResult,
} from '@/types/upload'
import { buildPublicFileURL } from '@/utils/uploadUrl'

interface AppUploadFileLike {
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
    params: { Bucket: string; Region: string; Key: string; Body: unknown },
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
  const payload: AppUploadTokenPayload = {
    folder: options.folder,
    file_name: file.name,
    file_size: fileSize,
    file_kind: options.fileKind || 'image',
  }
  const token = await appUploadTokenClient.create(payload)

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
      {
        Bucket: token.bucket,
        Region: token.region,
        Key: token.key,
        Body: body,
      },
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

async function resolveUploadBody(path: string): Promise<unknown> {
  if (typeof fetch === 'function') {
    const response = await fetch(path)
    return response.blob()
  }
  return path
}

function resolveFileSize(size: number | undefined, body: unknown): number {
  if (typeof size === 'number' && size > 0) {
    return size
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob && body.size > 0) {
    return body.size
  }
  return 0
}
