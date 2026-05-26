import { appRequest, type AppRequestOptions } from '@/lib/http'
import type { AppUploadTokenPayload, AppUploadTokenResult } from '@/types/upload'

export type AppUploadTokenRequester = <T>(options: AppRequestOptions) => Promise<T>

export function createAppUploadTokenClient(requester: AppUploadTokenRequester = appRequest) {
  return {
    create(payload: AppUploadTokenPayload): Promise<AppUploadTokenResult> {
      return requester<AppUploadTokenResult>({
        url: '/upload-tokens',
        method: 'POST',
        data: payload,
      })
    },
  }
}

export const appUploadTokenClient = createAppUploadTokenClient()
