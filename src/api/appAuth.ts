import { appRequest, type AppRequestOptions } from './http'
import type { AppLoginPayload, AppLoginResult } from '@/types/auth'
import type { AppUser } from '@/types/user'

export type AppAuthRequester = <T>(options: AppRequestOptions) => Promise<T>

export function createAppAuthClient(requester: AppAuthRequester = appRequest) {
  return {
    login(payload: AppLoginPayload): Promise<AppLoginResult> {
      return requester<AppLoginResult>({
        url: '/auth/login',
        method: 'POST',
        data: payload,
        auth: false,
      })
    },

    me(): Promise<AppUser> {
      return requester<AppUser>({ url: '/users/me', method: 'GET' })
    },

    async logout(): Promise<void> {
      await requester<null>({ url: '/auth/logout', method: 'POST' })
    },
  }
}

export const appAuthClient = createAppAuthClient()
