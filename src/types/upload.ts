export type AppUploadProvider = 'cos'

export type AppUploadFileKind = 'image' | 'file'

export interface AppUploadTokenPayload {
  folder: string
  file_name: string
  file_size: number
  file_kind: AppUploadFileKind
}

export interface AppUploadCredentials {
  tmp_secret_id: string
  tmp_secret_key: string
  session_token: string
}

export interface AppUploadRule {
  max_size_mb: number
  image_exts: string[]
  file_exts: string[]
}

export interface AppUploadTokenResult {
  provider: AppUploadProvider
  bucket: string
  region: string
  key: string
  upload_path: string
  bucket_domain: string
  credentials: AppUploadCredentials
  start_time: number
  expired_time: number
  rule: AppUploadRule
}
