import type { AppUser } from './user'

export type AppLoginType = 'password' | 'email' | 'phone'
export type AppCaptchaType = 'slide'
export type AppVerifyCodeScene = 'login'

export interface AppLoginTypeOption {
  label: string
  value: AppLoginType
}

export interface AppLoginConfig {
  login_type_arr: AppLoginTypeOption[]
  captcha_enabled: boolean
  captcha_type: AppCaptchaType
}

export interface AppSlideCaptchaAnswer {
  x: number
  y: number
}

export interface AppSlideCaptchaChallenge {
  captcha_id: string
  captcha_type: AppCaptchaType
  master_image: string
  tile_image: string
  tile_x: number
  tile_y: number
  tile_width: number
  tile_height: number
  image_width: number
  image_height: number
  expires_in: number
}

export interface AppLoginPayload {
  login_type: AppLoginType
  login_account: string
  password?: string
  code?: string
  captcha_id?: string
  captcha_answer?: AppSlideCaptchaAnswer
}

export interface AppSendCodePayload {
  account: string
  scene: AppVerifyCodeScene
}

export interface AppLoginResult {
  token: string
  user: AppUser
}
