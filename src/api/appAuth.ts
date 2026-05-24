import { appRequest, type AppRequestOptions } from './http'
import type {
  AppLoginConfig,
  AppLoginPayload,
  AppLoginResult,
  AppSendCodePayload,
  AppSlideCaptchaChallenge,
} from '@/types/auth'
import type { AppUser } from '@/types/user'

export type AppAuthRequester = <T>(options: AppRequestOptions) => Promise<T>

export function createAppAuthClient(requester: AppAuthRequester = appRequest) {
  return {
    loginConfig(): Promise<AppLoginConfig> {
      return requester<AppLoginConfig>({ url: '/auth/login-config', method: 'GET', auth: false })
    },

    captcha(): Promise<AppSlideCaptchaChallenge> {
      return requester<AppSlideCaptchaChallenge>({ url: '/auth/captcha', method: 'GET', auth: false })
    },

    async sendCode(payload: AppSendCodePayload): Promise<void> {
      await requester<null>({
        url: '/auth/send-code',
        method: 'POST',
        data: payload,
        auth: false,
      })
    },

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
