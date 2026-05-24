import { APP_API_BASE_URL } from '@/config/env'
import { ACCESS_TOKEN_STORAGE_KEY, APP_LOCALE_STORAGE_KEY } from '@/constants/storage'
import type { ApiResponse, RequestData, RequestMethod } from '@/types/api'

export interface StorageAdapter {
  get(key: string): string | null | undefined
}

export interface AppRequestOptions {
  url: string
  method?: RequestMethod
  data?: RequestData
  header?: Record<string, string>
  auth?: boolean
}

export class ApiResponseError extends Error {
  readonly code: number

  constructor(code: number, message: string) {
    super(message || '请求失败')
    this.name = 'ApiResponseError'
    this.code = code
  }
}

const uniStorageAdapter: StorageAdapter = {
  get(key: string) {
    const value = uni.getStorageSync(key)
    return typeof value === 'string' ? value : null
  },
}

export function getAuthToken(storage: StorageAdapter = uniStorageAdapter): string | null {
  const token = storage.get(ACCESS_TOKEN_STORAGE_KEY)?.trim()
  return token ? token : null
}

export function parseApiResponse<T>(response: ApiResponse<T>): T {
  if (response.code !== 0) {
    throw new ApiResponseError(response.code, response.msg)
  }
  return response.data
}

function buildRequestUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${APP_API_BASE_URL}${normalizedPath}`
}

function getRequestLocale(): 'zh-CN' | 'en-US' {
  try {
    const locale = uni.getStorageSync(APP_LOCALE_STORAGE_KEY)
    return locale === 'en-US' ? 'en-US' : 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

function normalizeResponse<T>(payload: unknown): ApiResponse<T> {
  if (!payload || typeof payload !== 'object') {
    throw new ApiResponseError(500, '响应格式错误')
  }
  const candidate = payload as Partial<ApiResponse<T>>
  if (typeof candidate.code !== 'number' || typeof candidate.msg !== 'string') {
    throw new ApiResponseError(500, '响应格式错误')
  }
  return candidate as ApiResponse<T>
}

export function appRequest<T>(options: AppRequestOptions): Promise<T> {
  const token = getAuthToken()
  const header: Record<string, string> = {
    'Accept-Language': getRequestLocale(),
    platform: 'app',
    ...(options.header ?? {}),
  }

  if (options.auth !== false && token) {
    header.Authorization = `Bearer ${token}`
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: buildRequestUrl(options.url),
      method: options.method ?? 'GET',
      data: options.data as UniApp.RequestOptions['data'],
      header,
      success(result) {
        try {
          resolve(parseApiResponse(normalizeResponse<T>(result.data)))
        } catch (error) {
          reject(error)
        }
      },
      fail(error) {
        reject(new ApiResponseError(500, error.errMsg || '网络请求失败'))
      },
    })
  })
}



