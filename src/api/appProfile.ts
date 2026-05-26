import { appRequest, type AppRequestOptions } from '@/lib/http'
import type {
  AppProfileResponse,
  AppProfileUpdatePayload,
  AppProfileUpdateResult,
} from '@/types/user'

export type AppProfileRequester = <T>(options: AppRequestOptions) => Promise<T>

export function createAppProfileClient(requester: AppProfileRequester = appRequest) {
  return {
    profile(): Promise<AppProfileResponse> {
      return requester<AppProfileResponse>({ url: '/profile', method: 'GET' })
    },

    updateProfile(payload: AppProfileUpdatePayload): Promise<AppProfileUpdateResult> {
      return requester<AppProfileUpdateResult>({
        url: '/profile',
        method: 'PUT',
        data: payload,
      })
    },
  }
}

export const appProfileClient = createAppProfileClient()
