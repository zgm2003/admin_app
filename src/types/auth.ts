import type { AppUser } from './user'

export interface AppLoginPayload {
  account: string
  password: string
}

export interface AppLoginResult {
  token: string
  user: AppUser
}
